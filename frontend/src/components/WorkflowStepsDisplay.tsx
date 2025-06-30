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
import { SiGmail, SiSlack } from "react-icons/si";
import { FaCircle } from "react-icons/fa";

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
  templateId?: string;
  onComplete?: () => void;
}

export const WorkflowStepsDisplay: React.FC<WorkflowStepsDisplayProps> = ({
  steps,
  title,
  templateId,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepVerifications, setStepVerifications] = useState<Record<string, string>>({});

  // Load verification settings from localStorage
  useEffect(() => {
    if (templateId) {
      const savedCustomizations = localStorage.getItem(`workflow-custom-${templateId}`);
      if (savedCustomizations) {
        try {
          const customizations = JSON.parse(savedCustomizations);
          if (customizations.stepVerifications) {
            setStepVerifications(customizations.stepVerifications);
          }
        } catch (e) {
          console.error("Error loading verification settings:", e);
        }
      }
    }
  }, [templateId]);

  // Check if current step requires verification
  const currentStepRequiresVerification = () => {
    if (currentStep === 0 || currentStep > steps.length) return false;
    const step = steps[currentStep - 1];
    const verificationType = stepVerifications[step.step] || "none";
    return verificationType !== "none";
  };

  // Get verification type for current step
  const getCurrentVerificationType = () => {
    if (currentStep === 0 || currentStep > steps.length) return "none";
    const step = steps[currentStep - 1];
    return stepVerifications[step.step] || "none";
  };

  useEffect(() => {
    // Start the animation after a short delay
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setCurrentStep(1);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Check if we need to pause for verification
    if (currentStep > 0 && currentStep <= steps.length && !isCompleted && !isPaused) {
      if (currentStepRequiresVerification()) {
        setIsPaused(true);
        return;
      }

      // Animate through steps
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
  }, [currentStep, steps.length, isCompleted, isPaused, onComplete]);

  const handleVerificationComplete = () => {
    setIsPaused(false);
    // Move to next step
    if (currentStep === steps.length) {
      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

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

  const getVerificationUI = (verificationType: string, step: WorkflowStep) => {
    const verificationConfigs = {
      simple: { 
        icon: FaCircle, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50', 
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        title: 'Simple Verification Required'
      },
      gmail: { 
        icon: SiGmail, 
        color: 'text-red-600', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        title: 'Gmail Verification Required'
      },
      slack: { 
        icon: SiSlack, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50', 
        borderColor: 'border-purple-200',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
        title: 'Slack Verification Required'
      },
    };

    const config = verificationConfigs[verificationType as keyof typeof verificationConfigs] || verificationConfigs.simple;
    const Icon = config.icon;

    return (
      <div className={`mt-4 border rounded-lg p-4 ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center mb-3">
          <Icon className={`h-5 w-5 ${config.color} mr-2`} />
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.title}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-3">
          {verificationType === 'gmail' ? 
            'Please check your Gmail for the verification request and confirm this action.' :
           verificationType === 'slack' ?
            'Please check your Slack for the verification request and confirm this action.' :
            `Please verify this action: ${step.heading || step.element_description}`}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          {verificationType === 'gmail' && (
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 px-4 py-2 text-white rounded-md text-center text-sm font-medium transition-colors ${config.buttonColor}`}
            >
              Open Gmail →
            </a>
          )}
          {verificationType === 'slack' && (
            <a
              href="https://slack.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 px-4 py-2 text-white rounded-md text-center text-sm font-medium transition-colors ${config.buttonColor}`}
            >
              Open Slack →
            </a>
          )}
          {verificationType === 'simple' && (
            <a
              href="https://chimetools.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 px-4 py-2 text-white rounded-md text-center text-sm font-medium transition-colors ${config.buttonColor}`}
            >
              Open Chime Platform →
            </a>
          )}
          <button
            onClick={handleVerificationComplete}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
          >
            ✓ Verification Complete
          </button>
        </div>
      </div>
    );
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
            const requiresVerification = stepVerifications[step.step] && stepVerifications[step.step] !== "none";

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
                      {requiresVerification && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                          Verification Required
                        </span>
                      )}
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
                    
                    {/* Show verification UI if this is the current step and verification is required */}
                    {isCurrent && isPaused && requiresVerification && (
                      getVerificationUI(stepVerifications[step.step], step)
                    )}
                  </div>
                  {isActive && stepNumber < currentStep && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                  {isCurrent && !isPaused && (
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
