import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  XMarkIcon, 
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Interface for a Workflow Instance (Run History Item)
interface WorkflowStep {
  step: number;
  action: string;
  element_description: string;
  element_type: string;
  value?: string;
  heading?: string;
}

interface WorkflowInstance {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status: string; // e.g., "Active", "Success", "Failed"
  lastRun: string; // ISO date string
  runHistory: Array<{
    timestamp: string; // ISO date string
    status: string;
    details: string;
  }>;
  metrics?: Record<string, string | undefined>; // Allow undefined for metric values
  steps?: WorkflowStep[]; // Store the workflow steps
  createdAt?: string; // lastRun could serve a similar purpose or use original createdAt if available
}

const RUN_HISTORY_STORAGE_KEY = "workflowRunHistory"; // New storage key for run instances

// Function to get stored run history or fallback to empty array
function getStoredRunHistory(): WorkflowInstance[] {
  const stored = localStorage.getItem(RUN_HISTORY_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Basic validation if parsed data is an array and has items
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse run history from localStorage", e);
      // Fallback to empty array if parsing fails or data is invalid
    }
  }
  // Fallback to empty array if nothing in localStorage or if it's invalid
  return [];
}

// Function to save run history (Potentially to be used when new runs occur)
function saveRunHistory(runInstances: WorkflowInstance[]) {
  localStorage.setItem(RUN_HISTORY_STORAGE_KEY, JSON.stringify(runInstances));
}

export default function WorkflowRunHistoryPage() {
  // Renamed component
  const [runHistory, setRunHistory] = useState<WorkflowInstance[]>(
    getStoredRunHistory()
  );
  const [selectedRun, setSelectedRun] = useState<WorkflowInstance | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  // Load run history from localStorage on component mount and when storage changes
  useEffect(() => {
    const loadHistory = () => {
      setRunHistory(getStoredRunHistory());
    };

    // Load initial data
    loadHistory();

    // Listen for storage changes (when new workflows complete)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === RUN_HISTORY_STORAGE_KEY) {
        loadHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes made in the same tab
    const interval = setInterval(loadHistory, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleDeleteRun = (id: string) => {
    const updatedHistory = runHistory.filter((run) => run.id !== id);
    setRunHistory(updatedHistory);
    saveRunHistory(updatedHistory); // Save after deletion
  };

  const handleViewDetails = (run: WorkflowInstance) => {
    setSelectedRun(run);
    setShowDetailsModal(true);
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    switch (actionLower) {
      case "type":
        return <DocumentTextIcon className="h-4 w-4" />;
      case "click":
        return <CursorArrowRaysIcon className="h-4 w-4" />;
      case "check":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "select":
        return <ClipboardDocumentCheckIcon className="h-4 w-4" />;
      case "scroll":
        return <ArrowRightIcon className="h-4 w-4" />;
      case "copy":
        return <PencilSquareIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    switch (actionLower) {
      case "type":
        return "bg-blue-100 text-blue-600";
      case "click":
        return "bg-green-100 text-green-600";
      case "check":
        return "bg-purple-100 text-purple-600";
      case "select":
        return "bg-yellow-100 text-yellow-600";
      case "scroll":
        return "bg-orange-100 text-orange-600";
      case "copy":
        return "bg-pink-100 text-pink-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Determine if the displayed history is the fallback mock data
  const isMockData =
    JSON.stringify(runHistory) === JSON.stringify([]);

  // Helper function to get display status
  const getDisplayStatus = (run: WorkflowInstance) => {
    if (
      run.status.toLowerCase().includes("active") ||
      run.status.toLowerCase().includes("running")
    ) {
      // For active runs, try to extract step information from the latest run history
      if (run.runHistory && run.runHistory.length > 0) {
        const latestEntry = run.runHistory[run.runHistory.length - 1];
        // Try to extract step info from details
        const stepMatch = latestEntry.details.match(/step (\d+) of (\d+)/i);
        if (stepMatch) {
          return `Step ${stepMatch[1]} of ${stepMatch[2]}`;
        }
      }
      return "Active";
    }
    return run.status;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-heading">
            Workflow History
          </h1>
          <p className="text-brand-muted opacity-70 mt-1">
            View the execution history of your Automated Operation Procedures.
          </p>
        </div>
        {/* Button to navigate to Workflow templates page */}
        <button
          className="mt-4 sm:mt-0 px-6 py-2.5 bg-brand-primary text-brand-dark rounded-md text-sm font-semibold hover:bg-brand-hover transition-all duration-200 whitespace-nowrap"
          onClick={() => navigate("/workflow/templates")} // Navigate to the Workflow templates
        >
          Browse Templates
        </button>
      </div>

      {runHistory.length === 0 && (
        <div className="col-span-full text-center text-brand-muted py-10">
          <svg
            className="mx-auto h-12 w-12 text-brand-muted opacity-70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2zm3-5a1 1 0 000 2h.01a1 1 0 100-2H7zm5 0a1 1 0 000 2h.01a1 1 0 100-2H12z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-brand-heading">
            No Run History Found
          </h3>
          <p className="mt-1 text-sm text-brand-muted opacity-70">
            Get started by selecting a workflow template.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {runHistory.map((run) => {
          const displayStatus = getDisplayStatus(run);
          const isActive =
            run.status.toLowerCase().includes("active") ||
            run.status.toLowerCase().includes("running");

          return (
            <div
              key={run.id}
              className="bg-brand-card border border-brand-border rounded-lg p-6 hover:border-brand-primary transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                <div>
                  <h2
                    className="text-xl font-semibold text-brand-heading"
                  >
                    {run.name}
                  </h2>
                  <p className="text-sm text-brand-muted opacity-70">
                    ID: {run.id} {run.category && `| Category: ${run.category}`}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      run.status.toLowerCase().includes("success") ||
                      run.status.toLowerCase().includes("completed")
                        ? "bg-green-100 text-green-800"
                        : isActive
                        ? "bg-blue-100 text-blue-800"
                        : run.status.toLowerCase().includes("fail") ||
                          run.status.toLowerCase().includes("error")
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {displayStatus}
                  </span>
                </div>
              </div>

              <p className="text-sm text-brand-muted opacity-70 mb-3">
                {run.description || "No description provided."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                <div>
                  <span className="font-medium text-brand-heading">
                    Last Run:
                  </span>{" "}
                  {new Date(run.lastRun).toLocaleString()}
                </div>
                {run.metrics &&
                  Object.entries(run.metrics).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-brand-heading">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        :
                      </span>{" "}
                      {value}
                    </div>
                  ))}
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  className="text-sm text-brand-primary hover:text-brand-primaryHover hover:underline font-medium"
                  onClick={() => handleViewDetails(run)}
                >
                  View Details
                </button>
                <button
                  className="text-xs text-brand-danger hover:text-red-700 hover:underline"
                  onClick={() => handleDeleteRun(run.id)}
                  title="Delete this run history"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRun.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Completed on {new Date(selectedRun.lastRun).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {selectedRun.metrics && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Execution Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedRun.metrics).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                        </span>
                        <span className="text-sm text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRun.steps && selectedRun.steps.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Workflow Steps ({selectedRun.steps.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedRun.steps.map((step, index) => (
                      <div
                        key={step.step}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(step.action)}`}>
                            {getActionIcon(step.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">
                                Step {step.step}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(step.action)}`}>
                                {step.action.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              {step.heading || step.element_description}
                            </p>
                            {step.value && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">Value:</span>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {step.value}
                                </code>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">Element:</span>
                              <span className="text-xs text-gray-600">{step.element_type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No step details available for this workflow run.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
