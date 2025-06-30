import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  InformationCircleIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  ClockIcon,
  PauseIcon,
  PlayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { SiGmail, SiSlack } from "react-icons/si";
import { FaCircle } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const workflowRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [stepVerifications, setStepVerifications] = useState<Record<string, string>>({});
  const [startTime] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

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

    // Check if we need to pause for verification or manual pause
    if (currentStep > 0 && currentStep <= steps.length && !isCompleted && !isPaused && !isManuallyPaused) {
      if (currentStepRequiresVerification()) {
        setIsPaused(true);
        return;
      }

      // Animate through steps
      const timer = setTimeout(() => {
        if (currentStep === steps.length) {
          setIsCompleted(true);
          // Save to history when completed
          saveToHistory();
        } else {
          setCurrentStep(currentStep + 1);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, isCompleted, isPaused, isManuallyPaused]);

  const saveToHistory = () => {
    const runHistory = JSON.parse(localStorage.getItem("workflowRunHistory") || "[]");
    const newRun = {
      id: `run-${Date.now()}`,
      name: title,
      description: `Automated workflow with ${steps.length} steps`,
      category: "AUTOMATED WORKFLOW",
      status: "Completed",
      lastRun: new Date().toISOString(),
      runHistory: [{
        timestamp: new Date().toISOString(),
        status: "Success",
        details: `Workflow completed with ${steps.length} steps`,
      }],
      metrics: {
        totalSteps: steps.length.toString(),
        completionTime: `${Math.floor((new Date().getTime() - startTime.getTime()) / 1000)} seconds`,
      },
      steps: steps,
    };
    runHistory.unshift(newRun);
    localStorage.setItem("workflowRunHistory", JSON.stringify(runHistory));
  };

  const handlePauseResume = () => {
    setIsManuallyPaused(!isManuallyPaused);
  };

  const handleVerificationComplete = () => {
    setIsPaused(false);
    // Move to next step
    if (currentStep === steps.length) {
      setIsCompleted(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDownloadReport = async () => {
    if (!workflowRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture the workflow UI
      const canvas = await html2canvas(workflowRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: workflowRef.current.scrollWidth,
        windowHeight: workflowRef.current.scrollHeight,
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add title and metadata
      pdf.setFontSize(20);
      pdf.text(title, 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Completed on: ${new Date().toLocaleString()}`, 20, 30);
      pdf.text(`Total Steps: ${steps.length}`, 20, 37);
      pdf.text(`Execution Time: ${Math.floor((new Date().getTime() - startTime.getTime()) / 1000)} seconds`, 20, 44);
      
      // Add captured workflow UI
      const imgWidth = 170; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        20,
        55,
        imgWidth,
        imgHeight
      );
      
      // Save PDF
      const fileName = `${title.replace(/\s+/g, '_')}_Report_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewHistory = () => {
    navigate("/workflow/run");
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

  return (
    <div className="max-w-5xl mx-auto" ref={workflowRef}>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
            <p className="text-gray-600">Start time: {startTime.toLocaleString()}</p>
          </div>
          {!isCompleted && currentStep > 0 && (
            <button
              onClick={handlePauseResume}
              className={`px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors ${
                isManuallyPaused
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              }`}
            >
              {isManuallyPaused ? (
                <>
                  <PlayIcon className="h-5 w-5" />
                  Resume Workflow
                </>
              ) : (
                <>
                  <PauseIcon className="h-5 w-5" />
                  Pause Workflow
                </>
              )}
            </button>
          )}
        </div>
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
          <div className="mt-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg mb-2">
                <CheckCircleIcon className="h-6 w-6" />
                <span className="font-semibold text-lg">
                  Workflow Completed Successfully
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                All {steps.length} steps have been executed successfully
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  isDownloading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-brand-primary text-white hover:bg-brand-primaryHover"
                }`}
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                {isDownloading ? "Generating Report..." : "Download PDF Report"}
              </button>
              
              <button
                onClick={handleViewHistory}
                className="px-6 py-3 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors font-medium"
              >
                View Workflow History
              </button>
              
              <button
                onClick={() => navigate("/workflow/templates")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Templates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
