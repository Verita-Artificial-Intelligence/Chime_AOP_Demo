import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mockData.json'; // Import mockData

// Interface for an AOP Instance (Run History Item)
interface AOPInstance {
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
  // These fields from the old Agent interface might not be directly applicable
  // or could be derived/linked if needed.
  // workflow: string; 
  // dataSources: string[];
  // actions: string[];
  // llm: string;
  createdAt?: string; // lastRun could serve a similar purpose or use original createdAt if available
}

const RUN_HISTORY_STORAGE_KEY = 'aopRunHistory'; // New storage key for run instances

// Function to get stored run history or fallback to mockData
function getStoredRunHistory(): AOPInstance[] {
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
      // Fallback to mockData if parsing fails or data is invalid
    }
  }
  // Fallback to aopsInstances from mockData if nothing in localStorage or if it's invalid
  return mockData.aopsInstances || []; 
}

// Function to save run history (Potentially to be used when new runs occur)
function saveRunHistory(runInstances: AOPInstance[]) {
  localStorage.setItem(RUN_HISTORY_STORAGE_KEY, JSON.stringify(runInstances));
}

export default function AOPRunHistoryPage() { // Renamed component
  const [runHistory, setRunHistory] = useState<AOPInstance[]>(getStoredRunHistory());
  const navigate = useNavigate();

  // This useEffect is for persisting changes if we allow modifications (e.g., deleting history)
  // For now, it just ensures consistency if we were to modify runHistory state.
  useEffect(() => {
    // If we were to modify the state (e.g. delete an item), this would save it.
    // saveRunHistory(runHistory); 
    // For now, we primarily load from mockData or whatever is in localStorage initially.
  }, [runHistory]);

  const handleDeleteRun = (id: string) => {
    const updatedHistory = runHistory.filter(run => run.id !== id);
    setRunHistory(updatedHistory);
    saveRunHistory(updatedHistory); // Save after deletion
  };

  // Determine if the displayed history is the fallback mock data
  const isMockData = JSON.stringify(runHistory) === JSON.stringify(mockData.aopsInstances || []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
                <h1 className="text-3xl font-bold text-brand-heading">AOP Run History</h1>
      <p className="text-brand-muted opacity-70 mt-1">
            View the execution history of your Automated Operation Procedures.
          </p>
        </div>
        {/* Button to navigate to AOP builder page */}
        <button
          className="mt-4 sm:mt-0 px-6 py-2.5 bg-brand-primary text-white rounded-md text-sm font-semibold hover:bg-brand-primaryDark transition-all duration-200 whitespace-nowrap"
          onClick={() => navigate('/aop')} // Navigate to the AOP manual builder or chat builder
        >
          Build New AOP
        </button>
      </div>

      {isMockData && runHistory.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-md">
          <p className="font-semibold">Displaying Example Data</p>
          <p className="text-sm">No actual run history found in storage. Showing mock examples.</p>
        </div>
      )}

      {runHistory.length === 0 && (
        <div className="col-span-full text-center text-brand-muted py-10">
          <svg className="mx-auto h-12 w-12 text-brand-muted opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2zm3-5a1 1 0 000 2h.01a1 1 0 100-2H7zm5 0a1 1 0 000 2h.01a1 1 0 100-2H12z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-brand-heading">No Run History Found</h3>
          <p className="mt-1 text-sm text-brand-muted opacity-70">Get started by building and running an AOP.</p>
        </div>
      )}

      <div className="space-y-6">
        {runHistory.map(run => (
          <div
            key={run.id}
            className="bg-brand-card border border-brand-border rounded-lg p-6 hover:border-brand-primary transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-semibold text-brand-heading hover:text-brand-primary cursor-pointer" onClick={() => navigate(`/aop/run/${run.id}`)}>{run.name}</h2>
                <p className="text-sm text-brand-muted opacity-70">ID: {run.id} {run.category && `| Category: ${run.category}`}</p>
              </div>
              <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                    run.status.toLowerCase().includes('success') || run.status.toLowerCase().includes('active') || run.status.toLowerCase().includes('completed') ? 'bg-green-100 text-green-800' :
                    run.status.toLowerCase().includes('fail') || run.status.toLowerCase().includes('error') ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800' 
                  }`}
                >
                  {run.status}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-brand-muted opacity-70 mb-3">{run.description || 'No description provided.'}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                <div><span className="font-medium text-brand-heading">Last Run:</span> {new Date(run.lastRun).toLocaleString()}</div>
                {run.metrics && Object.entries(run.metrics).map(([key, value]) => (
                    <div key={key}><span className="font-medium text-brand-heading">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {value}</div>
                ))}
            </div>

            {run.runHistory && run.runHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-brand-heading mb-2">Recent Activity:</h4>
                <ul className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3 bg-brand-light">
                  {run.runHistory.slice(0, 5).map((historyItem, index) => ( // Show latest 5 for brevity
                    <li key={index} className="text-xs text-brand-muted border-b border-brand-border pb-1 last:border-b-0 last:pb-0">
                      <span className={`font-medium ${historyItem.status.toLowerCase() === 'success' ? 'text-green-600' : historyItem.status.toLowerCase() === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>{historyItem.status}:</span> {historyItem.details} 
                      <span className="text-brand-muted opacity-50">({new Date(historyItem.timestamp).toLocaleTimeString()})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
             <div className="mt-4 flex justify-end">
                <button
                className="text-xs text-brand-danger hover:text-red-700 hover:underline mr-4"
                onClick={() => handleDeleteRun(run.id)}
                title="Delete this run history"
                >
                Delete Run
                </button>
                <button
                    className="px-4 py-1.5 bg-brand-heading text-white rounded-md text-xs font-semibold hover:bg-brand-primaryDark transition-all duration-200"
                    onClick={() => navigate(`/aop/run/${run.id}`)} // Navigate to the specific run simulation/details page
                >
                    View Details / Rerun
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 