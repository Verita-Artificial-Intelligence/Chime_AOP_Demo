import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayIcon,
  ClockIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { SiGmail, SiSlack } from "react-icons/si";
import { FaSquare, FaCircle } from "react-icons/fa";

interface WorkflowStep {
  id: string;
  type: "dataSource" | "action" | "llm";
  title: string;
  description: string;
  verificationRequired?: boolean;
}

interface WorkflowConfig {
  id: string;
  name: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  estimatedCompletion?: string;
}

interface WorkflowReviewProps {
  config: WorkflowConfig;
  onCancel?: () => void;
  showCancelButton?: boolean;
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

export const WorkflowReview: React.FC<WorkflowReviewProps> = ({
  config,
  onCancel,
  showCancelButton = true,
}) => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

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
  const createWorkflowSteps = (): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];

    // Add data source steps
    config.dataSources.forEach((source, index) => {
      steps.push({
        id: `ds-${index}`,
        type: "dataSource",
        title: `Data Source: ${source}`,
        description: `Connect and retrieve data from ${source}`,
      });
    });

    // Add LLM step
    if (config.llm) {
      steps.push({
        id: "llm-step",
        type: "llm",
        title: `LLM: ${config.llm}`,
        description: `Process data using ${config.llm} language model`,
      });
    }

    // Add action steps
    config.actions.forEach((action, index) => {
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

  const [steps, setSteps] = useState<WorkflowStep[]>(createWorkflowSteps());

  const handleRunWorkflow = () => {
    // Navigate to active workflows with the configuration
    navigate("/workflow/active-runs", {
      state: {
        id: config.id,
        name: config.name,
        workflow: config.workflow,
        dataSources: config.dataSources,
        actions: config.actions,
        llm: config.llm,
        steps: steps,
        isRunning: true, // This indicates it should start running immediately
      },
    });
  };

  const handleEditTemplate = () => {
    setIsEditMode(true);
    setEditingStep(null);
  };

  const handleCancelEditMode = () => {
    setIsEditMode(false);
    setEditingStep(null);
  };

  const handleSaveTemplate = () => {
    // Save workflow configuration
    const workflowConfig = {
      ...config,
      steps: steps,
      lastSaved: new Date().toISOString(),
    };

    // Save to localStorage
    const existingConfigs = JSON.parse(
      localStorage.getItem("workflowConfigs") || "[]"
    );
    const updatedConfigs = existingConfigs.filter(
      (c: any) => c.id !== config.id
    );
    updatedConfigs.push(workflowConfig);
    localStorage.setItem("workflowConfigs", JSON.stringify(updatedConfigs));

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
    if (showDeleteConfirm) {
      const updatedSteps = steps.filter(
        (step) => step.id !== showDeleteConfirm
      );
      setSteps(updatedSteps);
      setShowDeleteConfirm(null);
    }
  };

  const handleAddStep = (afterStepId?: string) => {
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
        steps.findIndex((step) => step.id === afterStepId) + 1;
      updatedSteps = [
        ...steps.slice(0, insertIndex),
        newStep,
        ...steps.slice(insertIndex),
      ];
    } else {
      updatedSteps = [...steps, newStep];
    }

    setSteps(updatedSteps);
  };

  const handleUpdateStep = (
    stepId: string,
    field: string,
    value: string | boolean
  ) => {
    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, [field]: value } : step
    );
    setSteps(updatedSteps);
  };

  const handleVerificationToggle = (stepId: string, enabled: boolean) => {
    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, verificationRequired: enabled } : step
    );
    setSteps(updatedSteps);
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case "dataSource":
        return "bg-blue-100 text-blue-800";
      case "llm":
        return "bg-purple-100 text-purple-800";
      case "action":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStepTypeDisplayText = (type: string) => {
    switch (type) {
      case "dataSource":
        return "Data Source";
      case "llm":
        return "LLM";
      case "action":
        return "Action";
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Success Toast */}
      {showSaveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50">
          <CheckIcon className="h-5 w-5" />
          Template saved successfully!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Step
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this workflow step? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStep}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {config.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Est. completion: {config.estimatedCompletion || "15-20 mins"}
                </span>
                <span>•</span>
                <span>{steps.length} steps</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showCancelButton && onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancelEditMode}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Save Template
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditTemplate}
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

        {/* Workflow Steps */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Workflow Steps
            </h4>
            {isEditMode && (
              <div className="flex items-center gap-2 text-sm text-brand-primary bg-brand-light px-3 py-1 rounded-full">
                <PencilIcon className="h-4 w-4" />
                <span>Editing Mode</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id}>
                <div
                  className={`flex items-start gap-4 p-4 border rounded-lg transition-all ${
                    editingStep === step.id
                      ? "border-brand-primary bg-brand-light shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-brand-primary text-white rounded-full text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {editingStep === step.id ? (
                          <div className="flex-1">
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) =>
                                handleUpdateStep(
                                  step.id,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="w-full text-lg font-semibold text-gray-900 border border-brand-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                              placeholder="Step title"
                            />
                          </div>
                        ) : (
                          <h5 className="text-lg font-semibold text-gray-900 truncate flex-1">
                            {step.title}
                          </h5>
                        )}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStepTypeColor(
                            step.type
                          )}`}
                        >
                          {getStepTypeDisplayText(step.type)}
                        </span>
                        {/* Verification toggle for action steps only */}
                        {step.type === "action" && !isEditMode && (
                          <div className="flex items-center gap-2 ml-3">
                            <VerificationDropdown
                              value={
                                step.verificationRequired
                                  ? "default"
                                  : "optional"
                              }
                              onChange={(value) =>
                                handleVerificationToggle(
                                  step.id,
                                  value !== "optional"
                                )
                              }
                            />
                            <button
                              onClick={() =>
                                handleVerificationToggle(
                                  step.id,
                                  !step.verificationRequired
                                )
                              }
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                step.verificationRequired
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {step.verificationRequired ? "Off" : "On"}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        {/* Edit Mode Controls */}
                        {isEditMode && editingStep !== step.id && (
                          <button
                            onClick={() => handleEditStep(step.id)}
                            className="p-1.5 text-brand-primary hover:bg-brand-light rounded-md transition-colors"
                            title="Edit step"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {editingStep === step.id && (
                          <>
                            <button
                              onClick={handleSaveStep}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Save changes"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                              title="Cancel editing"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {isEditMode && (
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete step"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {editingStep === step.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={step.description}
                          onChange={(e) =>
                            handleUpdateStep(
                              step.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full text-gray-600 border border-brand-primary rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          rows={3}
                          placeholder="Step description"
                        />
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Step type:</span>
                          <select
                            value={step.type}
                            onChange={(e) =>
                              handleUpdateStep(step.id, "type", e.target.value)
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          >
                            <option value="dataSource">Data Source</option>
                            <option value="llm">LLM</option>
                            <option value="action">Action</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Add Step Button */}
                {isEditMode && !editingStep && (
                  <div className="flex justify-center my-2">
                    <button
                      onClick={() => handleAddStep(step.id)}
                      className="p-2 text-brand-primary hover:bg-brand-light rounded-full transition-colors group"
                      title="Add step after this one"
                    >
                      <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Step at End */}
            {isEditMode && !editingStep && steps.length === 0 && (
              <div className="text-center py-8">
                <button
                  onClick={() => handleAddStep()}
                  className="px-4 py-2 border-2 border-dashed border-brand-primary text-brand-primary rounded-lg hover:bg-brand-light hover:border-solid transition-all flex items-center gap-2 mx-auto group"
                >
                  <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Add First Step
                </button>
              </div>
            )}

            {isEditMode && !editingStep && steps.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => handleAddStep()}
                  className="px-4 py-2 border-2 border-dashed border-brand-primary text-brand-primary rounded-lg hover:bg-brand-light hover:border-solid transition-all flex items-center gap-2 mx-auto group"
                >
                  <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Add Step
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
