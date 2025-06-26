import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  PlayIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { AIAgentExecutionSimulation } from "../components/AIAgentExecutionSimulation";

interface ActiveRun {
  id: string;
  name: string;
  startTime: string;
  currentStep: number;
  totalSteps: number;
  status: "running" | "paused";
  estimatedCompletion: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
}

interface SOPToAOPStep {
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
  const [sopToAopData, setSopToAopData] = useState<SOPToAOPStep[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if we're coming from SOP to AOP
  useEffect(() => {
    const source = searchParams.get("source");
    if (source === "sop-to-aop") {
      const data = sessionStorage.getItem("sopToAopData");
      if (data) {
        setSopToAopData(JSON.parse(data));
        sessionStorage.removeItem("sopToAopData");
        // Start the animation
        setTimeout(() => setCurrentStep(1), 500);
      }
    }
  }, [searchParams]);

  // Animate through steps
  useEffect(() => {
    if (sopToAopData && currentStep > 0 && currentStep < sopToAopData.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, sopToAopData]);

  // Check if we're coming from the AOP Builder or Templates with a new run
  useEffect(() => {
    if (location.state && location.state.workflow) {
      const newRun: ActiveRun = {
        id: location.state.id || `run-${Date.now()}`,
        name: location.state.name || "FCRA - Respond to ACDV case, Apply response code, Respond to consumer",
        startTime: new Date().toLocaleString(),
        currentStep: 1,
        totalSteps: location.state.actions ? location.state.actions.length + location.state.dataSources.length + 2 : 10,
        status: "running",
        estimatedCompletion: "15-20 mins",
        workflow: location.state.workflow,
        dataSources: location.state.dataSources,
        actions: location.state.actions,
        llm: location.state.llm,
      };
      setActiveRun(newRun);
      setShowSimulation(true);
      
      // Clear the location state to prevent re-runs on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSimulationComplete = () => {
    // Save the completed run to localStorage
    const completedRun = {
      id: activeRun?.id || `run-${Date.now()}`,
      name: activeRun?.name || "Unknown Run",
      description: `Automated workflow execution for ${activeRun?.workflow}`,
      category: activeRun?.workflow === 'fcra-acdv-response' ? 'Compliance & Legal' : 'Compliance',
      status: "Completed",
      lastRun: new Date().toISOString(),
      runHistory: [
        {
          timestamp: new Date().toISOString(),
          status: "Success",
          details: "AOP workflow completed successfully"
        }
      ],
      metrics: {
        dataSourcesAnalyzed: String(activeRun?.dataSources.length || 0),
        actionsExecuted: String(activeRun?.actions.length || 0),
        totalSteps: String(activeRun?.totalSteps || 0),
        executionTime: activeRun?.estimatedCompletion || "Unknown"
      }
    };

    // Get existing run history from localStorage
    const existingHistory = localStorage.getItem('aopRunHistory');
    let runHistory = [];
    
    if (existingHistory) {
      try {
        runHistory = JSON.parse(existingHistory);
      } catch (e) {
        console.error('Error parsing existing run history:', e);
        runHistory = [];
      }
    }

    // Add the new completed run
    runHistory.push(completedRun);
    
    // Save back to localStorage
    localStorage.setItem('aopRunHistory', JSON.stringify(runHistory));

    // After simulation completes, clear the active run
    setShowSimulation(false);
    setActiveRun(null);
    
    // Navigate to run history
    navigate("/aop/run");
  };

  // If we're showing SOP to AOP data
  if (sopToAopData) {
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
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            SOP to AOP Agent Journey
          </h1>
          <p className="text-brand-muted">
            AI agent executing automated workflow steps
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: Step {currentStep} of {sopToAopData.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((currentStep / sopToAopData.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(currentStep / sopToAopData.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {sopToAopData.map((step, index) => {
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

          {currentStep === sopToAopData.length && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Workflow Completed Successfully</span>
              </div>
              <div className="mt-4 flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/aop/sop-to-aop")}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryHover transition-colors"
                >
                  Upload New SOP
                </button>
                <button
                  onClick={() => navigate("/aop/run")}
                  className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors"
                >
                  View Run History
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
        onRestart={() => {
          setShowSimulation(false);
          setActiveRun(null);
          navigate("/aop/builder");
        }}
      />
    );
  }

  // Mock data - empty by default unless there's an active run
  const mockActiveRuns: ActiveRun[] = activeRun ? [activeRun] : [];

  const handleViewRun = (run: ActiveRun) => {
    setActiveRun(run);
    setShowSimulation(true);
  };

  if (mockActiveRuns.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Runs</h1>
          <p className="text-gray-600">
            Monitor your currently executing automation workflows
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PlayIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No current AOP is running
          </h2>
          <p className="text-gray-600 mb-6">
            Start a new automation workflow from templates or create your own
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/aop/templates")}
              className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover transition-colors font-semibold"
            >
              Browse Templates
            </button>
            <button
              onClick={() => navigate("/aop/builder")}
              className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors"
            >
              Create Custom AOP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Runs</h1>
        <p className="text-gray-600">
          Monitor your currently executing automation workflows
        </p>
      </div>

      <div className="space-y-4">
        {mockActiveRuns.map((run) => (
          <div
            key={run.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {run.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Started: {run.startTime}
                  </span>
                  <span>•</span>
                  <span>Est. completion: {run.estimatedCompletion}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {run.status === "running" && (
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 text-brand-primary animate-spin" />
                    <span className="text-sm font-medium text-brand-primary">
                      Running
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {run.currentStep} of {run.totalSteps}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round((run.currentStep / run.totalSteps) * 100)}%
                  Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(run.currentStep / run.totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleViewRun(run)}
                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-hover transition-colors"
              >
                View Details
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Pause
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
