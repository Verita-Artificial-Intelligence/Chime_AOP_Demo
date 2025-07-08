import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowContext } from '../contexts/WorkflowContext';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

export function WorkflowStatusIndicator() {
  const navigate = useNavigate();
  const { activeWorkflows } = useWorkflowContext();
  
  // Count active workflows
  const runningWorkflows = Array.from(activeWorkflows.values()).filter(
    w => w.status === 'running' || w.status === 'paused'
  );

  if (runningWorkflows.length === 0) {
    return null;
  }

  const handleClick = () => {
    navigate('/workflow/active-runs');
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg cursor-pointer hover:bg-green-200 transition-colors"
    >
      <div className="relative">
        <PlayIcon className="h-4 w-4" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <span className="text-sm font-medium">
        {runningWorkflows.length} workflow{runningWorkflows.length > 1 ? 's' : ''} running
      </span>
    </div>
  );
}