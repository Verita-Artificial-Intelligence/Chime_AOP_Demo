import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { WorkflowService, WorkflowStep, WorkflowExecutionState } from '../services/workflowService';
import { WebhookService } from '../services/webhookService';

interface WorkflowContextType {
  activeWorkflows: Map<string, WorkflowExecutionState>;
  startWorkflow: (workflowId: string, steps: WorkflowStep[], title: string) => Promise<void>;
  pauseWorkflow: (workflowId: string) => void;
  resumeWorkflow: (workflowId: string) => void;
  getWorkflow: (workflowId: string) => WorkflowExecutionState | undefined;
  hasActiveWorkflows: () => boolean;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkflows, setActiveWorkflows] = useState<Map<string, WorkflowExecutionState>>(new Map());
  const workflowIntervals = useRef<Map<string, { render: NodeJS.Timeout; fallback: NodeJS.Timeout }>>(new Map());
  const stepQueues = useRef<Map<string, number[]>>(new Map());
  const unsubscribes = useRef<Map<string, () => void>>(new Map());

  // Process step queue for a specific workflow
  const processStepQueue = useCallback((workflowId: string) => {
    const queue = stepQueues.current.get(workflowId) || [];
    if (queue.length === 0) return;

    const nextStep = queue.shift();
    if (nextStep) {
      console.log(`Processing step ${nextStep} for workflow ${workflowId}`);
      setActiveWorkflows(prev => {
        const newMap = new Map(prev);
        const workflow = newMap.get(workflowId);
        if (workflow && workflow.status === 'running') {
          const updated = WorkflowService.updateStepCompletion(workflow, nextStep);
          console.log(`Workflow ${workflowId} progress: ${updated.completedSteps.size}/${updated.steps.length}`);
          newMap.set(workflowId, updated);
        }
        return newMap;
      });
    }
  }, []);

  // Fallback mechanism for a specific workflow
  const fallbackStepCompletion = useCallback((workflowId: string) => {
    setActiveWorkflows(prev => {
      const newMap = new Map(prev);
      const workflow = newMap.get(workflowId);
      
      if (!workflow || workflow.status !== 'running') return prev;

      if (WorkflowService.shouldActivateFallback(workflow)) {
        const nextStep = WorkflowService.getNextStep(workflow);
        if (nextStep) {
          console.log(`Fallback: Auto-completing step ${nextStep.step} for workflow ${workflowId}`);
          const updated = {
            ...WorkflowService.updateStepCompletion(workflow, nextStep.step),
            isInFallbackMode: true,
          };
          newMap.set(workflowId, updated);
        }
      }
      return newMap;
    });
  }, []);

  // Start a new workflow
  const startWorkflow = async (workflowId: string, steps: WorkflowStep[], title: string) => {
    try {
      // Check webhook server health
      const webhookHealthy = await WebhookService.checkWebhookServerHealth();
      if (!webhookHealthy) {
        console.warn('Webhook server not available, running in demo mode');
      }

      // Initialize execution state
      const initialState = WorkflowService.createExecutionState(workflowId, steps);
      const runningState = { ...initialState, status: 'running' as const, title, startTime: Date.now() };
      
      setActiveWorkflows(prev => {
        const newMap = new Map(prev);
        newMap.set(workflowId, runningState);
        return newMap;
      });

      // Initialize step queue
      stepQueues.current.set(workflowId, []);

      // Subscribe to webhook updates if available
      if (webhookHealthy) {
        const unsubscribe = WebhookService.subscribeToWorkflowUpdates(
          workflowId,
          (update) => {
            const queue = stepQueues.current.get(workflowId) || [];
            queue.push(update.step);
            stepQueues.current.set(workflowId, queue);
            
            // Update last update time to prevent fallback
            setActiveWorkflows(prev => {
              const newMap = new Map(prev);
              const workflow = newMap.get(workflowId);
              if (workflow) {
                newMap.set(workflowId, { ...workflow, lastUpdateTime: Date.now(), isInFallbackMode: false });
              }
              return newMap;
            });
          }
        );
        unsubscribes.current.set(workflowId, unsubscribe);
      }

      // Trigger the backend workflow
      const result = await WorkflowService.triggerWorkflow(steps);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start workflow');
      }

      // Set up intervals for this workflow
      const renderInterval = setInterval(() => processStepQueue(workflowId), 1000);
      const fallbackInterval = setInterval(() => fallbackStepCompletion(workflowId), 1000);
      
      workflowIntervals.current.set(workflowId, {
        render: renderInterval,
        fallback: fallbackInterval
      });

      // If webhook is not available, start demo mode immediately
      if (!webhookHealthy) {
        // Simulate step completion by adding all steps to the queue
        const queue = [];
        for (const step of steps) {
          queue.push(step.step);
        }
        stepQueues.current.set(workflowId, queue);
      }

    } catch (err) {
      console.error(`Failed to start workflow ${workflowId}:`, err);
      setActiveWorkflows(prev => {
        const newMap = new Map(prev);
        const workflow = newMap.get(workflowId);
        if (workflow) {
          newMap.set(workflowId, { ...workflow, status: 'error' });
        }
        return newMap;
      });
    }
  };

  // Pause a workflow
  const pauseWorkflow = (workflowId: string) => {
    setActiveWorkflows(prev => {
      const newMap = new Map(prev);
      const workflow = newMap.get(workflowId);
      if (workflow && workflow.status === 'running') {
        newMap.set(workflowId, { ...workflow, status: 'paused' });
      }
      return newMap;
    });
  };

  // Resume a workflow
  const resumeWorkflow = (workflowId: string) => {
    setActiveWorkflows(prev => {
      const newMap = new Map(prev);
      const workflow = newMap.get(workflowId);
      if (workflow && workflow.status === 'paused') {
        newMap.set(workflowId, { ...workflow, status: 'running' });
      }
      return newMap;
    });
  };

  // Get a specific workflow
  const getWorkflow = (workflowId: string) => {
    return activeWorkflows.get(workflowId);
  };

  // Check if there are active workflows
  const hasActiveWorkflows = () => {
    for (const [_, workflow] of activeWorkflows) {
      if (workflow.status === 'running' || workflow.status === 'paused') {
        return true;
      }
    }
    return false;
  };

  // Monitor workflow completion and cleanup
  useEffect(() => {
    activeWorkflows.forEach((workflow, workflowId) => {
      if (workflow.status === 'completed' || workflow.status === 'error') {
        // Clean up intervals
        const intervals = workflowIntervals.current.get(workflowId);
        if (intervals) {
          clearInterval(intervals.render);
          clearInterval(intervals.fallback);
          workflowIntervals.current.delete(workflowId);
        }

        // Clean up webhook subscription
        const unsubscribe = unsubscribes.current.get(workflowId);
        if (unsubscribe) {
          unsubscribe();
          unsubscribes.current.delete(workflowId);
        }

        // Clean up step queue
        stepQueues.current.delete(workflowId);

        // Save to history if completed
        if (workflow.status === 'completed') {
          const history = JSON.parse(localStorage.getItem('workflowRunHistory') || '[]');
          const newRun = {
            id: workflowId,
            name: workflow.title || 'Workflow Execution',
            description: `Completed workflow with ${workflow.steps.length} steps`,
            category: 'WORKFLOW',
            status: 'Completed',
            lastRun: new Date().toISOString(),
            runHistory: [{
              timestamp: new Date().toISOString(),
              status: 'Success',
              details: `Workflow completed with ${workflow.steps.length} steps`
            }],
            steps: workflow.steps
          };
          history.unshift(newRun);
          localStorage.setItem('workflowRunHistory', JSON.stringify(history));
        }
      }
    });
  }, [activeWorkflows]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all intervals
      workflowIntervals.current.forEach(intervals => {
        clearInterval(intervals.render);
        clearInterval(intervals.fallback);
      });

      // Clear all webhook subscriptions
      unsubscribes.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        activeWorkflows,
        startWorkflow,
        pauseWorkflow,
        resumeWorkflow,
        getWorkflow,
        hasActiveWorkflows
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}