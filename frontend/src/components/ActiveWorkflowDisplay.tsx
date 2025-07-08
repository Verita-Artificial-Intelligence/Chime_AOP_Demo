import React from 'react';
import { useWorkflowContext } from '../contexts/WorkflowContext';
import { CheckCircleIcon, PauseIcon, PlayIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ActiveWorkflowDisplayProps {
  workflowId: string;
}

export function ActiveWorkflowDisplay({ workflowId }: ActiveWorkflowDisplayProps) {
  const { getWorkflow, pauseWorkflow, resumeWorkflow } = useWorkflowContext();
  const workflow = getWorkflow(workflowId);

  if (!workflow) {
    return null;
  }

  const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / workflow.steps.length) * 100;

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    switch (actionLower) {
      case 'type':
        return 'bg-blue-100 text-blue-600';
      case 'click':
        return 'bg-green-100 text-green-600';
      case 'check':
        return 'bg-purple-100 text-purple-600';
      case 'select':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStepStatus = (stepNumber: number) => {
    const step = workflow.steps.find(s => s.step === stepNumber);
    return step?.status || 'pending';
  };

  const currentStep = workflow.steps.find(s => s.status === 'in_progress') || 
                     workflow.steps.find(s => s.status === 'pending');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {workflow.title || 'Workflow Execution'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Start time: {new Date(workflow.startTime).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => {
            if (workflow.status === 'running') {
              pauseWorkflow(workflowId);
            } else if (workflow.status === 'paused') {
              resumeWorkflow(workflowId);
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            workflow.status === 'running'
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : workflow.status === 'paused'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={workflow.status === 'completed' || workflow.status === 'error'}
        >
          {workflow.status === 'running' ? (
            <>
              <PauseIcon className="h-5 w-5" />
              Pause Workflow
            </>
          ) : workflow.status === 'paused' ? (
            <>
              <PlayIcon className="h-5 w-5" />
              Resume Workflow
            </>
          ) : (
            'Workflow Complete'
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: Step {completedSteps} of {workflow.steps.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Step Display */}
      {currentStep && workflow.status !== 'completed' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900">
                Step {currentStep.step}: {currentStep.action.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">{currentStep.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {workflow.steps.map((step) => {
          const status = getStepStatus(step.step);
          const isActive = status === 'in_progress';
          const isCompleted = status === 'completed';

          return (
            <div
              key={step.step}
              className={`p-4 rounded-lg border transition-all ${
                isActive
                  ? 'border-brand-primary bg-brand-primaryLight'
                  : isCompleted
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 bg-brand-primary rounded-full animate-pulse" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Step {step.step}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      getActionColor(step.action)
                    }`}>
                      {step.action.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{step.description}</p>
                  {step.element && (
                    <p className="text-xs text-gray-500 mt-1">Element: {step.element}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Status */}
      {workflow.status === 'completed' && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-green-800">
              Workflow completed successfully!
            </span>
          </div>
        </div>
      )}

      {workflow.status === 'error' && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-red-800">
              Workflow encountered an error
            </span>
          </div>
        </div>
      )}
    </div>
  );
}