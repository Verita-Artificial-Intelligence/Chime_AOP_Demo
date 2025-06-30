import React, { useState, useEffect } from "react";
import ServiceJourney from "./ServiceJourney";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BriefcaseIcon,
  ServerStackIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

interface WorkflowStep {
  id: string;
  type: "dataSource" | "action" | "llm";
  title: string;
  description: string;
  verificationRequired?: boolean;
  config?: any;
}

interface AIAgentExecutionSimulationProps {
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  steps?: WorkflowStep[];
  onRestart: () => void;
}

// Helper: Render a table for a list of objects
function SimpleTable({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data) || data.length === 0)
    return <div className="text-brand-muted">No data available.</div>;
  const columns = Object.keys(data[0]);
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-brand-border table-scroll">
      <table className="w-full border-collapse text-sm bg-brand-card min-w-max">
        <thead>
          <tr className="bg-brand-background">
            {columns.map((col) => (
              <th
                key={col}
                className="border-b border-r last:border-r-0 border-brand-border px-4 py-3 text-left capitalize text-brand-heading bg-brand-background whitespace-nowrap font-semibold"
              >
                {col.replace(/([A-Z])/g, " $1").trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td
                  key={col}
                  className="border-b border-r last:border-r-0 border-brand-border px-4 py-3 text-brand-heading"
                >
                  <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={String(row[col])}>
                    {row[col]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AIAgentExecutionSimulation({
  workflow,
  dataSources,
  actions,
  llm,
  steps = [],
  onRestart,
}: AIAgentExecutionSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [executionComplete, setExecutionComplete] = useState(false);
  const [runStartTime] = useState(new Date().toISOString());
  const [isPaused, setIsPaused] = useState(false);
  const [humanVerificationStep, setHumanVerificationStep] = useState<number | null>(null);

  // Build the step sequence: init, data sources, actions, complete
  const stepSequence = [
    { type: "init", label: `Initializing workflow for ${workflow}` },
    ...dataSources.map((ds) => ({
      type: "datasource",
      label: `Analyzing data source: ${ds}`,
      ds,
    })),
    ...actions.map((action) => ({
      type: "action",
      label: `Executing action: ${action}`,
      action,
    })),
    { type: "complete", label: "All steps completed!" },
  ];

  // Define critical actions that always require human verification
  const getCriticalActions = () => {
    return [
      "Close case",
      "Submit final response", 
      "Apply admin notation",
      "Delete tradeline",
      "Update credit bureau",
      "Send member acknowledgment",
      "Save case to OSCAR system",
      "Notify Fraud-Ops",
      "Notify Legal/Compliance"
    ];
  };

  const isCriticalAction = (action: string) => {
    const criticalActions = getCriticalActions();
    return criticalActions.some(critical => 
      action.toLowerCase().includes(critical.toLowerCase())
    );
  };

  // Check if a step requires verification based on step configuration
  const stepRequiresVerification = (stepIndex: number) => {
    const currentStepData = stepSequence[stepIndex];
    const isActionStep = currentStepData?.type === "action";
    const actionText = (currentStepData as any).action || "";
    
    if (!isActionStep) return false;
    
    // Find the corresponding step from the steps array to check verification setting
    // Match by action name/title from the steps configuration
    const matchingStep = steps.find(step => 
      step.type === "action" && 
      (step.title === actionText || 
       step.title.toLowerCase().includes(actionText.toLowerCase()) ||
       actionText.toLowerCase().includes(step.title.toLowerCase()))
    );
    
    // Require verification for:
    // 1. Steps with verification enabled in configuration
    // 2. Critical actions (always, regardless of setting)
    return (matchingStep?.verificationRequired === true) || isCriticalAction(actionText);
  };

  // Handle human verification completion - SIMPLE VERSION
  const handleVerificationComplete = () => {
    setIsPaused(false);
    setHumanVerificationStep(null);
    
    // Just move to next step immediately
    if (currentStep < stepSequence.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setExecutionComplete(true);
      saveCompletedRun();
    }
  };

  // SIMPLIFIED useEffect - just handles normal flow
  useEffect(() => {
    if (executionComplete || isPaused) return;
    
    // Check if current step needs verification
    const needsVerification = stepRequiresVerification(currentStep);
    
    if (needsVerification) {
      setIsPaused(true);
      setHumanVerificationStep(currentStep);
      return;
    }
    
    // Normal step progression
    if (currentStep < stepSequence.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1400);
      return () => clearTimeout(timer);
    } else {
      setExecutionComplete(true);
      saveCompletedRun();
    }
  }, [currentStep, executionComplete, isPaused]);

  const saveCompletedRun = () => {
    const isCustomWorkflow = workflow === "custom-workflow";

    const completedRun = {
      id: `run-${workflow}-${Date.now()}`,
      name: isCustomWorkflow ? "Custom Workflow" : workflow,
      description: isCustomWorkflow
        ? "A dynamically generated workflow based on user requirements"
        : `Automated workflow execution for ${workflow}`,
      category: isCustomWorkflow ? "Custom" : "General",
      status: "Completed",
      lastRun: new Date().toISOString(),
      runHistory: [
        {
          timestamp: runStartTime,
          status: "Started",
          details: "Workflow execution started",
        },
        ...dataSources.map((ds, index) => ({
          timestamp: new Date(
            new Date(runStartTime).getTime() + (index + 1) * 2000
          ).toISOString(),
          status: "Success",
          details: `Analyzed data source: ${ds}`,
        })),
        ...actions.map((action, index) => ({
          timestamp: new Date(
            new Date(runStartTime).getTime() +
              (dataSources.length + index + 1) * 2000
          ).toISOString(),
          status: "Success",
          details: `Executed action: ${action}`,
        })),
        {
          timestamp: new Date().toISOString(),
          status: "Success",
          details: "Workflow completed successfully",
        },
      ],
      metrics: {
        dataSourcesAnalyzed: String(dataSources.length),
        actionsExecuted: String(actions.length),
        totalSteps: String(stepSequence.length - 1),
        executionTime: `${Math.round(
          (new Date().getTime() - new Date(runStartTime).getTime()) / 1000
        )}s`,
      },
    };

    // Get existing run history from localStorage
    const existingHistory = localStorage.getItem("aopRunHistory");
    let runHistory: any[] = [];

    if (existingHistory) {
      try {
        runHistory = JSON.parse(existingHistory);
      } catch (e) {
        console.error("Error parsing existing run history:", e);
        runHistory = [];
      }
    }

    // Add the new completed run
    runHistory.push(completedRun);

    // Save back to localStorage
    localStorage.setItem("aopRunHistory", JSON.stringify(runHistory));
  };

  // Removed auto-scroll functionality to allow independent scrolling

  // Helper to get a human-readable summary/table for each data source
  const getDataSourceSummary = (ds: string) => {
    // Simplified data source summary without mockData
    return (
      <div className="text-brand-muted">
        Data source "{ds}" connected successfully.
      </div>
    );
  };

  // Helper to get a human-readable summary/result for each action
  const getActionSummary = (action: string) => {
    // Simplified action summary without mockData
    return (
      <div className="text-brand-muted">
        Action "{action}" executed successfully.
      </div>
    );
  };

  // Get platform link based on action type
  const getPlatformLink = (action: string) => {
    const actionLower = action.toLowerCase();
    const baseUrl = "http://localhost:3001";
    
    // Map actions to specific Chime tools
    if (actionLower.includes("oscar") || actionLower.includes("eoscar") || 
        actionLower.includes("credit") || actionLower.includes("bureau") || 
        actionLower.includes("tradeline") || actionLower.includes("dispute")) {
      return `${baseUrl}/eoscar`;
    } else if (actionLower.includes("zendesk") || actionLower.includes("case") || 
               actionLower.includes("ticket") || actionLower.includes("support") ||
               actionLower.includes("member") || actionLower.includes("acknowledgment")) {
      return `${baseUrl}/zendesk`;
    } else if (actionLower.includes("penny") || actionLower.includes("financial") || 
               actionLower.includes("payment") || actionLower.includes("balance")) {
      return `${baseUrl}/penny`;
    } else if (actionLower.includes("looker") || actionLower.includes("analytics") || 
               actionLower.includes("report") || actionLower.includes("dashboard")) {
      return `${baseUrl}/looker`;
    } else {
      // Default to main dashboard
      return baseUrl;
    }
  };

  // Get verification message based on action type
  const getVerificationMessage = (action: string) => {
    if (isCriticalAction(action)) {
      return `This action requires mandatory human verification before execution. Please review the case details in the Chime platform and confirm this action is appropriate.`;
    } else {
      return "This step requires human verification. Please review the details in the appropriate Chime platform.";
    }
  };

  // Stepper steps for all steps
  const stepperSteps = stepSequence.map((step, i) => ({
    title: `Step ${i + 1}`,
  }));

  // Render all completed steps (timeline)
  const renderedSteps = stepSequence
    .slice(0, currentStep + 1)
    .map((step, idx) => {
      // Do not render the 'complete' step card
      if (step.type === "complete") return null;
      return (
        <div
          key={idx}
          id={`agent-step-card-${idx}`}
          className="bg-brand-card border border-brand-border rounded-card shadow-card p-card animate-fadeIn mb-8 overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-brand-heading mb-2">
            {step.label}
          </h3>
          {step.type === "datasource" && (
            <div className="mt-4 overflow-hidden">
              <div className="text-xs text-brand-muted mb-2">
                Sample data being analyzed:
              </div>
              {getDataSourceSummary((step as any).ds)}
            </div>
          )}
          {step.type === "action" && (
            <div className="mt-4 overflow-hidden">
              {/* Human-in-the-loop verification interface */}
              {isPaused && humanVerificationStep === idx ? (
                <div className={`border rounded-lg p-4 ${
                  isCriticalAction((step as any).action || "") 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center mb-3">
                    <div className={`w-3 h-3 rounded-full mr-2 animate-pulse ${
                      isCriticalAction((step as any).action || "") 
                        ? 'bg-red-400' 
                        : 'bg-yellow-400'
                    }`}></div>
                    <span className={`text-sm font-semibold ${
                      isCriticalAction((step as any).action || "") 
                        ? 'text-red-800' 
                        : 'text-yellow-800'
                    }`}>
                      {isCriticalAction((step as any).action || "") 
                        ? 'Verification Required' 
                        : 'Human Verification Required'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    {getVerificationMessage((step as any).action || "")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={getPlatformLink((step as any).action)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 text-center text-sm font-medium transition-colors ${
                        isCriticalAction((step as any).action || "") 
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      }`}
                    >
                      Open Chime Platform →
                    </a>
                    <button
                      onClick={handleVerificationComplete}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium transition-colors"
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-xs text-brand-muted mb-2">Result:</div>
                  {getActionSummary((step as any).action)}
                </>
              )}
            </div>
          )}
          {step.type === "init" && (
            <div className="mt-4 text-brand-muted text-sm">
              Preparing environment and loading configuration...
            </div>
          )}
        </div>
      );
    });

  // PDF download handler
  const handleDownloadPDF = async () => {
    const element = document.getElementById("agent-simulation-content");
    if (!element) return;

    // Show loading state (optional)
    const downloadButton = document.querySelector(
      'button[onClick*="handleDownloadPDF"]'
    ) as HTMLButtonElement;
    if (downloadButton) {
      downloadButton.textContent = "Generating...";
      downloadButton.setAttribute("disabled", "true");
    }

    try {
      // Clone the element to avoid modifying the actual DOM
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Apply inline styles to ensure colors are captured correctly
      // Brand colors from Tailwind config
      const brandColors = {
        "text-brand-primary": "#1EC677",
        "text-brand-heading": "#0D4029",
        "text-brand-muted": "#0D4029",
        "text-brand-success": "#1EC677",
        "bg-brand-card": "#FFFFFF",
        "bg-brand-background": "#FFFFFF",
        "border-brand-border": "#E5E7EB",
      };

      // Apply inline styles to all elements with brand color classes
      Object.entries(brandColors).forEach(([className, color]) => {
        const elements = clonedElement.querySelectorAll(`.${className}`);
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (className.startsWith("text-")) {
            htmlEl.style.color = color;
          } else if (className.startsWith("bg-")) {
            htmlEl.style.backgroundColor = color;
          } else if (className.startsWith("border-")) {
            htmlEl.style.borderColor = color;
          }
        });
      });

      // Also handle text color for specific elements
      const headings = clonedElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((heading) => {
        (heading as HTMLElement).style.color = "#0D4029"; // Deep green for headings
      });

      const mutedTexts = clonedElement.querySelectorAll(".text-xs, .text-sm");
      mutedTexts.forEach((text) => {
        if (!(text as HTMLElement).style.color) {
          (text as HTMLElement).style.color = "#0D4029"; // Deep green for small text
        }
      });

      // Create a temporary container in the document
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Better html2canvas options for quality
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // Reduced from 3 to make text smaller
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        imageTimeout: 0,
        allowTaint: true,
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL("image/png", 1.0); // Max quality

      // Initialize PDF with better settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: false, // Disable compression for better quality
      });

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15; // 15mm margins
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // Calculate dimensions maintaining aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;
      const ratio = imgWidth / imgHeight;

      // Calculate how many pages we need
      const pdfWidth = contentWidth;
      const pdfHeight = pdfWidth / ratio;
      const totalPages = Math.ceil(pdfHeight / contentHeight);

      // Add metadata
      pdf.setProperties({
        title: `Workflow Report - ${workflow}`,
        subject: "AI Agent Execution Report",
        author: "Verita AI",
        keywords: "workflow, report, ai, agent",
        creator: "Verita AI Platform",
      });

      // Add content to PDF
      if (totalPages === 1) {
        // Single page - center the content
        const yOffset = (contentHeight - pdfHeight) / 2;
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin + Math.max(0, yOffset),
          pdfWidth,
          pdfHeight
        );
      } else {
        // Multiple pages - split the image
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }

          // Calculate the portion of the image to show on this page
          const sourceY = (page * contentHeight * imgWidth) / pdfWidth;
          const sourceHeight = (contentHeight * imgWidth) / pdfWidth;

          // Create a temporary canvas for this page's content
          const pageCanvas = document.createElement("canvas");
          const pageCtx = pageCanvas.getContext("2d");
          if (!pageCtx) continue; // Skip if context is not available
          pageCanvas.width = imgWidth;
          pageCanvas.height = Math.min(sourceHeight, imgHeight - sourceY);

          // Draw the portion of the original canvas
          pageCtx.drawImage(
            canvas,
            0,
            sourceY, // Source x, y
            imgWidth,
            pageCanvas.height, // Source width, height
            0,
            0, // Destination x, y
            imgWidth,
            pageCanvas.height // Destination width, height
          );

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const pageImgHeight = (pageCanvas.height * pdfWidth) / imgWidth;

          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin,
            pdfWidth,
            Math.min(pageImgHeight, contentHeight)
          );

          // Add page number
          pdf.setFontSize(10);
          pdf.setTextColor(13, 64, 41); // Chime green
          pdf.text(
            `Page ${page + 1} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `workflow-report-${workflow}-${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      // Reset button state
      if (downloadButton) {
        downloadButton.textContent = "Download Report";
        downloadButton.removeAttribute("disabled");
      }
    }
  };

  // Get proper workflow display name
  const getWorkflowDisplayName = (workflowId: string) => {
    const workflowMap: { [key: string]: string } = {
      'fcra-acdv-response': 'FCRA ACDV response',
      'fcra-indirect-dispute': 'FCRA indirect dispute',
      'aml-monitoring': 'AML monitoring',
      'regulatory-reporting': 'regulatory reporting',
      'audit-trail': 'audit trail',
      'risk-assessment': 'risk assessment',
      'custom-workflow': 'custom'
    };
    
    return workflowMap[workflowId] || workflowId.replace(/-/g, ' ');
  };

  return (
    <>
      {/* Add custom scrollbar styles */}
      <style>{`
        .table-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .table-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .table-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Firefox scrollbar */
        .table-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }
      `}</style>
      
      {/* Service Journey sidebar on the right */}
      <ServiceJourney steps={stepSequence} currentStep={currentStep} executionComplete={executionComplete} />
      
      {/* Main content area with margin to accommodate the sidebar */}
      <div className="w-full max-w-7xl mx-auto py-8 px-4 pr-[420px]">
        <div id="agent-simulation-content">
          {/* Modern summary card with pills/badges */}
          <div className="bg-brand-card border border-brand-border rounded-card shadow-card p-6 flex flex-col gap-4 items-center mb-8 text-white">
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm">
                <BriefcaseIcon className="w-4 h-4 mr-1" /> {getWorkflowDisplayName(workflow)}
              </span>
              {dataSources.map((ds, i) => (
                <span
                  key={ds + i}
                  className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm"
                >
                  <ServerStackIcon className="w-4 h-4 mr-1" /> {ds}
                </span>
              ))}
              <span className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm">
                <SparklesIcon className="w-4 h-4 mr-1" /> {llm}
              </span>
            </div>
          </div>
          {/* Timeline of steps */}
          {renderedSteps}
          {/* Loader and Completion */}
          {!executionComplete && (
            <div className="text-center mt-10">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-brand-primary h-12 w-12 mb-4 mx-auto"></div>
              <p className="text-lg text-brand-muted">
                {stepSequence[currentStep].label}...
              </p>
            </div>
          )}
          {executionComplete && (
            <div className="flex flex-col items-center justify-center mt-20 mb-12">
              <div className="bg-brand-card border border-brand-border rounded-card shadow-card px-8 py-6 flex flex-col items-center w-full max-w-md">
                <span className="inline-flex items-center text-brand-success text-base font-semibold gap-2 mb-4">
                  <svg
                    className="w-5 h-5 text-brand-success"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12l2.5 2.5L16 9"
                    />
                  </svg>
                  Workflow Completed
                </span>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  {workflow === 'fcra-acdv-response' 
                    ? 'FCRA ACDV response workflow has been executed' 
                    : workflow === 'fcra-indirect-dispute'
                    ? 'FCRA indirect dispute workflow has been executed'
                    : workflow === 'aml-monitoring'
                    ? 'AML monitoring workflow has been executed'
                    : workflow === 'regulatory-reporting'
                    ? 'Regulatory reporting workflow has been executed'
                    : workflow === 'audit-trail'
                    ? 'Audit trail workflow has been executed'
                    : workflow === 'risk-assessment'
                    ? 'Risk assessment workflow has been executed'
                    : workflow === 'custom-workflow'
                    ? 'Custom workflow has been executed'
                    : `${workflow.replace(/-/g, ' ')} workflow has been executed`}
                </p>
                <div className="flex justify-center gap-4 mt-2 w-full">
                  <button className="btn-primary w-1/2" onClick={onRestart}>
                    New Agent
                  </button>
                  <button
                    className="btn-primary w-1/2"
                    onClick={handleDownloadPDF}
                  >
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Loader and fadeIn animation (add to your global CSS if not present)
/*
.loader {
  border-top-color: #635BFF;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
*/
