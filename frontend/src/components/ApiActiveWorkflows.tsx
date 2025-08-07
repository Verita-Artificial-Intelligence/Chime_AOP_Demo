import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useApiWorkflowExecution } from "../hooks/useApiWorkflowExecution";
import { notificationService } from "../services/notificationService";

interface ActiveWorkflow {
  workflowRunId: string;
  workflowName: string;
  disputeCode?: string;
  status: 'running' | 'paused' | 'completed' | 'error' | 'idle';
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  startedAt: Date;
  lastUpdate: Date;
}

export const ApiActiveWorkflows: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    searchParams.get('id')
  );
  
  const {
    executionState,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    refreshStatus,
    isLoading,
    error,
    isPolling
  } = useApiWorkflowExecution();

  // Load active workflows from localStorage (temporary until we have a backend endpoint for this)
  useEffect(() => {
    const loadActiveWorkflows = () => {
      try {
        const stored = localStorage.getItem('apiActiveWorkflows');
        if (stored) {
          const workflows = JSON.parse(stored);
          // Convert date strings back to Date objects
          const processedWorkflows = workflows.map((w: any) => ({
            ...w,
            startedAt: new Date(w.startedAt),
            lastUpdate: new Date(w.lastUpdate),
          }));
          setActiveWorkflows(processedWorkflows);
        }
      } catch (e) {
        console.error('Failed to load active workflows:', e);
      }
    };

    loadActiveWorkflows();
  }, []);

  // Save active workflows to localStorage
  const saveActiveWorkflows = (workflows: ActiveWorkflow[]) => {
    try {
      localStorage.setItem('apiActiveWorkflows', JSON.stringify(workflows));
      setActiveWorkflows(workflows);
    } catch (e) {
      console.error('Failed to save active workflows:', e);
    }
  };

  // Add a new workflow to the active list
  const addActiveWorkflow = (workflow: ActiveWorkflow) => {
    const updatedWorkflows = [...activeWorkflows, workflow];
    saveActiveWorkflows(updatedWorkflows);
  };

  // Update an existing workflow in the active list
  const updateActiveWorkflow = (workflowRunId: string, updates: Partial<ActiveWorkflow>) => {
    const updatedWorkflows = activeWorkflows.map(w => 
      w.workflowRunId === workflowRunId ? { ...w, ...updates } : w
    );
    saveActiveWorkflows(updatedWorkflows);
  };

  // Remove a workflow from the active list
  const removeActiveWorkflow = (workflowRunId: string) => {
    const updatedWorkflows = activeWorkflows.filter(w => w.workflowRunId !== workflowRunId);
    saveActiveWorkflows(updatedWorkflows);
  };

  // Update the active workflow when execution state changes
  useEffect(() => {
    if (executionState) {
      updateActiveWorkflow(executionState.workflowRunId, {
        status: executionState.status,
        progress: executionState.progress,
        lastUpdate: executionState.lastUpdate,
      });
    }
  }, [executionState]);

  // Handle workflow actions
  const handleStartWorkflow = async (workflowRunId: string) => {
    try {
      await startWorkflow(workflowRunId);
      setSelectedWorkflowId(workflowRunId);
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  const handlePauseWorkflow = async () => {
    try {
      await pauseWorkflow();
    } catch (error) {
      console.error('Failed to pause workflow:', error);
    }
  };

  const handleResumeWorkflow = async () => {
    try {
      await resumeWorkflow();
    } catch (error) {
      console.error('Failed to resume workflow:', error);
    }
  };

  const handleStopWorkflow = (workflowRunId: string, workflowName: string) => {
    if (confirm(`Are you sure you want to stop "${workflowName}"?`)) {
      removeActiveWorkflow(workflowRunId);
      if (selectedWorkflowId === workflowRunId) {
        setSelectedWorkflowId(null);
      }
      notificationService.info('Workflow Stopped', `${workflowName} has been removed from active workflows.`);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await refreshStatus();
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="h-5 w-5 text-green-500" />;
      case 'paused':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const selectedWorkflow = selectedWorkflowId 
    ? activeWorkflows.find(w => w.workflowRunId === selectedWorkflowId)
    : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Active Workflows
          </h1>
          <p className="text-gray-600">
            Monitor and manage your running workflows.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isPolling && (
            <div className="flex items-center text-sm text-green-600">
              <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
              Polling for updates
            </div>
          )}
          <button
            onClick={handleRefreshStatus}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {activeWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Workflows
          </h3>
          <p className="text-gray-600 mb-4">
            Start a new workflow by uploading an SOP or selecting a template.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/workflow/sop-to-aop')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload SOP
            </button>
            <button
              onClick={() => navigate('/workflow/templates')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Active Workflows ({activeWorkflows.length})
                </h3>
                <div className="space-y-3">
                  {activeWorkflows.map((workflow) => (
                    <div
                      key={workflow.workflowRunId}
                      onClick={() => setSelectedWorkflowId(workflow.workflowRunId)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedWorkflowId === workflow.workflowRunId
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2">
                            {getStatusIcon(workflow.status)}
                            <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                              {workflow.workflowName}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            ID: {workflow.workflowRunId.substring(0, 8)}...
                          </div>
                          {workflow.disputeCode && (
                            <div className="text-xs text-gray-600 mb-2">
                              Code: {workflow.disputeCode}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                              {workflow.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {workflow.progress.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Details */}
          <div className="lg:col-span-2">
            {selectedWorkflow ? (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedWorkflow.workflowName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedWorkflow.workflowRunId}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedWorkflow.status === 'running' ? (
                        <button
                          onClick={handlePauseWorkflow}
                          disabled={isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                        >
                          <PauseIcon className="h-4 w-4 mr-1" />
                          Pause
                        </button>
                      ) : selectedWorkflow.status === 'paused' ? (
                        <button
                          onClick={handleResumeWorkflow}
                          disabled={isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Resume
                        </button>
                      ) : selectedWorkflow.status === 'idle' ? (
                        <button
                          onClick={() => handleStartWorkflow(selectedWorkflow.workflowRunId)}
                          disabled={isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Start
                        </button>
                      ) : null}
                      
                      <button
                        onClick={() => handleStopWorkflow(selectedWorkflow.workflowRunId, selectedWorkflow.workflowName)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <StopIcon className="h-4 w-4 mr-1" />
                        Stop
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">
                        {selectedWorkflow.progress.completed} / {selectedWorkflow.progress.total} steps
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedWorkflow.progress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedWorkflow.progress.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Workflow Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedWorkflow.status)}`}>
                          {selectedWorkflow.status.toUpperCase()}
                        </span>
                      </dd>
                    </div>
                    {selectedWorkflow.disputeCode && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Dispute Code</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedWorkflow.disputeCode}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Started At</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedWorkflow.startedAt.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Update</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedWorkflow.lastUpdate.toLocaleString()}
                      </dd>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50">
                      <div className="flex">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Workflow
                  </h3>
                  <p className="text-gray-600">
                    Choose a workflow from the list to view its details and manage its execution.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to create a new active workflow (can be used by other components)
export const createActiveWorkflow = (
  workflowRunId: string,
  workflowName: string,
  disputeCode?: string
): ActiveWorkflow => ({
  workflowRunId,
  workflowName,
  disputeCode,
  status: 'idle',
  progress: {
    completed: 0,
    total: 0,
    percentage: 0,
  },
  startedAt: new Date(),
  lastUpdate: new Date(),
});
