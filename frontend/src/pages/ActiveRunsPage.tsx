import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  PlayIcon,
  ClockIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { WorkflowStepsDisplay } from "../components/WorkflowStepsDisplay";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Import the JSON files
import creditDisputeBureauData from "../data/Credit-Dispute-through-Credit-Bureau.json";
import directDisputeMemberData from "../data/Direct-Dispute-from-Member.json";
import complexDisputeEquifaxData from "../data/Complex-Dispute-via-Equifax.json";

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
  const workflowRef = useRef<HTMLDivElement>(null);
  const [workflowJsonData, setWorkflowJsonData] = useState<
    WorkflowStep[] | null
  >(null);
  const [workflowTitle, setWorkflowTitle] = useState<string>("");

  // Map template IDs to their JSON data
  const templateDataMap: Record<string, WorkflowStep[]> = {
    "credit-dispute-credit-bureau": creditDisputeBureauData,
    "direct-dispute-member": directDisputeMemberData,
    "complex-dispute-equifax": complexDisputeEquifaxData,
  };

  // Check if we're coming from templates page with a template selection
  useEffect(() => {
    if (location.state && location.state.templateId) {
      const { templateId, templateTitle, jsonFile, workflowSteps, stepVerifications, isRunning } = location.state;

      // Load the corresponding JSON data
      const jsonData = templateDataMap[templateId] || workflowSteps;
      if (jsonData) {
        setWorkflowJsonData(jsonData);
        setWorkflowTitle(templateTitle);
        
        // If coming from review page with isRunning flag, we'll use WorkflowStepsDisplay
        // No need to create ActiveRun or set showSimulation=true
        if (isRunning && workflowSteps) {
          // Load saved customizations from localStorage
          const savedCustomizations = localStorage.getItem(`workflow-custom-${templateId}`);
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
      const runHistory = JSON.parse(localStorage.getItem("workflowRunHistory") || "[]");
      const newRun = {
        id: `sop-run-${Date.now()}`,
        name: "SOP Workflow Execution",
        description: `Automated workflow from uploaded SOP with ${sopToWorkflowData.length} steps`,
        category: "SOP CONVERSION",
        status: "Completed",
        lastRun: new Date().toISOString(),
        runHistory: [{
          timestamp: new Date().toISOString(),
          status: "Success",
          details: `SOP workflow completed with ${sopToWorkflowData.length} steps`,
        }],
        metrics: {
          totalSteps: sopToWorkflowData.length.toString(),
          completionTime: `${Math.floor((new Date().getTime() - sopStartTime.getTime()) / 1000)} seconds`,
        },
        steps: sopToWorkflowData,
      };
      runHistory.unshift(newRun);
      localStorage.setItem("workflowRunHistory", JSON.stringify(runHistory));
    }
  }, [currentStep, sopToWorkflowData]);

  const handleDownloadReport = async () => {
    if (!workflowRef.current || !sopToWorkflowData) return;
    
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
      pdf.text('SOP Workflow Execution Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Completed on: ${new Date().toLocaleString()}`, 20, 30);
      pdf.text(`Total Steps: ${sopToWorkflowData.length}`, 20, 37);
      pdf.text(`Execution Time: ${Math.floor((new Date().getTime() - sopStartTime.getTime()) / 1000)} seconds`, 20, 44);
      
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
      const fileName = `SOP_Workflow_Report_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
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
      <div className="max-w-4xl mx-auto" ref={workflowRef}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            SOP Workflow Execution
          </h1>
          <p className="text-gray-600">Processing uploaded SOP documents</p>
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
                  All {sopToWorkflowData.length} steps have been executed successfully
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

  // Default view when no active workflows
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Active Workflows
        </h1>
        <p className="text-gray-600">
          Monitor your currently executing automation workflows
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <PlayIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No workflows are currently running
        </h2>
        <p className="text-gray-600 mb-6">
          Start a new automation workflow from templates
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/workflow/templates")}
            className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover transition-colors font-semibold"
          >
            Browse Templates
          </button>
        </div>
      </div>
    </div>
  );
};
