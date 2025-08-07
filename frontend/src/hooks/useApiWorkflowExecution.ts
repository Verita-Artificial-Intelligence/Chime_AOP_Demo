import { useState, useEffect, useRef, useCallback } from 'react';
import { DisputeApiService, WorkflowStatusResponse } from '../services/disputeApiService';
import { notificationService } from '../services/notificationService';

export interface WorkflowExecutionState {
  workflowRunId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  action: 'start' | 'pause' | 'resume';
  disputeCode?: string;
  steps: Array<{
    id: string;
    status: 'completed' | 'pending';
  }>;
  lastUpdate: Date;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface UseApiWorkflowExecutionReturn {
  executionState: WorkflowExecutionState | null;
  startWorkflow: (workflowRunId: string) => Promise<void>;
  pauseWorkflow: () => Promise<void>;
  resumeWorkflow: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
}

export function useApiWorkflowExecution(): UseApiWorkflowExecutionReturn {
  const [executionState, setExecutionState] = useState<WorkflowExecutionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const pollingIntervalRef = useRef<number | null>(null);
  const currentWorkflowRunId = useRef<string | null>(null);

  // Convert API response to our state format
  const convertApiResponseToState = useCallback((
    workflowRunId: string,
    response: WorkflowStatusResponse
  ): WorkflowExecutionState => {
    const completedSteps = response.workflowDtoStatus.filter(step => step.status === 'completed').length;
    const totalSteps = response.workflowDtoStatus.length;
    
    return {
      workflowRunId,
      status: response.action === 'start' ? 'running' : 
              response.action === 'pause' ? 'paused' : 'running',
      action: response.action,
      disputeCode: response.dispute_code,
      steps: response.workflowDtoStatus,
      lastUpdate: new Date(),
      progress: {
        completed: completedSteps,
        total: totalSteps,
        percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      },
    };
  }, []);

  // Fetch workflow status from API
  const fetchWorkflowStatus = useCallback(async (workflowRunId: string): Promise<void> => {
    try {
      const result = await DisputeApiService.safeApiCall(
        () => DisputeApiService.getWorkflowStatus(workflowRunId),
        'Fetch Workflow Status'
      );

      if (result.success) {
        const newState = convertApiResponseToState(workflowRunId, result.data);
        
        setExecutionState(prevState => {
          // Check if workflow is completed
          const allStepsCompleted = result.data.workflowDtoStatus.every(step => step.status === 'completed');
          if (allStepsCompleted) {
            newState.status = 'completed';
          }
          
          // Only update if there are actual changes
          if (!prevState || 
              prevState.progress.completed !== newState.progress.completed ||
              prevState.status !== newState.status) {
            return newState;
          }
          
          return prevState;
        });
        
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workflow status';
      setError(errorMessage);
    }
  }, [convertApiResponseToState]);

  // Start polling for status updates
  const startPolling = useCallback((workflowRunId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    currentWorkflowRunId.current = workflowRunId;

    // Initial fetch
    fetchWorkflowStatus(workflowRunId);

    // Set up polling interval (every 3 seconds)
    pollingIntervalRef.current = setInterval(() => {
      if (currentWorkflowRunId.current === workflowRunId) {
        fetchWorkflowStatus(workflowRunId);
      }
    }, 3000);
  }, [fetchWorkflowStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    currentWorkflowRunId.current = null;
  }, []);

  // Start workflow execution
  const startWorkflow = async (workflowRunId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await DisputeApiService.safeApiCall(
        () => DisputeApiService.executeWorkflowAction('start', workflowRunId),
        'Start Workflow'
      );

      if (result.success) {
        notificationService.success(
          'Workflow Started',
          `Workflow ${workflowRunId} has been started successfully.`
        );
        
        // Start polling for status updates
        startPolling(workflowRunId);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start workflow';
      setError(errorMessage);
      notificationService.error('Workflow Start Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Pause workflow execution
  const pauseWorkflow = async (): Promise<void> => {
    if (!executionState?.workflowRunId) return;

    setIsLoading(true);
    try {
      const result = await DisputeApiService.safeApiCall(
        () => DisputeApiService.executeWorkflowAction('pause', executionState.workflowRunId),
        'Pause Workflow'
      );

      if (result.success) {
        setExecutionState(prev => prev ? { ...prev, status: 'paused', action: 'pause' } : prev);
        notificationService.info('Workflow Paused', 'The workflow has been paused.');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause workflow';
      setError(errorMessage);
      notificationService.error('Pause Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resume workflow execution
  const resumeWorkflow = async (): Promise<void> => {
    if (!executionState?.workflowRunId) return;

    setIsLoading(true);
    try {
      const result = await DisputeApiService.safeApiCall(
        () => DisputeApiService.executeWorkflowAction('resume', executionState.workflowRunId),
        'Resume Workflow'
      );

      if (result.success) {
        setExecutionState(prev => prev ? { ...prev, status: 'running', action: 'resume' } : prev);
        notificationService.info('Workflow Resumed', 'The workflow has been resumed.');
        
        // Resume polling if not already active
        if (!isPolling && executionState.workflowRunId) {
          startPolling(executionState.workflowRunId);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume workflow';
      setError(errorMessage);
      notificationService.error('Resume Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Manually refresh status
  const refreshStatus = async (): Promise<void> => {
    if (!executionState?.workflowRunId) return;
    
    await fetchWorkflowStatus(executionState.workflowRunId);
  };

  // Stop polling when workflow completes or component unmounts
  useEffect(() => {
    if (executionState?.status === 'completed' || executionState?.status === 'error') {
      stopPolling();
      
      if (executionState.status === 'completed') {
        notificationService.successWithAction(
          'Workflow Completed!',
          `All ${executionState.progress.total} steps have been completed successfully.`,
          'View Details',
          () => {
            // This could navigate to a detailed view
            console.log('Navigate to workflow details');
          }
        );
      }
    }
  }, [executionState?.status, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    executionState,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    refreshStatus,
    isLoading,
    error,
    isPolling,
  };
}
