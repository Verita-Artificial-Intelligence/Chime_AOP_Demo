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
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { slackNotificationService } from "../services/slackNotificationService";
import { WorkflowTimeline } from "./WorkflowTimeline";

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
  initialStep?: number;
  backgroundMode?: boolean;
}

export const WorkflowStepsDisplay: React.FC<WorkflowStepsDisplayProps> = ({
  steps,
  title,
  templateId,
  onComplete,
  initialStep = 0,
  backgroundMode = false,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isCompleted, setIsCompleted] = useState(initialStep >= steps.length);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [stepVerifications, setStepVerifications] = useState<
    Record<string, string>
  >({});
  const [startTime] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Timeline events state
  const [timelineEvents, setTimelineEvents] = useState<Array<{
    id: string;
    timestamp: Date;
    type: "started" | "step_completed" | "paused" | "resumed" | "completed" | "error";
    description: string;
    stepNumber?: number;
    metadata?: any;
  }>>([]);
  
  // Auto-scroll refs
  const workflowScrollRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLDivElement>(null);

  // Load verification settings from localStorage
  useEffect(() => {
    if (templateId) {
      const savedCustomizations = localStorage.getItem(
        `workflow-custom-${templateId}`
      );
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

  // Sync with background progression if in background mode
  useEffect(() => {
    if (backgroundMode && templateId) {
      const checkProgress = () => {
        const activeWorkflows = JSON.parse(localStorage.getItem('activeWorkflows') || '[]');
        const workflow = activeWorkflows.find((w: any) => w.templateId === templateId);
        if (workflow && workflow.currentStep !== currentStep) {
          setCurrentStep(workflow.currentStep);
          setIsCompleted(workflow.currentStep >= steps.length);
        }
      };
      
      const interval = setInterval(checkProgress, 500);
      return () => clearInterval(interval);
    }
  }, [backgroundMode, templateId, currentStep, steps.length]);

  useEffect(() => {
    // Skip auto-start and manual progression in background mode
    if (backgroundMode) return;
    
    // Start the animation after a short delay
    if (currentStep === 0) {
      // Send workflow start notification
      slackNotificationService.sendWorkflowStartNotification(title);
      
      // Add workflow started event to timeline
      setTimelineEvents([{
        id: `started-${Date.now()}`,
        timestamp: new Date(),
        type: "started",
        description: `Workflow "${title}" started`,
      }]);
      
      const timer = setTimeout(() => {
        setCurrentStep(1);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Check if we need to pause for verification or manual pause
    if (
      currentStep > 0 &&
      currentStep <= steps.length &&
      !isCompleted &&
      !isPaused &&
      !isManuallyPaused
    ) {
      if (currentStepRequiresVerification()) {
        // Send verification notification
        const currentStepData = steps[currentStep - 1];
        const verificationType = getCurrentVerificationType();
        slackNotificationService.sendVerificationNotification(
          currentStepData.heading || currentStepData.element_description,
          verificationType
        );
        setIsPaused(true);
        return;
      }

      // Check if current step is a big action that requires notification
      const currentStepData = steps[currentStep - 1];
      const bigActions = ['transmit', 'upload', 'send', 'submit', 'trigger', 'fire', 'post', 'create', 'update', 'delete'];
      const isBigAction = bigActions.some(action => 
        currentStepData.action.toLowerCase().includes(action.toLowerCase())
      );
      
      if (isBigAction) {
        slackNotificationService.sendBigActionNotification(
          currentStepData.heading || currentStepData.element_description
        );
      }

      // Animate through steps
      const timer = setTimeout(() => {
        if (currentStep === steps.length) {
          setIsCompleted(true);
          // Send completion notification
          slackNotificationService.sendCompletionNotification(title, steps.length);
          
          // Add completion event to timeline
          setTimelineEvents(prev => [...prev, {
            id: `completed-${Date.now()}`,
            timestamp: new Date(),
            type: "completed",
            description: `Workflow completed successfully`,
            metadata: { 
              duration: `${Math.floor((new Date().getTime() - startTime.getTime()) / 1000)} seconds`
            }
          }]);
          
          // Save to history when completed
          saveToHistory();
        } else {
          // Add step completion event to timeline
          const completedStep = steps[currentStep - 1];
          setTimelineEvents(prev => [...prev, {
            id: `step-${currentStep}-${Date.now()}`,
            timestamp: new Date(),
            type: "step_completed",
            description: completedStep.heading || completedStep.element_description,
            stepNumber: currentStep,
          }]);
          
          setCurrentStep(currentStep + 1);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, isCompleted, isPaused, isManuallyPaused, backgroundMode]);

  // Auto-scroll to current step
  useEffect(() => {
    if (currentStepRef.current && workflowScrollRef.current && !isPaused) {
      const container = workflowScrollRef.current;
      const currentElement = currentStepRef.current;
      
      // Calculate the position to center the current step in the container
      const containerHeight = container.clientHeight;
      const elementTop = currentElement.offsetTop;
      const elementHeight = currentElement.clientHeight;
      
      // Scroll to center the current step
      const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: 'smooth'
      });
    }
  }, [currentStep, isPaused]);

  const saveToHistory = () => {
    const runHistory = JSON.parse(
      localStorage.getItem("workflowRunHistory") || "[]"
    );
    const newRun = {
      id: `run-${Date.now()}`,
      name: title,
      description: `Automated workflow with ${steps.length} steps`,
      category: "AUTOMATED WORKFLOW",
      status: "Completed",
      lastRun: new Date().toISOString(),
      runHistory: [
        {
          timestamp: new Date().toISOString(),
          status: "Success",
          details: `Workflow completed with ${steps.length} steps`,
        },
      ],
      metrics: {
        totalSteps: steps.length.toString(),
        completionTime: `${Math.floor(
          (new Date().getTime() - startTime.getTime()) / 1000
        )} seconds`,
      },
      steps: steps,
    };
    runHistory.unshift(newRun);
    localStorage.setItem("workflowRunHistory", JSON.stringify(runHistory));
  };

  const handlePauseResume = () => {
    const newPausedState = !isManuallyPaused;
    setIsManuallyPaused(newPausedState);
    
    // Add pause/resume event to timeline
    setTimelineEvents(prev => [...prev, {
      id: `${newPausedState ? 'paused' : 'resumed'}-${Date.now()}`,
      timestamp: new Date(),
      type: newPausedState ? "paused" : "resumed",
      description: `Workflow ${newPausedState ? 'paused' : 'resumed'} manually`,
    }]);
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
    setIsDownloading(true);

    try {
      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set up fonts and colors
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      // Add header
      pdf.setFillColor(34, 197, 94); // Green color
      pdf.rect(0, 0, pageWidth, 40, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text(title, margin, 25);

      // Add metadata section
      yPosition = 50;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Report Generated:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(new Date().toLocaleString(), margin + 35, yPosition);

      yPosition += 6;
      pdf.setFont("helvetica", "bold");
      pdf.text("Total Steps:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(steps.length.toString(), margin + 25, yPosition);

      yPosition += 6;
      pdf.setFont("helvetica", "bold");
      pdf.text("Execution Time:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `${Math.floor(
          (new Date().getTime() - startTime.getTime()) / 1000
        )} seconds`,
        margin + 30,
        yPosition
      );

      yPosition += 6;
      pdf.setFont("helvetica", "bold");
      pdf.text("Status:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(34, 197, 94);
      pdf.text("Completed Successfully", margin + 15, yPosition);
      pdf.setTextColor(0, 0, 0);

      // Add a line separator
      yPosition += 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Add workflow steps section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Workflow Steps", margin, yPosition);
      yPosition += 10;

      // Process each step
      steps.forEach((step, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Step box
        const stepBoxHeight = 25;
        const extraHeight = step.value ? 8 : 0;
        const totalBoxHeight = stepBoxHeight + extraHeight;

        // Draw step background
        pdf.setFillColor(249, 250, 251); // Light gray background
        pdf.roundedRect(
          margin,
          yPosition,
          contentWidth,
          totalBoxHeight,
          3,
          3,
          "F"
        );

        // Draw step number circle with action color
        const actionColor = getActionColorForPDF(step.action);
        pdf.setFillColor(actionColor.r, actionColor.g, actionColor.b);
        pdf.circle(margin + 8, yPosition + 8, 6, "F");

        // Add step number in circle
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(step.step.toString(), margin + 8, yPosition + 9, {
          align: "center",
        });

        // Add action badge
        pdf.setFillColor(actionColor.r, actionColor.g, actionColor.b);
        pdf.roundedRect(margin + 20, yPosition + 4, 25, 8, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(step.action.toUpperCase(), margin + 32.5, yPosition + 9, {
          align: "center",
        });

        // Add step description
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const description = step.heading || step.element_description;
        const lines = pdf.splitTextToSize(description, contentWidth - 35);
        pdf.text(lines, margin + 50, yPosition + 8);

        // Add element type
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Element: ${step.element_type}`, margin + 50, yPosition + 16);

        // Add value if exists
        if (step.value) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Value:", margin + 50, yPosition + 22);
          pdf.setFont("helvetica", "normal");
          pdf.text(step.value, margin + 65, yPosition + 22);
        }

        yPosition += totalBoxHeight + 5;
      });

      // Add footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        "Generated by Verita AI Workflow System",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );

      // Save PDF
      const fileName = `${title.replace(
        /\s+/g,
        "_"
      )}_Report_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getActionColorForPDF = (action: string) => {
    const actionLower = action.toLowerCase();
    switch (actionLower) {
      case "type":
        return { r: 59, g: 130, b: 246 }; // Blue
      case "click":
        return { r: 34, g: 197, b: 94 }; // Green
      case "check":
        return { r: 147, g: 51, b: 234 }; // Purple
      case "select":
        return { r: 250, g: 204, b: 21 }; // Yellow
      case "scroll":
        return { r: 251, g: 146, b: 60 }; // Orange
      case "copy":
        return { r: 236, g: 72, b: 153 }; // Pink
      default:
        return { r: 107, g: 114, b: 128 }; // Gray
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
      return "bg-gray-100 text-brand-primary";
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
        color: "text-brand-primary",
        bgColor: "bg-brand-light",
        borderColor: "border-brand-border",
        buttonColor: "bg-brand-primary hover:bg-brand-hover",
        title: "Simple Verification Required",
      },
      gmail: {
        icon: SiGmail,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        buttonColor: "bg-red-600 hover:bg-red-700",
        title: "Gmail Verification Required",
      },
      slack: {
        icon: SiSlack,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        buttonColor: "bg-purple-600 hover:bg-purple-700",
        title: "Slack Verification Required",
      },
    };

    const config =
      verificationConfigs[
        verificationType as keyof typeof verificationConfigs
      ] || verificationConfigs.simple;
    const Icon = config.icon;

    return (
      <div className={`w-full border rounded px-2 py-1 text-xs ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-1">
            <Icon className={`h-3 w-3 ${config.color} flex-shrink-0`} />
            <span className={`font-medium ${config.color} text-xs`}>
              {config.title}
            </span>
            <div className="flex gap-1 ml-2">
              {verificationType === "gmail" && (
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-1.5 py-0.5 text-white rounded text-xs transition-colors ${config.buttonColor}`}
                >
                  Gmail
                </a>
              )}
              {verificationType === "slack" && (
                <a
                  href="https://slack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-1.5 py-0.5 text-white rounded text-xs transition-colors ${config.buttonColor}`}
                >
                  Slack
                </a>
              )}
              {verificationType === "simple" && (
                <a
                  href="https://chimetools.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-1.5 py-0.5 text-white rounded text-xs transition-colors ${config.buttonColor}`}
                >
                  Platform
                </a>
              )}
            </div>
          </div>
          <button
            onClick={handleVerificationComplete}
            className="px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex-shrink-0"
          >
            ✓ Complete
          </button>
        </div>
      </div>
    );
  };

  // Get workflow status for timeline
  const getWorkflowStatus = () => {
    if (isCompleted) return "completed";
    if (isPaused || isManuallyPaused) return "paused";
    if (currentStep > 0 && currentStep <= steps.length) return "running";
    return "pending";
  };

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1 max-w-4xl mx-auto pr-6">
        <div className="mb-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-brand-heading mb-1">
                {title}
              </h1>
              <p className="text-brand-muted">
                Start time: {startTime.toLocaleString()}
              </p>
            </div>
          {!isCompleted && currentStep > 0 && (
            <button
              onClick={handlePauseResume}
              className={`px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors ${
                isManuallyPaused
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-brand-purple text-white hover:bg-brand-purpleDark"
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

      <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-brand-heading">
              Progress: Step {Math.min(currentStep, steps.length)} of{" "}
              {steps.length}
            </span>
            <span className="text-sm text-brand-muted">
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

        <div ref={workflowScrollRef} className="space-y-1 h-[80vh] overflow-y-auto font-mono text-xs">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber <= currentStep;
            const isCurrent = stepNumber === currentStep;
            const requiresVerification =
              stepVerifications[step.step] &&
              stepVerifications[step.step] !== "none";

            return (
              <div key={step.step}>
                <div
                  ref={isCurrent ? currentStepRef : null}
                  className={`px-2 py-1 flex items-center gap-2 text-xs transition-all duration-300 ${
                    isCurrent
                      ? "bg-brand-primary text-white font-medium"
                      : isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {/* Step indicator */}
                  <span className="flex-shrink-0 w-6 text-right">
                    {isActive && stepNumber < currentStep ? (
                      "✓"
                    ) : isCurrent ? (
                      "▶"
                    ) : (
                      stepNumber
                    )}
                  </span>

                  {/* Action type */}
                  <span className="flex-shrink-0 w-12 uppercase font-medium">
                    {step.action}
                  </span>

                  {/* Description */}
                  <span className="flex-1 truncate">
                    {step.heading || step.element_description}
                    {step.value && (
                      <span className="ml-2 opacity-75">
                        = "{step.value.length > 30 ? step.value.substring(0, 30) + "..." : step.value}"
                      </span>
                    )}
                  </span>

                  {/* Element type */}
                  <span className="flex-shrink-0 text-xs opacity-60">
                    [{step.element_type}]
                  </span>

                  {/* Verification indicator */}
                  {requiresVerification && (
                    <span className="flex-shrink-0 text-yellow-600">⚠</span>
                  )}

                  {/* Status indicator */}
                  {isCurrent && !isPaused && (
                    <span className="flex-shrink-0 animate-pulse">●</span>
                  )}
                </div>

                {/* Compact verification UI */}
                {isCurrent &&
                  isPaused &&
                  requiresVerification && (
                    <div className="mt-1 mb-1 mx-2">
                      {getVerificationUI(stepVerifications[step.step], step)}
                    </div>
                  )}
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
                    : "bg-brand-primary text-white hover:bg-brand-primaryDark"
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

      {/* Timeline sidebar */}
      <WorkflowTimeline
        events={timelineEvents}
        currentStep={currentStep}
        totalSteps={steps.length}
        workflowStatus={getWorkflowStatus()}
      />
    </div>
  );
};
