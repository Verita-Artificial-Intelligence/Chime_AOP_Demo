import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  InformationCircleIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";

interface WorkflowStep {
  step: number;
  action: string;
  element_description: string;
  element_type: string;
  value?: string;
  heading?: string;
}

interface WorkflowStepsDisplayProps {
  steps: WorkflowStep[];
  title: string;
  onComplete?: () => void;
}

export const WorkflowStepsDisplay: React.FC<WorkflowStepsDisplayProps> = ({
  steps,
  title,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Start the animation after a short delay
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setCurrentStep(1);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Animate through steps
    if (currentStep > 0 && currentStep <= steps.length && !isCompleted) {
      const timer = setTimeout(() => {
        if (currentStep === steps.length) {
          setIsCompleted(true);
          if (onComplete) {
            onComplete();
          }
        } else {
          setCurrentStep(currentStep + 1);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, isCompleted, onComplete]);

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();

    if (actionLower === "type") {
      return <DocumentTextIcon className="h-5 w-5" />;
    } else if (actionLower === "click") {
      return <CursorArrowRaysIcon className="h-5 w-5" />;
    } else if (actionLower === "check") {
      return <CheckCircleIcon className="h-5 w-5" />;
    } else if (actionLower === "select") {
      return <ClipboardDocumentCheckIcon className="h-5 w-5" />;
    } else if (actionLower === "scroll") {
      return <ArrowRightIcon className="h-5 w-5" />;
    } else if (actionLower === "copy") {
      return <PencilSquareIcon className="h-5 w-5" />;
    } else {
      return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();

    if (actionLower === "type") {
      return "bg-blue-100 text-blue-600";
    } else if (actionLower === "click") {
      return "bg-green-100 text-green-600";
    } else if (actionLower === "check") {
      return "bg-purple-100 text-purple-600";
    } else if (actionLower === "select") {
      return "bg-yellow-100 text-yellow-600";
    } else if (actionLower === "scroll") {
      return "bg-orange-100 text-orange-600";
    } else if (actionLower === "copy") {
      return "bg-pink-100 text-pink-600";
    } else {
      return "bg-gray-100 text-gray-600";
    }
  };

  const startTime = new Date().toLocaleString();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
        <p className="text-gray-600">Start time: {startTime}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: Step {Math.min(currentStep, steps.length)} of{" "}
              {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(
                (Math.min(currentStep, steps.length) / steps.length) * 100
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-primary h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (Math.min(currentStep, steps.length) / steps.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber <= currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={step.step}
                className={`p-4 rounded-lg border transition-all duration-500 ${
                  isCurrent
                    ? "border-brand-primary bg-brand-light shadow-sm"
                    : isActive
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? getActionColor(step.action)
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isActive && stepNumber < currentStep ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      getActionIcon(step.action)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        Step {step.step}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-brand-primary text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step.action.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 break-words">
                      {step.heading || step.element_description}
                    </p>
                    {step.value && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Value:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                          {step.value}
                        </code>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Element:</span>
                      <span className="text-xs text-gray-600">
                        {step.element_type}
                      </span>
                    </div>
                  </div>
                  {isActive && stepNumber < currentStep && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                  {isCurrent && (
                    <div className="flex-shrink-0">
                      <div className="animate-pulse">
                        <ClockIcon className="h-5 w-5 text-brand-primary" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isCompleted && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="font-medium">
                Workflow Completed Successfully
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
