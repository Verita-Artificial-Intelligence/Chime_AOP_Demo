import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlayIcon,
  ClockIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  HashtagIcon,
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

interface EditingState {
  [stepNumber: number]: boolean;
}

interface VerificationState {
  [stepNumber: number]: string;
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
  disabled?: boolean;
  stepNumber: number;
}> = ({ value, onChange, disabled = false, stepNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const currentOption =
    verificationOptions.find((opt) => opt.value === value) ||
    verificationOptions[0];

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
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors min-w-[180px] ${
          disabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        }`}
      >
        {currentOption.icon && <currentOption.icon className="h-4 w-4" />}
        <span className="flex-1 text-left">{currentOption.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
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
                option.value === value
                  ? "bg-brand-primaryLight text-brand-primary"
                  : ""
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

const getActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case "click":
      return CursorArrowRaysIcon;
    case "type":
      return DocumentTextIcon;
    case "select":
      return ChevronDownIcon;
    default:
      return HashtagIcon;
  }
};

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "click":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "type":
      return "bg-green-100 text-green-700 border-green-200";
    case "select":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const StepEditor: React.FC<{
  step: WorkflowStep;
  onUpdate: (updatedStep: WorkflowStep) => void;
  onCancel: () => void;
}> = ({ step, onUpdate, onCancel }) => {
  const [editedStep, setEditedStep] = useState(step);

  const handleSave = () => {
    onUpdate(editedStep);
  };

  return (
    <div className="bg-white border-2 border-brand-primary rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Edit Step {step.step}
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark transition-colors flex items-center gap-2"
          >
            <CheckIcon className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <input
            type="text"
            value={editedStep.action}
            onChange={(e) =>
              setEditedStep({ ...editedStep, action: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Element Type
          </label>
          <input
            type="text"
            value={editedStep.element_type}
            onChange={(e) =>
              setEditedStep({ ...editedStep, element_type: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heading
          </label>
          <input
            type="text"
            value={editedStep.heading}
            onChange={(e) =>
              setEditedStep({ ...editedStep, heading: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Element Description
          </label>
          <textarea
            value={editedStep.element_description}
            onChange={(e) =>
              setEditedStep({
                ...editedStep,
                element_description: e.target.value,
              })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {editedStep.value !== undefined && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type="text"
              value={editedStep.value}
              onChange={(e) =>
                setEditedStep({ ...editedStep, value: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const WorkflowReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId, templateTitle, jsonFile } = location.state || {};

  const [workflowData, setWorkflowData] = useState<WorkflowStep[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSteps, setEditingSteps] = useState<EditingState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [stepVerifications, setStepVerifications] = useState<VerificationState>(
    {}
  );

  useEffect(() => {
    if (!templateId || !jsonFile) {
      navigate("/workflow/templates");
      return;
    }

    // Load workflow data from JSON file
    const loadWorkflowData = async () => {
      try {
        const mockData = await import(
          `../data/${jsonFile.replace(".json", "").replaceAll(" ", "-")}.json`
        );
        const data = mockData.default;
        setWorkflowData(data);

        // Load saved customizations including verifications
        const savedCustomizations = localStorage.getItem(
          `workflow-custom-${templateId}`
        );
        if (savedCustomizations) {
          const customizations = JSON.parse(savedCustomizations);
          if (customizations.stepVerifications) {
            setStepVerifications(customizations.stepVerifications);
          }
          if (customizations.workflowData) {
            setWorkflowData(customizations.workflowData);
          }
        } else {
          // Initialize all steps with "none" verification
          const initialVerifications: VerificationState = {};
          data.forEach((step: WorkflowStep) => {
            initialVerifications[step.step] = "none";
          });
          setStepVerifications(initialVerifications);
        }

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
    // Expand first 5 steps by default when entering edit mode
    const defaultExpanded = new Set(
      workflowData.slice(0, 5).map((step) => step.step)
    );
    setExpandedSteps(defaultExpanded);
  };

  const handleSaveCustomization = () => {
    setIsEditMode(false);
    setEditingSteps({});
    // Save customizations to local storage
    const customizations = {
      templateId,
      workflowData,
      stepVerifications,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(
      `workflow-custom-${templateId}`,
      JSON.stringify(customizations)
    );
  };

  const handleStepUpdate = (stepNumber: number, updatedStep: WorkflowStep) => {
    const updatedData = workflowData.map((step) =>
      step.step === stepNumber ? updatedStep : step
    );
    setWorkflowData(updatedData);
    setEditingSteps({ ...editingSteps, [stepNumber]: false });
  };

  const handleVerificationChange = (stepNumber: number, value: string) => {
    setStepVerifications({
      ...stepVerifications,
      [stepNumber]: value,
    });
  };

  const toggleStepEdit = (stepNumber: number) => {
    setEditingSteps({
      ...editingSteps,
      [stepNumber]: !editingSteps[stepNumber],
    });
  };

  const toggleStepExpanded = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const estimatedTime =
    workflowData.length > 50
      ? "30-40 mins"
      : workflowData.length > 30
      ? "20-30 mins"
      : "15-20 mins";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review Your Workflow
        </h1>
        <p className="text-gray-600">
          Review and customize your automation workflow before execution
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {templateTitle}
              </h2>
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
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingSteps({});
                    }}
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
                  className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-primaryLight transition-colors flex items-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Customize
                </button>
              )}
              <button
                onClick={handleRunWorkflow}
                className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark transition-colors flex items-center gap-2 font-semibold"
              >
                <PlayIcon className="h-4 w-4" />
                Run Workflow
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Workflow Steps
          </h3>

          <div className="space-y-3">
            {workflowData.map((step) => {
              const ActionIcon = getActionIcon(step.action);
              const isExpanded = expandedSteps.has(step.step);
              const isEditing = editingSteps[step.step];

              return (
                <div
                  key={step.step}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {isEditing ? (
                    <StepEditor
                      step={step}
                      onUpdate={(updatedStep) =>
                        handleStepUpdate(step.step, updatedStep)
                      }
                      onCancel={() => toggleStepEdit(step.step)}
                    />
                  ) : (
                    <>
                      <div
                        className={`p-4 ${
                          isEditMode ? "cursor-pointer hover:bg-gray-50" : ""
                        } transition-colors`}
                        onClick={() =>
                          isEditMode && toggleStepExpanded(step.step)
                        }
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white text-sm font-semibold flex-shrink-0">
                            {step.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <ActionIcon className="h-5 w-5 text-gray-600" />
                              <h4 className="font-semibold text-gray-900">
                                {step.heading}
                              </h4>
                              <span
                                className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${getActionColor(
                                  step.action
                                )}`}
                              >
                                {step.action}
                              </span>
                              <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                {step.element_type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {step.element_description}
                            </p>
                            {step.value && (
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="font-medium">Value:</span>{" "}
                                {step.value}
                              </p>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                              <span className="text-sm text-gray-700">
                                Verification:
                              </span>
                              <VerificationDropdown
                                value={stepVerifications[step.step] || "none"}
                                onChange={(value) =>
                                  handleVerificationChange(step.step, value)
                                }
                                disabled={!isEditMode}
                                stepNumber={step.step}
                              />
                            </div>
                          </div>
                          {isEditMode && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStepEdit(step.step);
                                }}
                                className="p-2 text-brand-primary hover:bg-brand-primaryLight rounded-md transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <ChevronDownIcon
                                className={`h-5 w-5 text-gray-400 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditMode && isExpanded && (
                        <div className="px-4 pb-4 pt-0 bg-gray-50 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Action:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {step.action}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Element Type:
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                {step.element_type}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">
                                Description:
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                {step.element_description}
                              </span>
                            </div>
                            {step.value && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Value:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {step.value}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
