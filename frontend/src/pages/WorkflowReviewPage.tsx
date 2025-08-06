import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactDOM from "react-dom";
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
  { value: "unverified", label: "unverified", icon: FaSquare },
  { value: "simple", label: "simple", icon: FaCircle },
  { value: "gmail", label: "gmail", icon: SiGmail },
  { value: "slack", label: "slack", icon: SiSlack, },
];

const VerificationDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  stepNumber: number;
}> = ({ value, onChange, disabled = false, stepNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const currentOption =
    verificationOptions.find((opt) => opt.value === value) ||
    verificationOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 160; // Approximate height for 4 items

      // Position dropdown above if not enough space below
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownPosition({
          top: rect.top - dropdownHeight,
          left: rect.left,
          width: rect.width,
        });
      } else {
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }
  }, [isOpen]);

  const dropdownMenu = isOpen && !disabled && (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
      }}
    >
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
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-1 px-2 py-0.5 text-xs border rounded transition-colors min-w-[120px] ${
          disabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-primary"
        }`}
      >
        {currentOption.icon && <currentOption.icon className="h-3 w-3" />}
        <span className="flex-1 text-left truncate">{currentOption.label.replace(" Verification", "")}</span>
        <ChevronDownIcon
          className={`h-3 w-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {ReactDOM.createPortal(dropdownMenu, document.body)}
    </>
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
      return "bg-green-100 text-green-700 border-green-200";
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

  const handleRunWorkflow = async () => {
    try {
      // Note: This page is for reviewing workflow templates, not executing actual disputes
      // For actual dispute execution, users should use the Upload SOP functionality
      // This navigation simulates starting a workflow review/execution
      console.log("Navigating to workflow execution with template data");
      
      // Navigate to active runs page with template data
      navigate("/workflow/active-runs", {
        state: {
          templateId,
          templateTitle,
          jsonFile,
          workflowSteps: workflowData,
          stepVerifications,
          isRunning: true,
          isTemplate: true, // Flag to indicate this is template execution, not actual dispute
        },
      });
    } catch (error) {
      console.error("Error navigating to workflow execution:", error);
      // Still navigate to active runs page for UI continuity
      navigate("/workflow/active-runs", {
        state: {
          templateId,
          templateTitle,
          jsonFile,
          workflowSteps: workflowData,
          stepVerifications,
          isRunning: true,
          isTemplate: true,
        },
      });
    }
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

          <div className="space-y-1 h-[70vh] overflow-y-auto font-mono text-xs bg-gray-50 rounded border">
            {workflowData.map((step) => {
              const isEditing = editingSteps[step.step];
              const requiresVerification = stepVerifications[step.step] && stepVerifications[step.step] !== "none";

              return (
                <div key={step.step}>
                  {isEditing ? (
                    <div className="p-4 bg-white border-l-4 border-brand-primary">
                      <StepEditor
                        step={step}
                        onUpdate={(updatedStep) =>
                          handleStepUpdate(step.step, updatedStep)
                        }
                        onCancel={() => toggleStepEdit(step.step)}
                      />
                    </div>
                  ) : (
                    <div className="px-2 py-1 flex items-center gap-2 text-xs bg-white hover:bg-gray-50 transition-colors">
                      {/* Step indicator */}
                      <span className="flex-shrink-0 w-6 text-right font-medium">
                        {step.step}
                      </span>

                      {/* Action type */}
                      <span className="flex-shrink-0 w-12 uppercase font-medium text-gray-700">
                        {step.action}
                      </span>

                      {/* Description */}
                      <span className="flex-1 truncate">
                        {step.heading || step.element_description}
                        {step.value && (
                          <span className="ml-2 opacity-75 text-brand-primary">
                            = "{step.value.length > 30 ? step.value.substring(0, 30) + "..." : step.value}"
                          </span>
                        )}
                      </span>

                      {/* Element type */}
                      <span className="flex-shrink-0 text-xs opacity-60">
                        [{step.element_type}]
                      </span>

                      {/* Verification dropdown - compact */}
                      <div className="flex-shrink-0">
                        <VerificationDropdown
                          value={stepVerifications[step.step] || "none"}
                          onChange={(value) =>
                            handleVerificationChange(step.step, value)
                          }
                          disabled={!isEditMode}
                          stepNumber={step.step}
                        />
                      </div>

                      {/* Verification indicator */}
                      {requiresVerification && (
                        <span className="flex-shrink-0 text-yellow-600">⚠</span>
                      )}

                      {/* Edit button */}
                      {isEditMode && (
                        <button
                          onClick={() => toggleStepEdit(step.step)}
                          className="flex-shrink-0 p-1 text-brand-primary hover:bg-brand-primaryLight rounded transition-colors"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>
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
