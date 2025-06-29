import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlayIcon,
  ClockIcon,
  PencilIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { SiGmail, SiSlack } from "react-icons/si";
import { FaSquare, FaCircle } from "react-icons/fa";

interface WorkflowStep {
  step: number;
  action: string;
  element_description: string;
  element_type: string;
  value?: string;
  heading: string;
}

interface ProcessedStep {
  id: string;
  type: "dataSource" | "action" | "verification";
  title: string;
  description: string;
  originalStep?: WorkflowStep;
  verification?: string;
}

interface VerificationOption {
  value: string;
  label: string;
  icon: React.ElementType;
}

const verificationOptions: VerificationOption[] = [
  { value: "none", label: "No Verification", icon: FaSquare },
  { value: "simple", label: "Simple Verification", icon: FaCircle },
  { value: "gmail", label: "Gmail Verification", icon: SiGmail },
  { value: "slack", label: "Slack Verification", icon: SiSlack },
];

const VerificationDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const currentOption = verificationOptions.find((opt) => opt.value === value) || verificationOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white hover:bg-gray-50 transition-colors min-w-[180px]"
      >
        {currentOption.icon && <currentOption.icon className="h-4 w-4" />}
        <span className="flex-1 text-left">{currentOption.label}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 overflow-hidden">
          {verificationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                option.value === value ? "bg-brand-light text-brand-primary" : ""
              }`}
            >
              {option.icon && <option.icon className="h-4 w-4" />}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const WorkflowReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId, templateTitle, jsonFile } = location.state || {};
  
  const [workflowData, setWorkflowData] = useState<WorkflowStep[]>([]);
  const [processedSteps, setProcessedSteps] = useState<ProcessedStep[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [stepVerifications, setStepVerifications] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Process workflow data to group by data sources and actions
  const processWorkflowSteps = (data: WorkflowStep[]): ProcessedStep[] => {
    const steps: ProcessedStep[] = [];
    
    // Define data sources based on template
    if (templateId === "credit-dispute-credit-bureau") {
      // Add data source steps
      steps.push({
        id: "ds-1",
        type: "dataSource",
        title: "Data Source: ACDV Case Management System",
        description: "Connect and retrieve data from ACDV Case Management System",
      });
      
      steps.push({
        id: "ds-2",
        type: "dataSource",
        title: "Data Source: B-Point Verification Database",
        description: "Connect and retrieve data from B-Point Verification Database",
      });
      
      steps.push({
        id: "ds-3",
        type: "dataSource",
        title: "Data Source: Dispute Code Repository",
        description: "Connect and retrieve data from Dispute Code Repository",
      });
      
      steps.push({
        id: "ds-4",
        type: "dataSource",
        title: "Data Source: Compliance Database",
        description: "Connect and retrieve data from Compliance Database",
      });
    } else if (templateId === "direct-dispute-member") {
      steps.push({
        id: "ds-1",
        type: "dataSource",
        title: "Data Source: Zendesk Support System",
        description: "Connect and retrieve data from Zendesk Support System",
      });
      
      steps.push({
        id: "ds-2",
        type: "dataSource",
        title: "Data Source: Penny Member Database",
        description: "Connect and retrieve data from Penny Member Database",
      });
      
      steps.push({
        id: "ds-3",
        type: "dataSource",
        title: "Data Source: Looker Analytics",
        description: "Connect and retrieve data from Looker Analytics",
      });
    } else if (templateId === "complex-dispute-equifax") {
      steps.push({
        id: "ds-1",
        type: "dataSource",
        title: "Data Source: e-OSCAR System",
        description: "Connect and retrieve data from e-OSCAR System",
      });
      
      steps.push({
        id: "ds-2",
        type: "dataSource",
        title: "Data Source: Penny Database",
        description: "Connect and retrieve data from Penny Database",
      });
      
      steps.push({
        id: "ds-3",
        type: "dataSource",
        title: "Data Source: Looker Reports",
        description: "Connect and retrieve data from Looker Reports",
      });
      
      steps.push({
        id: "ds-4",
        type: "dataSource",
        title: "Data Source: Zendesk Tickets",
        description: "Connect and retrieve data from Zendesk Tickets",
      });
    }
    
    // Add key action steps from the workflow
    const keyActions = data.filter(step => 
      step.action === "click" && 
      (step.element_type === "button" || step.heading.includes("Submit") || step.heading.includes("Create"))
    );
    
    keyActions.forEach((action, index) => {
      steps.push({
        id: `action-${index + 1}`,
        type: "action",
        title: `Action: ${action.heading.replace("Clicked button for ", "").replace("Clicked ", "")}`,
        description: action.element_description,
        originalStep: action,
      });
    });
    
    return steps;
  };

  useEffect(() => {
    if (!templateId || !jsonFile) {
      navigate("/workflow/templates");
      return;
    }

    // Load workflow data from JSON file
    const loadWorkflowData = async () => {
      try {
        // For now, we'll use the imported JSON data directly
        // In a real app, this would be loaded from the server
        const mockData = await import(`../data/${jsonFile.replace('.json', '').replaceAll(' ', '-')}.json`);
        const data = mockData.default;
        
        setWorkflowData(data);
        const processed = processWorkflowSteps(data);
        setProcessedSteps(processed);
        
        // Set default verifications for critical actions
        const defaultVerifications: Record<string, string> = {};
        processed.forEach((step) => {
          if (step.type === "action" && step.title.toLowerCase().includes("submit")) {
            defaultVerifications[step.id] = "simple";
          }
        });
        setStepVerifications(defaultVerifications);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading workflow data:", error);
        setIsLoading(false);
      }
    };

    loadWorkflowData();
  }, [templateId, jsonFile, navigate]);

  const handleRunWorkflow = () => {
    navigate("/workflow/active-runs", {
      state: {
        templateId,
        templateTitle,
        jsonFile,
        workflowSteps: workflowData,
        stepVerifications,
        isRunning: true,
      },
    });
  };

  const handleCustomize = () => {
    setIsEditMode(true);
  };

  const handleSaveCustomization = () => {
    setIsEditMode(false);
    // Save customizations to local storage
    const customizations = {
      templateId,
      stepVerifications,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(`workflow-custom-${templateId}`, JSON.stringify(customizations));
  };

  const handleStepVerificationChange = (stepId: string, value: string) => {
    setStepVerifications(prev => ({
      ...prev,
      [stepId]: value,
    }));
  };

  const getStepBadge = (type: string) => {
    switch (type) {
      case "dataSource":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "action":
        return "bg-green-100 text-green-700 border-green-200";
      case "verification":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const estimatedTime = workflowData.length > 50 ? "30-40 mins" : workflowData.length > 30 ? "20-30 mins" : "15-20 mins";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Workflow</h1>
        <p className="text-gray-600">Review and customize your automation workflow before execution</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{templateTitle}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Est. completion: {estimatedTime}
                </span>
                <span>•</span>
                <span>{workflowData.length} steps</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/workflow/templates")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              {isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomization}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCustomize}
                  className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors flex items-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Customize
                </button>
              )}
              <button
                onClick={handleRunWorkflow}
                className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-hover transition-colors flex items-center gap-2 font-semibold"
              >
                <PlayIcon className="h-4 w-4" />
                Run Workflow
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Steps</h3>
          
          <div className="space-y-4">
            {processedSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-semibold ${
                  step.type === "dataSource" ? "bg-blue-500" : "bg-green-500"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    {step.type === "action" && step.title.toLowerCase().includes("submit") && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {isEditMode && step.type === "action" && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm text-gray-700">Verification:</span>
                      <VerificationDropdown
                        value={stepVerifications[step.id] || "none"}
                        onChange={(value) => handleStepVerificationChange(step.id, value)}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStepBadge(step.type)}`}>
                    {step.type === "dataSource" ? "Data Source" : "Action"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 