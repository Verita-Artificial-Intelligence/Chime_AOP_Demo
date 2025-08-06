import React, { useEffect, useRef } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";

interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: "started" | "step_completed" | "paused" | "resumed" | "completed" | "error";
  description: string;
  stepNumber?: number;
  metadata?: any;
}

interface WorkflowTimelineProps {
  events: TimelineEvent[];
  currentStep?: number;
  totalSteps?: number;
  workflowStatus?: "running" | "paused" | "completed" | "error" | "pending";
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  events,
  currentStep = 0,
  totalSteps = 0,
  workflowStatus = "pending",
}) => {
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const prevEventsLengthRef = useRef(events.length);

  // Auto-scroll to bottom when new events are added
  useEffect(() => {
    if (events.length > prevEventsLengthRef.current && timelineScrollRef.current) {
      timelineScrollRef.current.scrollTop = timelineScrollRef.current.scrollHeight;
    }
    prevEventsLengthRef.current = events.length;
  }, [events.length]);
  const getEventIcon = (type: string) => {
    switch (type) {
      case "started":
        return <PlayIcon className="h-4 w-4 text-brand-primary" />;
      case "step_completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "paused":
        return <PauseCircleIcon className="h-4 w-4 text-yellow-500" />;
      case "resumed":
        return <PlayIcon className="h-4 w-4 text-brand-primary" />;
      case "completed":
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case "error":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "started":
        return "border-gray-300 bg-gray-50";
      case "step_completed":
        return "border-green-200 bg-green-50";
      case "paused":
        return "border-yellow-200 bg-yellow-50";
      case "resumed":
        return "border-gray-300 bg-gray-50";
      case "completed":
        return "border-green-300 bg-green-100";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getStatusIndicator = () => {
    switch (workflowStatus) {
      case "running":
        return (
          <div className="flex items-center gap-2 text-brand-primary">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">Running</span>
          </div>
        );
      case "paused":
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <div className="w-2 h-2 bg-yellow-600 rounded-full" />
            <span className="text-sm font-medium">Paused</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="text-sm font-medium">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-sm font-medium">Pending</span>
          </div>
        );
    }
  };

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Timeline Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-brand-heading">Timeline</h3>
          {getStatusIndicator()}
        </div>
        
        {totalSteps > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>Step {Math.min(currentStep, totalSteps)} of {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Math.min(currentStep, totalSteps) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline Events */}
      <div ref={timelineScrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No events yet</p>
            </div>
          ) : (
            events.map((event, index) => (
              <div key={event.id} className="flex items-start gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`p-1.5 rounded-full border-2 ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.description}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  
                  {event.stepNumber && (
                    <p className="text-xs text-gray-500">
                      Step {event.stepNumber}
                    </p>
                  )}
                  
                  {event.metadata && (
                    <div className="mt-1 text-xs text-gray-400">
                      {event.metadata.duration && (
                        <span>Duration: {event.metadata.duration}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live indicator when running */}
      {workflowStatus === "running" && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
            <span className="text-xs text-brand-primary font-medium">Live updates</span>
          </div>
        </div>
      )}
    </div>
  );
};