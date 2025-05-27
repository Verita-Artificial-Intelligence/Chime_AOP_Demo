import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AIAgentExecutionSimulation } from "../components/AIAgentExecutionSimulation";
import mockData from "../data/mockData.json"; // Ensure mockData is imported

// Interface for a runnable agent configuration
interface RunnableAgentConfig {
  id: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  name?: string; // Optional name, could be from prompt title or instance name
  createdAt?: string;
}

// Interface for an AOP Instance (Run History Item)
interface AOPInstance {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status: string;
  lastRun: string;
  runHistory: Array<{
    timestamp: string;
    status: string;
    details: string;
  }>;
  metrics?: Record<string, string | undefined>;
  // Potentially include the original config if runs are to be re-runnable directly
  // originalConfig?: RunnableAgentConfig;
}

const AGENTS_STORAGE_KEY = "aopAgents";
const RUN_HISTORY_STORAGE_KEY = "aopRunHistory";

// Helper to get AOPInstance data (similar to AOPRunHistoryPage)
function getAOPInstanceById(id: string): AOPInstance | undefined {
  const storedHistory = localStorage.getItem(RUN_HISTORY_STORAGE_KEY);
  let instances: AOPInstance[] = mockData.aopsInstances || [];
  if (storedHistory) {
    try {
      const parsed = JSON.parse(storedHistory);
      if (Array.isArray(parsed) && parsed.length > 0) {
        instances = parsed;
      }
    } catch (e) {
      console.error(
        "Error parsing aopRunHistory from localStorage on AOPRunPage",
        e
      );
      // If error, mockData.aopsInstances is already set as default
    }
  }
  return instances.find((inst) => inst.id === id);
}

export default function AOPRunPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();

  let runnableConfig: RunnableAgentConfig | undefined = location.state as
    | RunnableAgentConfig
    | undefined;
  let aopInstanceData: AOPInstance | undefined;

  if (!runnableConfig && routeId) {
    const storedAgents = localStorage.getItem(AGENTS_STORAGE_KEY);
    if (storedAgents) {
      try {
        const agents: RunnableAgentConfig[] = JSON.parse(storedAgents);
        runnableConfig = agents.find((a) => a.id === routeId);
      } catch (e) {
        console.error("Error parsing aopAgents from localStorage", e);
      }
    }
  }

  // If no runnableConfig by this point, try to load as AOPInstance for history viewing
  if (!runnableConfig && routeId) {
    aopInstanceData = getAOPInstanceById(routeId);
    // If the specific ID didn't yield data, and we have a routeId, load the special mock "Not Found" instance.
    if (!aopInstanceData) {
      console.warn(
        `AOPInstance with ID "${routeId}" not found. Displaying mock 'Not Found' data.`
      );
      aopInstanceData = getAOPInstanceById("AOP-NOT-FOUND-MOCK");
    }
  }

  const isValidRunnableConfig =
    runnableConfig &&
    typeof runnableConfig.workflow === "string" &&
    runnableConfig.workflow.trim() !== "" &&
    Array.isArray(runnableConfig.dataSources) &&
    Array.isArray(runnableConfig.actions) &&
    typeof runnableConfig.llm === "string" &&
    runnableConfig.llm.trim() !== "";

  // If we have a valid runnable config, show the simulation
  if (isValidRunnableConfig && runnableConfig) {
    return (
      <AIAgentExecutionSimulation
        workflow={runnableConfig.workflow}
        dataSources={runnableConfig.dataSources}
        actions={runnableConfig.actions}
        llm={runnableConfig.llm}
        onRestart={() => navigate("/aop")} // Or navigate to builder /aop/builder
      />
    );
  }

  // If we have AOPInstance data, display its history log
  if (aopInstanceData) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            AOP Run History Details: {aopInstanceData.name}
          </h1>
          <p className="text-sm text-gray-500">
            ID: {aopInstanceData.id}{" "}
            {aopInstanceData.category &&
              `| Category: ${aopInstanceData.category}`}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {aopInstanceData.description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <span
              className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                aopInstanceData.status.toLowerCase().includes("success") ||
                aopInstanceData.status.toLowerCase().includes("completed")
                  ? "bg-green-100 text-green-800"
                  : aopInstanceData.status.toLowerCase().includes("active") ||
                    aopInstanceData.status.toLowerCase().includes("running")
                  ? "bg-blue-100 text-blue-800"
                  : aopInstanceData.status.toLowerCase().includes("fail") ||
                    aopInstanceData.status.toLowerCase().includes("error")
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {aopInstanceData.status}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Last Run:</span>{" "}
            {new Date(aopInstanceData.lastRun).toLocaleString()}
          </div>
        </div>

        {aopInstanceData.metrics &&
          Object.keys(aopInstanceData.metrics).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 p-4 rounded-md">
                {Object.entries(aopInstanceData.metrics).map(
                  ([key, value]) =>
                    value !== undefined && (
                      <div key={key}>
                        <span className="font-medium text-gray-600">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                          :
                        </span>{" "}
                        {value}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Execution Log
        </h2>
        {aopInstanceData.runHistory && aopInstanceData.runHistory.length > 0 ? (
          <ul className="space-y-3 border rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
            {aopInstanceData.runHistory.map((entry, index) => (
              <li
                key={index}
                className="text-sm pb-3 border-b border-gray-200 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span
                    className={`font-semibold ${
                      entry.status.toLowerCase() === "success"
                        ? "text-green-600"
                        : entry.status.toLowerCase() === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {entry.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{entry.details}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">
            No execution log entries found for this run.
          </p>
        )}
        <div className="mt-8 text-center">
          <button
            className="px-6 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all duration-200"
            onClick={() => navigate("/aop/run")} // Navigate back to the run history list
          >
            Back to Run History
          </button>
        </div>
      </div>
    );
  }

  // If neither runnable config nor AOPInstance data is found
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="text-xl text-brand-dark font-semibold mb-4">
        Agent Configuration or Run Data Not Found.
      </div>
      <p className="text-brand-muted opacity-70 mb-6">
        Could not find details for ID: {routeId}. It may have been deleted or
        the ID is incorrect.
      </p>
      <button
        className="px-6 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all duration-200 font-semibold"
        onClick={() => navigate("/aop/run")} // Navigate to the main history list
      >
        View Full Run History
      </button>
    </div>
  );
}
