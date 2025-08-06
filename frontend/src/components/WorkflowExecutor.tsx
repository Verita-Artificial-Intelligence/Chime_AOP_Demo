import React from 'react';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { HiPlay, HiCheckCircle, HiClock, HiExclamationCircle } from 'react-icons/hi';

export function WorkflowExecutor() {
  const { executionState, startWorkflow, isLoading, error } = useWorkflowExecution();

  const getStepIcon = (stepNumber: number) => {
    if (!executionState) return <HiClock className="h-5 w-5 text-gray-400" />;
    
    if (executionState.completedSteps.has(stepNumber)) {
      return <HiCheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (executionState.currentStep === stepNumber && executionState.status === 'running') {
      return <HiClock className="h-5 w-5 text-brand-primary animate-pulse" />;
    }
    
    return <HiClock className="h-5 w-5 text-gray-400" />;
  };

  const getProgressPercentage = () => {
    if (!executionState) return 0;
    return (executionState.completedSteps.size / executionState.steps.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Workflow Execution Demo</h2>
          <button
            onClick={() => startWorkflow()}
            disabled={isLoading || executionState?.status === 'running'}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <HiPlay className="h-5 w-5" />
            <span>{executionState?.status === 'running' ? 'Running...' : 'Start Workflow'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <HiExclamationCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {executionState && (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-brand-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Workflow Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Workflow ID:</span>
                  <span className="ml-2 font-mono text-gray-800">{executionState.workflowId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-semibold ${
                    executionState.status === 'running' ? 'text-brand-primary' :
                    executionState.status === 'completed' ? 'text-green-600' :
                    executionState.status === 'error' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {executionState.status.toUpperCase()}
                  </span>
                </div>
                {executionState.isInFallbackMode && (
                  <div className="col-span-2">
                    <span className="text-orange-600">⚠️ Running in fallback mode</span>
                  </div>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Workflow Steps</h3>
              {executionState.steps.map((step) => (
                <div
                  key={step.step}
                  className={`p-4 rounded-lg border transition-all ${
                    executionState.completedSteps.has(step.step)
                      ? 'bg-green-50 border-green-200'
                      : executionState.currentStep === step.step && executionState.status === 'running'
                      ? 'bg-brand-light border-brand-primary'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step.step)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">
                          Step {step.step}: {step.heading}
                        </h4>
                        <span className="text-sm text-gray-500 capitalize">
                          {step.action}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.element_description}</p>
                      {step.url && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">{step.url}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Webhook Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-brand-heading mb-2">Backend Integration</h4>
              <p className="text-sm text-brand-text">
                Webhook URL for backend: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001/api/status-update</code>
              </p>
              <p className="text-xs text-brand-muted mt-2">
                The backend should POST step updates to this endpoint with format: {`{ workflowId, step, status, timestamp }`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}