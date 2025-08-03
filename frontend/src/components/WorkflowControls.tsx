import React, { useState, useEffect } from "react";
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { DisputeApiService, WorkflowStatusResponse } from "../services/disputeApiService";

// Using the API contract interface directly
type WorkflowStatus = WorkflowStatusResponse;

interface WorkflowControlsProps {
  workflowRunId: string;
  onStatusChange?: (status: WorkflowStatus) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  workflowRunId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch workflow status
  const fetchStatus = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);

    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.getWorkflowStatus(workflowRunId),
      "Fetch Workflow Status"
    );

    if (result.success) {
      setStatus(result.data);
      setLastUpdated(new Date());
      onStatusChange?.(result.data);
    } else {
      setError(result.error);
    }

    if (showLoader) setLoading(false);
  };

  // Execute workflow action
  const executeAction = async (action: "start" | "pause" | "resume") => {
    setActionLoading(action);
    setError(null);

    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.executeWorkflowAction(action, workflowRunId),
      `Execute Workflow ${action}`
    );

    if (result.success) {
      // Refresh status after action
      await fetchStatus(false);
    } else {
      setError(result.error);
    }

    setActionLoading(null);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    fetchStatus(true); // Initial fetch with loader

    const interval = setInterval(() => {
      fetchStatus(false); // Subsequent fetches without loader
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [workflowRunId, autoRefresh, refreshInterval]);

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus?.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "running":
      case "in_progress":
        return "text-blue-600";
      case "paused":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus?.toLowerCase()) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "running":
      case "in_progress":
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case "paused":
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const canStart = status?.action === "pause" || !status?.action;
  const canPause = status?.action === "start" || status?.action === "resume";
  const canResume = status?.action === "pause";

  if (loading && !status) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-brand-heading mb-1">
            Workflow Controls
          </h3>
          <p className="text-sm text-brand-muted">
            Manage workflow execution for run ID: {workflowRunId}
          </p>
        </div>
        <button
          onClick={() => fetchStatus(true)}
          disabled={loading}
          className="p-2 text-brand-muted hover:text-brand-heading transition-colors"
          title="Refresh status"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Current Status */}
      {status && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            {getStatusIcon(status.action)}
            <span className={`ml-2 font-medium ${getStatusColor(status.action)}`}>
              Status: {status.action?.replace("_", " ").toUpperCase() || "Unknown"}
            </span>
          </div>
          <div className="text-sm text-brand-muted">
            <p>Dispute Code: {status.dispute_code}</p>
            {lastUpdated && (
              <p>Last Updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => executeAction("start")}
          disabled={!canStart || actionLoading !== null}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            canStart && actionLoading === null
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {actionLoading === "start" ? (
            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4 mr-2" />
          )}
          {canResume ? "Resume" : "Start"}
        </button>

        <button
          onClick={() => executeAction("pause")}
          disabled={!canPause || actionLoading !== null}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            canPause && actionLoading === null
              ? "bg-yellow-600 text-white hover:bg-yellow-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {actionLoading === "pause" ? (
            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PauseIcon className="h-4 w-4 mr-2" />
          )}
          Pause
        </button>

        <button
          onClick={() => executeAction("resume")}
          disabled={!canResume || actionLoading !== null}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            canResume && actionLoading === null
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {actionLoading === "resume" ? (
            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4 mr-2" />
          )}
          Resume
        </button>
      </div>

      {/* Progress Indicator */}
      {status?.workflowDtoStatus && status.workflowDtoStatus.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-heading">Progress</span>
            <span className="text-sm text-brand-muted">
              {status.workflowDtoStatus.filter((step) => step.status === "completed").length}/
              {status.workflowDtoStatus.length} steps completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (status.workflowDtoStatus.filter((step) => step.status === "completed").length /
                    status.workflowDtoStatus.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-brand-borderLight">
        <div className="flex justify-between items-center text-sm">
          <span className="text-brand-muted">Quick Actions:</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchStatus(true)}
              className="text-brand-primary hover:underline"
            >
              Refresh
            </button>
            <span className="text-brand-muted">•</span>
            <button
              onClick={() => {
                // Navigate to detailed view or open logs
                console.log("View details for:", workflowRunId);
              }}
              className="text-brand-primary hover:underline"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};