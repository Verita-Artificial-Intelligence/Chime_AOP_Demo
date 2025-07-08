import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  WorkflowService, 
  WorkflowStep, 
  WorkflowExecutionState,
  SAMPLE_WORKFLOW_STEPS 
} from '../services/workflowService';
import { WebhookService } from '../services/webhookService';

interface UseWorkflowExecutionReturn {
  executionState: WorkflowExecutionState | null;
  startWorkflow: (steps?: WorkflowStep[]) => Promise<void>;
  handleStepUpdate: (stepNumber: number) => void;
  isLoading: boolean;
  error: string | null;
}

export function useWorkflowExecution(): UseWorkflowExecutionReturn {
  const [executionState, setExecutionState] = useState<WorkflowExecutionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Queue for incoming step updates
  const stepUpdateQueue = useRef<number[]>([]);
  const renderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process queued step updates at max 1 step per second
  const processStepQueue = useCallback(() => {
    if (stepUpdateQueue.current.length === 0 || !executionState) return;

    const nextStep = stepUpdateQueue.current.shift();
    if (nextStep) {
      setExecutionState(prev => 
        prev ? WorkflowService.updateStepCompletion(prev, nextStep) : prev
      );
    }
  }, [executionState]);

  // Fallback mechanism - mark next step complete every 5 seconds
  const fallbackStepCompletion = useCallback(() => {
    setExecutionState(prev => {
      if (!prev || prev.status !== 'running') return prev;

      // Check if we should activate fallback
      if (WorkflowService.shouldActivateFallback(prev)) {
        const nextStep = WorkflowService.getNextStep(prev);
        if (nextStep) {
          console.log(`Fallback: Auto-completing step ${nextStep.step}`);
          return {
            ...WorkflowService.updateStepCompletion(prev, nextStep.step),
            isInFallbackMode: true,
          };
        }
      }
      return prev;
    });
  }, []);

  // Start the workflow
  const startWorkflow = async (steps: WorkflowStep[] = SAMPLE_WORKFLOW_STEPS) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check webhook server health first
      const webhookHealthy = await WebhookService.checkWebhookServerHealth();
      if (!webhookHealthy) {
        console.warn('Webhook server not available, running in demo mode');
      }

      // Initialize execution state
      const workflowId = `workflow_${Date.now()}`;
      const initialState = WorkflowService.createExecutionState(workflowId, steps);
      setExecutionState({ ...initialState, status: 'running' });

      // Clear any existing queues
      stepUpdateQueue.current = [];

      // Subscribe to webhook updates if available
      let unsubscribe: (() => void) | null = null;
      if (webhookHealthy) {
        unsubscribe = WebhookService.subscribeToWorkflowUpdates(
          workflowId,
          (update) => {
            handleStepUpdate(update.step);
          }
        );
      }

      // Trigger the backend workflow
      const result = await WorkflowService.triggerWorkflow(steps);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start workflow');
      }

      // Start the step rendering interval (1 step per second)
      if (renderIntervalRef.current) {
        clearInterval(renderIntervalRef.current);
      }
      renderIntervalRef.current = setInterval(processStepQueue, 1000);

      // Start the fallback check interval
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
      fallbackIntervalRef.current = setInterval(fallbackStepCompletion, 1000);

      // Store unsubscribe function for cleanup
      if (unsubscribe) {
        (window as any).__workflowUnsubscribe = unsubscribe;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workflow');
      setExecutionState(prev => prev ? { ...prev, status: 'error' } : prev);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle incoming step updates from the backend
  const handleStepUpdate = useCallback((stepNumber: number) => {
    console.log(`Received step update: ${stepNumber}`);
    
    // Add to queue instead of processing immediately
    stepUpdateQueue.current.push(stepNumber);
    
    // Update last update time to prevent fallback
    setExecutionState(prev => 
      prev ? { ...prev, lastUpdateTime: Date.now(), isInFallbackMode: false } : prev
    );
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (renderIntervalRef.current) {
        clearInterval(renderIntervalRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, []);

  // Stop intervals when workflow completes
  useEffect(() => {
    if (executionState?.status === 'completed' || executionState?.status === 'error') {
      if (renderIntervalRef.current) {
        clearInterval(renderIntervalRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    }
  }, [executionState?.status]);

  return {
    executionState,
    startWorkflow,
    handleStepUpdate,
    isLoading,
    error,
  };
}