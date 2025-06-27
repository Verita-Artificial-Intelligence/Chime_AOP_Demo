import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  PlayIcon,
  ClockIcon,
  ArrowPathIcon,
  PencilIcon,
  XMarkIcon,
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { SiGmail, SiSlack } from "react-icons/si";
import { FaSquare, FaCircle } from "react-icons/fa";
import { AIAgentExecutionSimulation } from "../components/AIAgentExecutionSimulation";

interface WorkflowStep {
  id: string;
  type: "dataSource" | "action" | "llm";
  title: string;
  description: string;
  verificationRequired?: boolean; // Only applies to action steps
  config?: any;
}

interface ActiveRun {
  id: string;
  name: string;
  startTime: string;
  currentStep: number;
  totalSteps: number;
  status: "running" | "paused" | "ready";
  estimatedCompletion: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  steps: WorkflowStep[];
}

// Verification options with icons
const verificationOptions = [
  { value: "default", label: "No Verification", icon: FaSquare },
  { value: "simple", label: "Simple Verification", icon: FaCircle },
  { value: "optional", label: "Gmail Verification", icon: SiGmail },
  { value: "slack", label: "Slack Verification", icon: SiSlack },
];

// Custom dropdown component for verification options
const VerificationDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const currentOption =
    verificationOptions.find((opt) => opt.value === value) ||
    verificationOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white hover:bg-gray-50 transition-colors min-w-[140px]"
      >
        {currentOption.icon && <currentOption.icon className="h-3 w-3" />}
        <span className="flex-1 text-left truncate">{currentOption.label}</span>
        <ChevronDownIcon
          className={`h-3 w-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[180px]">
          {verificationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-2 py-2 text-xs hover:bg-gray-50 transition-colors ${
                option.value === value
                  ? "bg-brand-light text-brand-primary"
                  : ""
              }`}
            >
              {option.icon && <option.icon className="h-3 w-3" />}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface SOPToWorkflowStep {
  step: number;
  action: string;
  element_description: string;
  element_type: string;
  value?: string;
}

export const ActiveRunsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showSimulation, setShowSimulation] = useState(false);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Define critical actions that always require verification
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
      "Notify Legal/Compliance",
    ];
  };

  const isCriticalAction = (action: string) => {
    const criticalActions = getCriticalActions();
    return criticalActions.some((critical) =>
      action.toLowerCase().includes(critical.toLowerCase())
    );
  };

  // Convert workflow data to steps
  const createWorkflowSteps = (
    dataSources: string[],
    actions: string[],
    llm: string
  ): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];

    // Add data source steps
    dataSources.forEach((source, index) => {
      steps.push({
        id: `ds-${index}`,
        type: "dataSource",
        title: `Data Source: ${source}`,
        description: `Connect and retrieve data from ${source}`,
      });
    });

    // Add LLM step
    if (llm) {
      steps.push({
        id: "llm-step",
        type: "llm",
        title: `LLM: ${llm}`,
        description: `Process data using ${llm} language model`,
      });
    }

    // Add action steps
    actions.forEach((action, index) => {
      steps.push({
        id: `action-${index}`,
        type: "action",
        title: `Action: ${action}`,
        description: `Execute ${action}`,
        verificationRequired: isCriticalAction(action), // Auto-enable for critical actions
      });
    });

    return steps;
  };

  const [sopToWorkflowData, setSopToWorkflowData] = useState<
    SOPToWorkflowStep[] | null
  >(null);
  const [currentStep, setCurrentStep] = useState(0);

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
    }
  }, [currentStep, sopToWorkflowData]);

  // Check if we're coming from the Workflow Builder or Templates with a new run
  useEffect(() => {
    if (location.state && location.state.workflow && location.state.isRunning) {
      const workflowId = location.state.id || `run-${Date.now()}`;
      
      // Try to load existing configuration from localStorage first
      const existingConfigs = JSON.parse(
        localStorage.getItem("workflowConfigs") || "[]"
      );
      const savedConfig = existingConfigs.find(
        (config: any) => config.id === workflowId
      );
      
      let steps;
      if (location.state.steps) {
        // Use the steps passed from the review component
        steps = location.state.steps;
      } else if (savedConfig && savedConfig.steps) {
        // Use saved steps with verification settings
        steps = savedConfig.steps;
      } else {
        // Create new steps with default settings
        steps = createWorkflowSteps(
          location.state.dataSources || [],
          location.state.actions || [],
          location.state.llm || ""
        );
      }
      
      const newRun: ActiveRun = {
        id: workflowId,
        name:
          location.state.name ||
          "FCRA - Respond to ACDV case, Apply response code, Respond to consumer",
        startTime: new Date().toLocaleString(),
        currentStep: 0,
        totalSteps: steps.length,
        status: "ready",
        estimatedCompletion: "15-20 mins",
        workflow: location.state.workflow,
        dataSources: location.state.dataSources || [],
        actions: location.state.actions || [],
        llm: location.state.llm || "",
        steps,
      };
      setActiveRun(newRun);
      setIsRunning(true);
      setShowSimulation(true);
      
      // Clear the location state to prevent re-runs on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleRunWorkflow = () => {
    if (activeRun) {
      setIsRunning(true);
      setShowSimulation(true);
    }
  };

  // Create verification URL for action steps, collecting data from previous steps
  const createVerificationUrl = (step: WorkflowStep) => {
    const baseUrl = "http://localhost:3001"; // chimetools URL
    const params = new URLSearchParams();

    // Add common parameters
    params.set("workflowId", activeRun?.id || "");
    params.set("stepId", step.id);
    params.set("stepTitle", step.title);
    params.set("workflowName", activeRun?.name || "");

    // Collect data from previous steps to pre-fill forms
    if (activeRun) {
      const currentIndex = activeRun.steps.findIndex((s) => s.id === step.id);
      const previousSteps = activeRun.steps.slice(0, currentIndex);

      // Extract member/account data from previous data source steps
      const memberDataStep = previousSteps.find(
        (s) =>
          s.type === "dataSource" &&
          (s.title.toLowerCase().includes("penny") ||
            s.title.toLowerCase().includes("account") ||
            s.title.toLowerCase().includes("member"))
      );

      if (memberDataStep) {
        // Penny page parameters (for workflow context display)
        params.set("memberName", "Victoria Lockhart");
        params.set("memberId", "62151244");

        // eOSCAR/Zendesk form parameters (match exact field names)
        params.set("actualPaymentAmount", "39.00");
        params.set("dateOfLastPayment", "2024-04-12");
        params.set("currentBalance", "145.32");
        params.set("lastPaymentAmount", "39.00");
        params.set("lastPaymentDate", "2024-04-12");
        params.set("accountStatus", "Open");
        params.set("hasTransactions", "true");
        params.set("highestCreditLimit", "500");
      }

      // Extract analytics data from previous steps
      const analyticsDataStep = previousSteps.find(
        (s) =>
          s.type === "dataSource" &&
          (s.title.toLowerCase().includes("looker") ||
            s.title.toLowerCase().includes("analytics") ||
            s.title.toLowerCase().includes("data"))
      );

      if (analyticsDataStep) {
        // Looker analytics parameters (match exact field names)
        params.set("dateRange", "last30days");
        params.set("totalTransactions", "156");
        params.set("totalSpent", "3456.78");
        params.set("disputedTransactions", "3");
      }

      // Extract LLM processing data
      const llmStep = previousSteps.find((s) => s.type === "llm");
      if (llmStep) {
        params.set("llmModel", activeRun.llm || "GPT-4");
        params.set("processType", "llm");
      }
    }

    const stepTitleLower = step.title.toLowerCase();

    // Only handle action steps (since only actions have verify buttons now)
    if (step.type === "action") {
      // Communication/member interactions → Zendesk
      if (
        stepTitleLower.includes("send") ||
        stepTitleLower.includes("member") ||
        stepTitleLower.includes("acknowledgment") ||
        stepTitleLower.includes("notify") ||
        stepTitleLower.includes("email") ||
        stepTitleLower.includes("ticket") ||
        stepTitleLower.includes("response") ||
        stepTitleLower.includes("zendesk") ||
        stepTitleLower.includes("communication") ||
        stepTitleLower.includes("contact")
      ) {
        // Zendesk-specific parameters (exact field names from Zendesk form)
        params.set("contactReason", "Balance");
        params.set("creditReportingAgency", "TransUnion");
        params.set("responseCode", "23");
        params.set("disputeCode", "118");
        params.set("acdbNumber", "ACDB-2024-0001");
        params.set("formType", "consumerDispute");
        params.set("macro", "acknowledgment");
        params.set("ticketStatus", "Open");
        return `${baseUrl}/zendesk?${params.toString()}`;
      }

      // Credit reporting/account updates → eOSCAR
      if (
        stepTitleLower.includes("eoscar") ||
        stepTitleLower.includes("update") ||
        stepTitleLower.includes("credit") ||
        stepTitleLower.includes("report") ||
        stepTitleLower.includes("dispute") ||
        stepTitleLower.includes("acdv") ||
        stepTitleLower.includes("bureau") ||
        stepTitleLower.includes("account")
      ) {
        // eOSCAR-specific parameters (exact field names from eOSCAR form)
        params.set("responseCode", "23");
        params.set("portfolioType", "Secure");
        params.set("paymentRating", "N/A");
        params.set("nonPursuitDelinquency", "None");
        return `${baseUrl}/eoscar?${params.toString()}`;
      }

      // Default action to Zendesk (most actions involve communication)
      params.set("contactReason", "Balance");
      params.set("creditReportingAgency", "TransUnion");
      params.set("responseCode", "23");
      params.set("disputeCode", "118");
      params.set("acdbNumber", "ACDB-2024-0001");
      params.set("formType", "consumerDispute");
      params.set("macro", "acknowledgment");
      params.set("ticketStatus", "Open");
      return `${baseUrl}/zendesk?${params.toString()}`;
    }

    // Fallback to main dashboard with workflow context
    return `${baseUrl}?${params.toString()}`;
  };

  const handleEditTemplate = () => {
    setIsEditMode(true);
    setEditingStep(null); // Clear any individual step editing
  };

  const handleCancelEditMode = () => {
    setIsEditMode(false);
    setEditingStep(null);
  };

  const handleSaveTemplate = () => {
    // Save workflow configuration including verification settings to localStorage
    if (activeRun) {
      const workflowConfig = {
        id: activeRun.id,
        name: activeRun.name,
        workflow: activeRun.workflow,
        dataSources: activeRun.dataSources,
        actions: activeRun.actions,
        llm: activeRun.llm,
        steps: activeRun.steps,
        lastSaved: new Date().toISOString(),
      };

      // Save to localStorage
      const existingConfigs = JSON.parse(
        localStorage.getItem("workflowConfigs") || "[]"
      );
      const updatedConfigs = existingConfigs.filter(
        (config: any) => config.id !== activeRun.id
      );
      updatedConfigs.push(workflowConfig);
      localStorage.setItem("workflowConfigs", JSON.stringify(updatedConfigs));
    }

    setShowSaveSuccess(true);
    setIsEditMode(false);
    setEditingStep(null);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleEditStep = (stepId: string) => {
    setEditingStep(stepId);
  };

  const handleSaveStep = () => {
    setEditingStep(null);
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
  };

  const handleDeleteStep = (stepId: string) => {
    setShowDeleteConfirm(stepId);
  };

  const confirmDeleteStep = () => {
    if (showDeleteConfirm && activeRun) {
      const updatedSteps = activeRun.steps.filter(
        (step) => step.id !== showDeleteConfirm
      );
      setActiveRun({
        ...activeRun,
        steps: updatedSteps,
        totalSteps: updatedSteps.length,
      });
      setShowDeleteConfirm(null);
    }
  };

  const handleAddStep = (afterStepId?: string) => {
    if (!activeRun) return;

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: "action",
      title: "New Step",
      description: "Enter step description",
      verificationRequired: false,
    };

    let updatedSteps;
    if (afterStepId) {
      const insertIndex =
        activeRun.steps.findIndex((step) => step.id === afterStepId) + 1;
      updatedSteps = [
        ...activeRun.steps.slice(0, insertIndex),
        newStep,
        ...activeRun.steps.slice(insertIndex),
      ];
    } else {
      updatedSteps = [...activeRun.steps, newStep];
    }

    setActiveRun({
      ...activeRun,
      steps: updatedSteps,
      totalSteps: updatedSteps.length,
    });
  };

  const handleUpdateStep = (
    stepId: string,
    field: string,
    value: string | boolean
  ) => {
    if (!activeRun) return;

    const updatedSteps = activeRun.steps.map((step) =>
      step.id === stepId ? { ...step, [field]: value } : step
    );

    setActiveRun({
      ...activeRun,
      steps: updatedSteps,
    });
  };

  const handleVerificationToggle = (stepId: string, enabled: boolean) => {
    handleUpdateStep(stepId, "verificationRequired", enabled);

    // Auto-save to localStorage when verification settings change
    if (activeRun) {
      setTimeout(() => {
        // Get the updated run after state update
        const updatedSteps = activeRun.steps.map((step) =>
          step.id === stepId ? { ...step, verificationRequired: enabled } : step
        );

        const workflowConfig = {
          id: activeRun.id,
          name: activeRun.name,
          workflow: activeRun.workflow,
          dataSources: activeRun.dataSources,
          actions: activeRun.actions,
          llm: activeRun.llm,
          steps: updatedSteps,
          lastSaved: new Date().toISOString(),
        };

        const existingConfigs = JSON.parse(
          localStorage.getItem("workflowConfigs") || "[]"
        );
        const updatedConfigs = existingConfigs.filter(
          (config: any) => config.id !== activeRun.id
        );
        updatedConfigs.push(workflowConfig);
        localStorage.setItem("workflowConfigs", JSON.stringify(updatedConfigs));
      }, 100);
    }
  };

  const handleSimulationComplete = () => {
    // Save the completed run to localStorage
    const completedRun = {
      id: activeRun?.id || `run-${Date.now()}`,
      name: activeRun?.name || "Unknown Run",
      description: `Automated workflow execution for ${activeRun?.workflow}`,
      category:
        activeRun?.workflow === "fcra-acdv-response"
          ? "Compliance & Legal"
          : "Compliance",
      status: "Completed",
      lastRun: new Date().toISOString(),
      runHistory: [
        {
          timestamp: new Date().toISOString(),
          status: "Success",
          details: "Workflow completed successfully",
        },
      ],
      metrics: {
        dataSourcesAnalyzed: String(activeRun?.dataSources.length || 0),
        actionsExecuted: String(activeRun?.actions.length || 0),
        totalSteps: String(activeRun?.totalSteps || 0),
        executionTime: activeRun?.estimatedCompletion || "Unknown",
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

    // After simulation completes, clear the active run
    setShowSimulation(false);
    setActiveRun(null);

    // Navigate to run history
    navigate("/workflow/run");
  };

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
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Workflow Title
          </h1>
          <p className="text-gray-600">
            Start time
          </p>
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
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">
                  Workflow Completed Successfully
                </span>
              </div>
              <div className="mt-4 flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/workflow/sop-to-workflow")}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryHover transition-colors"
                >
                  Upload New SOP
                </button>
                <button
                  onClick={() => navigate("/workflow/run")}
                  className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors"
                >
                  View Workflow History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If we're showing the simulation, display it
  if (showSimulation && activeRun) {
    return (
      <AIAgentExecutionSimulation
        workflow={activeRun.workflow}
        dataSources={activeRun.dataSources}
        actions={activeRun.actions}
        llm={activeRun.llm}
        steps={activeRun.steps}
        onRestart={() => {
          setShowSimulation(false);
          setActiveRun(null);
          navigate("/workflow/builder");
        }}
      />
    );
  }

  if (!activeRun) {
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
            Start a new automation workflow from templates or create your own
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/workflow/templates")}
              className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover transition-colors font-semibold"
            >
              Browse Templates
            </button>
            <button
              onClick={() => navigate("/workflow/builder")}
              className="px-6 py-3 bg-brand-primary text-brand-dark rounded-lg shadow-md hover:bg-brand-hover transition-all duration-200 font-semibold"
            >
              Create Custom Workflow
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Remove the review UI since it's now in the templates page
  // The page should only show when a workflow is actually running
  return null;
};
