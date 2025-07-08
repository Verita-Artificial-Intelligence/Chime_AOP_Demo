import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  PlayIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { WorkflowStepsDisplay } from "../components/WorkflowStepsDisplay";
import { ActiveWorkflowDisplay } from "../components/ActiveWorkflowDisplay";
import { useWorkflowContext } from "../contexts/WorkflowContext";
import jsPDF from "jspdf";

// Import the JSON files
import creditDisputeBureauData from "../data/Credit-Dispute-through-Credit-Bureau.json";
import directDisputeMemberData from "../data/Direct-Dispute-from-Member.json";
import kycKybWorkflowData from "../data/kyc_kyb_workflow.json";
import vendorWorkflowData from "../data/vendor_workflow.json";
import vendorMaintenanceOffboardingData from "../data/vendor_maintenance_offboarding.json";
import complianceOperationsWorkflowData from "../data/compliance_operations_workflow.json";
import kycAuditWorkflowData from "../data/kyb_audit_workflow.json";

interface WorkflowStep {
  step: number;
  action: string;
  element_description: string;
  element_type: string;
  value?: string;
  heading?: string;
}

export const ActiveRunsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [workflowJsonData, setWorkflowJsonData] = useState<
    WorkflowStep[] | null
  >(null);
  const [workflowTitle, setWorkflowTitle] = useState<string>("");
  const { activeWorkflows } = useWorkflowContext();

  // Map template IDs to their JSON data
  const templateDataMap: Record<string, WorkflowStep[]> = {
    "credit-dispute-credit-bureau": creditDisputeBureauData,
    "direct-dispute-member": directDisputeMemberData,
    "kyc-kyb-workflow": kycKybWorkflowData,
    "vendor-workflow": vendorWorkflowData,
    "vendor-maintenance-offboarding": vendorMaintenanceOffboardingData,
    "compliance-operations-workflow": complianceOperationsWorkflowData,
    "kyb-audit-workflow": kycAuditWorkflowData,
  };

  // Check if we're coming from templates page with a template selection
  useEffect(() => {
    if (location.state && location.state.templateId) {
      const {
        templateId,
        templateTitle,
        jsonFile,
        workflowSteps,
        stepVerifications,
        isRunning,
      } = location.state;

      // Load the corresponding JSON data
      const jsonData = templateDataMap[templateId] || workflowSteps;
      if (jsonData) {
        setWorkflowJsonData(jsonData);
        setWorkflowTitle(templateTitle);

        // If coming from review page with isRunning flag, we'll use WorkflowStepsDisplay
        // No need to create ActiveRun or set showSimulation=true
        if (isRunning && workflowSteps) {
          // Load saved customizations from localStorage
          const savedCustomizations = localStorage.getItem(
            `workflow-custom-${templateId}`
          );
          if (savedCustomizations) {
            try {
              const customizations = JSON.parse(savedCustomizations);
              // Use the customized workflow data if available
              if (customizations.workflowData) {
                setWorkflowJsonData(customizations.workflowData);
              }
            } catch (e) {
              console.error("Error parsing customizations:", e);
            }
          }
        }
      }

      // Don't clear location.state here, we need it for templateId
    }
  }, [location.state]);

  const [sopToWorkflowData, setSopToWorkflowData] = useState<
    WorkflowStep[] | null
  >(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sopStartTime] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if we're coming from SOP to Workflow
  useEffect(() => {
    const source = searchParams.get("source");
    if (source === "sop-to-workflow") {
      const data = sessionStorage.getItem("sopToWorkflowData");
      if (data) {
        setSopToWorkflowData(JSON.parse(data));
        sessionStorage.removeItem("sopToWorkflowData");
        // Start the animation
        setTimeout(() => setCurrentStep(1), 500);
      }
    }
  }, [searchParams]);

  // Animate through steps
  useEffect(() => {
    if (
      sopToWorkflowData &&
      currentStep > 0 &&
      currentStep < sopToWorkflowData.length
    ) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (sopToWorkflowData && currentStep === sopToWorkflowData.length) {
      // Save SOP workflow to history when completed
      const runHistory = JSON.parse(
        localStorage.getItem("workflowRunHistory") || "[]"
      );
      const newRun = {
        id: `sop-run-${Date.now()}`,
        name: "SOP Workflow Execution",
        description: `Automated workflow from uploaded SOP with ${sopToWorkflowData.length} steps`,
        category: "SOP CONVERSION",
        status: "Completed",
        lastRun: new Date().toISOString(),
        runHistory: [
          {
            timestamp: new Date().toISOString(),
            status: "Success",
            details: `SOP workflow completed with ${sopToWorkflowData.length} steps`,
          },
        ],
        metrics: {
          totalSteps: sopToWorkflowData.length.toString(),
          completionTime: `${Math.floor(
            (new Date().getTime() - sopStartTime.getTime()) / 1000
          )} seconds`,
        },
        steps: sopToWorkflowData,
      };
      runHistory.unshift(newRun);
      localStorage.setItem("workflowRunHistory", JSON.stringify(runHistory));
    }
  }, [currentStep, sopToWorkflowData]);

  const handleDownloadReport = async () => {
    if (!sopToWorkflowData) return;

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
      pdf.text("SOP Workflow Execution Report", margin, 25);

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
      pdf.text(sopToWorkflowData.length.toString(), margin + 25, yPosition);

      yPosition += 6;
      pdf.setFont("helvetica", "bold");
      pdf.text("Execution Time:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `${Math.floor(
          (new Date().getTime() - sopStartTime.getTime()) / 1000
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
      sopToWorkflowData.forEach((step, index) => {
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
      const fileName = `SOP_Workflow_Report_${new Date().getTime()}.pdf`;
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

  // If we're showing JSON workflow data from templates
  if (workflowJsonData && workflowTitle) {
    return (
      <WorkflowStepsDisplay
        steps={workflowJsonData}
        title={workflowTitle}
        templateId={location.state?.templateId}
      />
    );
  }

  // If we're showing SOP to Workflow data
  if (sopToWorkflowData) {
    const getActionIcon = (action: string) => {
      switch (action) {
        case "type":
          return <DocumentTextIcon className="h-5 w-5" />;
        case "click":
          return <CursorArrowRaysIcon className="h-5 w-5" />;
        case "check":
          return <CheckCircleIcon className="h-5 w-5" />;
        default:
          return <PlayIcon className="h-5 w-5" />;
      }
    };

    const getActionColor = (action: string) => {
      switch (action) {
        case "type":
          return "bg-blue-100 text-blue-600";
        case "click":
          return "bg-green-100 text-green-600";
        case "check":
          return "bg-purple-100 text-purple-600";
        default:
          return "bg-gray-100 text-gray-600";
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-heading mb-1">
            SOP Workflow Execution
          </h1>
          <p className="text-brand-muted">Processing uploaded SOP documents</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: Step {currentStep} of {sopToWorkflowData.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((currentStep / sopToWorkflowData.length) * 100)}%
                Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(currentStep / sopToWorkflowData.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {sopToWorkflowData.map((step, index) => {
              const isActive = index < currentStep;
              const isCurrent = index === currentStep - 1;

              return (
                <div
                  key={step.step}
                  className={`p-4 rounded-lg border transition-all duration-500 ${
                    isCurrent
                      ? "border-brand-primary bg-brand-light"
                      : isActive
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? getActionColor(step.action)
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {getActionIcon(step.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          Step {step.step}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isActive
                              ? "bg-brand-primary text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {step.action.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        {step.element_description}
                      </p>
                      {step.value && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Value:</span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
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
                    {isActive && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {currentStep === sopToWorkflowData.length && (
            <div className="mt-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg mb-2">
                  <CheckCircleIcon className="h-6 w-6" />
                  <span className="font-semibold text-lg">
                    Workflow Completed Successfully
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  All {sopToWorkflowData.length} steps have been executed
                  successfully
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
                  {isDownloading
                    ? "Generating Report..."
                    : "Download PDF Report"}
                </button>

                <button
                  onClick={() => navigate("/workflow/run")}
                  className="px-6 py-3 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors font-medium"
                >
                  View Workflow History
                </button>

                <button
                  onClick={() => navigate("/workflow/sop-to-workflow")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Upload New SOP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get active workflows from context
  const runningWorkflows = Array.from(activeWorkflows.entries()).filter(
    ([_, workflow]) => workflow.status === 'running' || workflow.status === 'paused'
  );

  // Default view - show active workflows
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-heading">
          Active Workflows
        </h1>
        <p className="text-brand-muted mt-1">
          Monitor and manage your running workflows
        </p>
      </div>

      {runningWorkflows.length > 0 ? (
        <div className="space-y-6">
          {runningWorkflows.map(([workflowId, _]) => (
            <ActiveWorkflowDisplay key={workflowId} workflowId={workflowId} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-brand-border p-8">
          <div className="text-center">
            <div className="mb-4">
              <PlayIcon className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Workflows
            </h3>
            <p className="text-gray-500 mb-6">
              Start a workflow from templates or upload an SOP to begin
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/workflow/templates")}
                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark transition-colors"
              >
                Browse Templates
              </button>
              <button
                onClick={() => navigate("/workflow/sop-to-workflow")}
                className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors"
              >
                Upload SOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
