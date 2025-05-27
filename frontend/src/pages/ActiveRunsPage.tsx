import React from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface ActiveRun {
  id: string;
  name: string;
  startTime: string;
  currentStep: number;
  totalSteps: number;
  status: "running" | "paused";
  estimatedCompletion: string;
}

// Mock data - in real app this would come from API
const mockActiveRuns: ActiveRun[] = [
  {
    id: "run-001",
    name: "Automating the discovery process for fraud investigation",
    startTime: "2024-03-21 14:30:00",
    currentStep: 6,
    totalSteps: 10,
    status: "running",
    estimatedCompletion: "5 mins",
  },
];

export const ActiveRunsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleViewRun = (runId: string) => {
    navigate(`/aop/run/${runId}`);
  };

  if (mockActiveRuns.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Runs</h1>
          <p className="text-gray-600">
            Monitor your currently executing automation workflows
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PlayIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No current AOP is running
          </h2>
          <p className="text-gray-600 mb-6">
            Start a new automation workflow from templates or create your own
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/aop/templates")}
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark transition-colors"
            >
              Browse Templates
            </button>
            <button
              onClick={() => navigate("/aop/builder")}
              className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors"
            >
              Create Custom AOP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Runs</h1>
        <p className="text-gray-600">
          Monitor your currently executing automation workflows
        </p>
      </div>

      <div className="space-y-4">
        {mockActiveRuns.map((run) => (
          <div
            key={run.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {run.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Started: {run.startTime}
                  </span>
                  <span>•</span>
                  <span>Est. completion: {run.estimatedCompletion}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {run.status === "running" && (
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 text-brand-primary animate-spin" />
                    <span className="text-sm font-medium text-brand-primary">
                      Running
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {run.currentStep} of {run.totalSteps}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round((run.currentStep / run.totalSteps) * 100)}%
                  Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(run.currentStep / run.totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleViewRun(run.id)}
                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark transition-colors"
              >
                View Details
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Pause
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
