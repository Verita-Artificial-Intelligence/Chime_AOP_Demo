import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  PlayIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { WorkflowStepsDisplay } from "../components/WorkflowStepsDisplay";
import { ApiActiveWorkflows } from "../components/ApiActiveWorkflows";
import jsPDF from "jspdf";
import { slackNotificationService } from "../services/slackNotificationService";

// Import templates API service
import { templatesApiService, WorkflowStep as ApiWorkflowStep } from "../services/templatesApiService";

// Use the WorkflowStep type from the API service
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

  
  // Active workflows state (moved to top to fix hooks order)
  const getActiveWorkflows = () => {
    try {
      const stored = localStorage.getItem('activeWorkflows');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const [activeWorkflows, setActiveWorkflows] = useState(getActiveWorkflows());
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(searchParams.get('id'));
  
  // Track processed location states to prevent duplicates
  const processedLocationRef = useRef<string | null>(null);

  // Cancel workflow function
  const handleCancelWorkflow = (workflowId: string, workflowName: string) => {
    if (!confirm(`Are you sure you want to cancel "${workflowName}"?`)) return;
    
    const currentWorkflows = getActiveWorkflows();
    const updatedWorkflows = currentWorkflows.filter(w => w.id !== workflowId);
    
    setActiveWorkflows(updatedWorkflows);
    localStorage.setItem('activeWorkflows', JSON.stringify(updatedWorkflows));
    
    console.log(`🚫 Cancelled workflow: ${workflowName}`);
    
    // If we're currently viewing the cancelled workflow, go back to list
    if (selectedWorkflowId === workflowId) {
      setSelectedWorkflowId(null);
      navigate('/workflow/active-runs', { replace: true });
    }
  };
  
  // SOP workflow state
  const [sopToWorkflowData, setSopToWorkflowData] = useState<
    WorkflowStep[] | null
  >(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sopStartTime] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to load template data from API
  const loadTemplateData = async (templateId: string): Promise<WorkflowStep[]> => {
    try {
      const steps = await templatesApiService.getTemplateSteps(templateId);
      // Convert API WorkflowStep to local WorkflowStep format
      return steps.map(step => ({
        step: step.step,
        action: step.action,
        element_description: step.element_description,
        element_type: step.element_type,
        value: step.value,
        heading: step.heading
      }));
    } catch (error) {
      console.error(`Error loading template data for ${templateId}:`, error);
      throw new Error(`Failed to load template data: ${error}`);
    }
  };

  // Check if we're coming from templates page with a template selection
  useEffect(() => {
    const loadWorkflowData = async () => {
      if (location.state && location.state.templateId) {
        const {
          templateId,
          templateTitle,
          jsonFile,
          workflowSteps,
          stepVerifications,
          isRunning,
        } = location.state;

        try {
          // Load the corresponding JSON data from API or use provided workflowSteps
          const jsonData = workflowSteps || await loadTemplateData(templateId);
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
        } catch (error) {
          console.error('Error loading workflow data:', error);
          // Could show an error message to user here
        }
      }

      // Don't clear location.state here, we need it for templateId
    };

    loadWorkflowData();
  }, [location.state]);

  // Listen for new workflows from review page (moved after other useEffects)
  useEffect(() => {
    if (location.state && location.state.isRunning && location.state.templateId) {
      // Check for duplicates first
      const currentWorkflows = getActiveWorkflows();
      const duplicate = currentWorkflows.find(w => 
        w.templateId === location.state.templateId && 
        w.name === location.state.templateTitle
      );
      
      if (duplicate) {
        console.log('⚠️ Duplicate workflow detected, navigating to existing:', duplicate.id);
        navigate(`/workflow/active-runs?id=${duplicate.id}`, { replace: true });
        return;
      }
      
      const newWorkflow = {
        id: `workflow-${Date.now()}`,
        name: location.state.templateTitle,
        templateId: location.state.templateId,
        status: 'Running',
        startTime: new Date().toISOString(),
        steps: location.state.workflowSteps,
        stepVerifications: location.state.stepVerifications || {},
        currentStep: 1, // Start at step 1, not 0
        lastUpdated: new Date().toISOString(),
        isRunning: true,
      };
      
      const updated = [...currentWorkflows, newWorkflow];
      setActiveWorkflows(updated);
      localStorage.setItem('activeWorkflows', JSON.stringify(updated));
      
      // Navigate to this workflow
      navigate(`/workflow/active-runs?id=${newWorkflow.id}`, { replace: true });
      
      console.log('✅ Created active workflow:', newWorkflow);
      
      // Clear location state to prevent re-running
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
    }
  }, [location.state, navigate]);

  // Background workflow progression
  useEffect(() => {
    const progressWorkflows = () => {
      const currentWorkflows = getActiveWorkflows();
      let hasUpdates = false;
      
      const updatedWorkflows = currentWorkflows.map(workflow => {
        if (!workflow.isRunning || workflow.status !== 'Running') return workflow;
        
        const now = new Date();
        const lastUpdated = new Date(workflow.lastUpdated);
        const timeDiff = now.getTime() - lastUpdated.getTime();
        
        // Advance step every 2 seconds
        if (timeDiff >= 2000) {
          const nextStep = workflow.currentStep + 1;
          
          // Check if workflow is complete
          if (nextStep >= workflow.steps.length) {
            // Move to history
            const runHistory = JSON.parse(localStorage.getItem("workflowRunHistory") || "[]");
            const completedWorkflow = {
              id: workflow.id,
              name: workflow.name,
              description: `Template-based workflow: ${workflow.name}`,
              category: "TEMPLATE EXECUTION",
              status: "Completed",
              lastRun: now.toISOString(),
              runHistory: [{
                timestamp: now.toISOString(),
                status: "Success",
                details: `Workflow completed with ${workflow.steps.length} steps`,
              }],
              metrics: {
                totalSteps: workflow.steps.length.toString(),
                completionTime: Math.floor((now.getTime() - new Date(workflow.startTime).getTime()) / 1000) + ' seconds',
              },
              steps: workflow.steps,
            };
            
            runHistory.unshift(completedWorkflow);
            localStorage.setItem("workflowRunHistory", JSON.stringify(runHistory));
            
            console.log('✅ Workflow completed and moved to history:', workflow.name);
            hasUpdates = true;
            return null; // Remove from active workflows
          }
          
          // Continue workflow
          hasUpdates = true;
          return {
            ...workflow,
            currentStep: nextStep,
            lastUpdated: now.toISOString(),
            status: 'Running'
          };
        }
        
        return workflow;
      }).filter(Boolean); // Remove nulls (completed workflows)
      
      if (hasUpdates) {
        localStorage.setItem('activeWorkflows', JSON.stringify(updatedWorkflows));
        setActiveWorkflows(updatedWorkflows);
      }
    };
    
    // Run every second
    const interval = setInterval(progressWorkflows, 1000);
    
    // Run once on mount
    progressWorkflows();
    
    return () => clearInterval(interval);
  }, []);

  // Real-time updates for active workflows table
  useEffect(() => {
    const refreshActiveWorkflows = () => {
      const currentWorkflows = getActiveWorkflows();
      setActiveWorkflows(currentWorkflows);
    };
    
    // Refresh every 2 seconds to show real-time progress
    const interval = setInterval(refreshActiveWorkflows, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Check if we're coming from SOP to Workflow
  useEffect(() => {
    const source = searchParams.get("source");
    if (source === "sop-to-workflow") {
      const data = sessionStorage.getItem("sopToWorkflowData");
      if (data) {
        const workflowData = JSON.parse(data);
        setSopToWorkflowData(workflowData);
        sessionStorage.removeItem("sopToWorkflowData");
        
        // Send workflow start notification
        slackNotificationService.sendWorkflowStartNotification("SOP Workflow Execution");
        
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
      // Check if current step is a big action that requires notification
      const currentStepData = sopToWorkflowData[currentStep - 1];
      const bigActions = ['transmit', 'upload', 'send', 'submit', 'trigger', 'fire', 'post', 'create', 'update', 'delete'];
      const isBigAction = bigActions.some(action => 
        currentStepData.action.toLowerCase().includes(action.toLowerCase())
      );
      
      if (isBigAction) {
        slackNotificationService.sendBigActionNotification(
          currentStepData.heading || currentStepData.element_description
        );
      }

      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (sopToWorkflowData && currentStep === sopToWorkflowData.length) {
      // Send completion notification
      slackNotificationService.sendCompletionNotification("SOP Workflow Execution", sopToWorkflowData.length);
      
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

  // Show individual workflow if ID is selected
  if (selectedWorkflowId) {
    const workflow = activeWorkflows.find(w => w.id === selectedWorkflowId);
    if (workflow) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-4 p-6 border-b border-gray-200 bg-white">
            <button
              onClick={() => {
                setSelectedWorkflowId(null);
                navigate('/workflow/active-runs', { replace: true });
              }}
              className="flex items-center gap-2 px-3 py-2 text-brand-primary hover:bg-brand-light rounded transition-colors"
            >
              ← Back to Active Workflows
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-brand-heading">{workflow.name}</h1>
              <p className="text-brand-muted">Started: {new Date(workflow.startTime).toLocaleString()}</p>
            </div>
            <button
              onClick={() => handleCancelWorkflow(workflow.id, workflow.name)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              title={`Cancel ${workflow.name}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <WorkflowStepsDisplay
              steps={workflow.steps}
              title={workflow.name}
              templateId={workflow.templateId}
              initialStep={workflow.currentStep || 1}
              backgroundMode={true}
            />
          </div>
        </div>
      );
    }
  }

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



  // Use legacy localStorage tracking system for active workflows
  // But keep API integration for SOP upload and workflow execution
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-heading">
            Active Workflows
          </h1>
          <p className="text-brand-muted mt-1">
            Monitor and manage your running workflows
          </p>
        </div>
      </div>

      {activeWorkflows.length === 0 ? (
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-brand-border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Workflows ({activeWorkflows.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center">
                            <PlayIcon className="h-5 w-5 text-brand-primary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                          <div className="text-sm text-gray-500">Template: {workflow.templateId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(workflow.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Step {workflow.currentStep || 1} of {workflow.steps.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setSelectedWorkflowId(workflow.id);
                            navigate(`/workflow/active-runs?id=${workflow.id}`);
                          }}
                          className="text-brand-primary hover:text-brand-primaryDark font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleCancelWorkflow(workflow.id, workflow.name)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title={`Cancel ${workflow.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Show workflow details if selected */}
      {selectedWorkflowId && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Workflow Details</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Details for workflow: {selectedWorkflowId}</p>
            {/* Add more details here as needed */}
          </div>
        </div>
      )}
    </div>
  );
};
