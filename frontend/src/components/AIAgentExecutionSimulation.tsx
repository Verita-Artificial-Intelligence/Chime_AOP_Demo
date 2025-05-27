import React, { useState, useEffect } from 'react';
import ProgressTracker from './ProgressTracker';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BriefcaseIcon, ServerStackIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface AIAgentExecutionSimulationProps {
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  onRestart: () => void;
}

// Helper: Render a table for a list of objects
function SimpleTable({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data) || data.length === 0) return <div className="text-brand-muted">No data available.</div>;
  const columns = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs bg-brand-card border border-brand-border rounded-card">
        <thead>
          <tr className="bg-brand-background">
            {columns.map(col => (
              <th key={col} className="border border-brand-border p-2 text-left capitalize text-brand-heading bg-brand-background">{col.replace(/([A-Z])/g, ' $1')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="bg-white hover:bg-gray-100">
              {columns.map(col => (
                <td key={col} className="border border-brand-border p-2 text-brand-heading">{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AIAgentExecutionSimulation({ workflow, dataSources, actions, llm, onRestart }: AIAgentExecutionSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [executionComplete, setExecutionComplete] = useState(false);
  const [mockData, setMockData] = useState<any>(null);

  // Build the step sequence: init, data sources, actions, complete
  const stepSequence = [
    { type: 'init', label: `Initializing workflow for ${workflow}` },
    ...dataSources.map(ds => ({ type: 'datasource', label: `Analyzing data source: ${ds}`, ds })),
    ...actions.map(action => ({ type: 'action', label: `Executing action: ${action}`, action })),
    { type: 'complete', label: 'All steps completed!' }
  ];

  useEffect(() => {
    import('../data/mockData.json').then(data => setMockData(data));
  }, []);

  useEffect(() => {
    if (!mockData) return;
    if (currentStep < stepSequence.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1400);
      return () => clearTimeout(timer);
    } else if (currentStep === stepSequence.length - 1 && !executionComplete) {
      setExecutionComplete(true);
    }
  }, [currentStep, stepSequence.length, mockData, executionComplete]);

  // Auto-scroll to the current step card
  useEffect(() => {
    if (currentStep > 0) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        const stepElement = document.getElementById(`agent-step-card-${currentStep - 1}`);
        if (stepElement) {
          stepElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [currentStep]);

  // Helper to get a human-readable summary/table for each data source
  const getDataSourceSummary = (ds: string) => {
    if (!mockData) return null;

    // Attempt to fetch from the new dataSourceSamples section first
    if (mockData.dataSourceSamples && mockData.dataSourceSamples[ds]) {
      const sampleData = mockData.dataSourceSamples[ds];
      return <SimpleTable data={Array.isArray(sampleData) ? sampleData.slice(0, 3) : [sampleData]} />;
    }

    // Fallback to existing specific logic if needed (or can be removed if dataSourceSamples is comprehensive)
    if (ds.toLowerCase().includes('orbit')) {
      // Show first 3 receivables as example
      return <SimpleTable data={mockData.receivablesTableData?.slice(0, 3) || []} />;
    }
    if (ds.toLowerCase().includes('oracle')) {
      // Show first 3 payables as example
      return <SimpleTable data={mockData.payablesTableData?.slice(0, 3) || []} />;
    }
    if (ds.toLowerCase().includes('powerbi')) {
      // Show first 3 payroll runs as example
      return <SimpleTable data={mockData.payrollRuns?.slice(0, 3) || []} />;
    }
    if (ds.toLowerCase().includes('manual')) {
      // Show first 3 entitlements as example
      return <SimpleTable data={mockData.entitlementsTableData?.slice(0, 3) || []} />;
    }
    if (ds.toLowerCase().includes('web api')) {
      // Show first webApiData response as example
      const api = mockData.webApiData?.[0];
      return api && api.response ? <SimpleTable data={api.response.slice(0, 3)} /> : <div className="text-brand-muted">No data available for Web API.</div>;
    }
    if (ds.toLowerCase().includes('powerapps')) {
      // Show first powerAppsData results as example
      const app = mockData.powerAppsData?.[0];
      return app && app.results ? <SimpleTable data={app.results.slice(0, 3)} /> : <div className="text-brand-muted">No data available for Power Apps.</div>;
    }
    if (ds.toLowerCase().includes('excel')) {
      // Show first excelData rows as example
      const excel = mockData.excelData?.[0];
      return excel && excel.rows ? <SimpleTable data={excel.rows.slice(0, 3)} /> : <div className="text-brand-muted">No data available for Excel.</div>;
    }
    return <div className="text-brand-muted">No specific sample data configured for this source.</div>;
  };

  // Helper to get a human-readable summary/result for each action
  const getActionSummary = (action: string) => {
    if (!mockData) return null;
    if (action.toLowerCase().includes('invoice')) {
      return <SimpleTable data={mockData.receivablesTableData?.slice(0, 3) || []} />;
    }
    if (action.toLowerCase().includes('reminder')) {
      return <SimpleTable data={mockData.payablesTableData?.slice(0, 3) || []} />;
    }
    if (action.toLowerCase().includes('report')) {
      // Show a stat summary for receivables/payables
      const isReceivable = workflow.toLowerCase().includes('receivable');
      const table = isReceivable ? mockData.receivablesTableData : mockData.payablesTableData;
      const total = table?.reduce((sum: number, row: any) => sum + row.amount, 0);
      const overdue = table?.filter((row: any) => row.status === 'Overdue').length;
      const dueSoon = table?.filter((row: any) => row.status === 'Due Soon').length;
      return (
        <div className="flex gap-6 flex-wrap">
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Total Outstanding</div>
            <div className="text-xl font-bold text-brand-primary">${total?.toLocaleString()}</div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Overdue</div>
            <div className="text-xl font-bold text-brand-primary">{overdue}</div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Due Soon</div>
            <div className="text-xl font-bold text-brand-primary">{dueSoon}</div>
          </div>
        </div>
      );
    }
    if (action.toLowerCase().includes('payroll')) {
      // Show latest payroll run
      const run = mockData.payrollRuns?.[0];
      if (!run) return null;
      return (
        <div className="flex gap-6 flex-wrap">
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Payroll ID</div>
            <div className="text-xl font-bold text-brand-primary">{run.id}</div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Employees</div>
            <div className="text-xl font-bold text-brand-primary">{run.employees}</div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Amount</div>
            <div className="text-xl font-bold text-brand-primary">${run.amount?.toLocaleString()}</div>
          </div>
        </div>
      );
    }
    if (action.toLowerCase().includes('leave')) {
      return <SimpleTable data={mockData.entitlementsTableData?.slice(0, 3) || []} />;
    }
    // NEW: Try to find a matching action result in mockData.actionResults
    const actionResult = mockData.actionResults?.find((ar: any) => ar.action === action);
    if (actionResult && actionResult.results && actionResult.results.length > 0) {
      return <SimpleTable data={actionResult.results} />;
    }
    return <div className="text-brand-muted">No summary available for this action.</div>;
  };

  // Stepper steps for all steps
  const stepperSteps = stepSequence.map((step, i) => ({ title: `Step ${i + 1}` }));

  // Render all completed steps (timeline)
  const renderedSteps = stepSequence.slice(0, currentStep + 1).map((step, idx) => {
    // Do not render the 'complete' step card
    if (step.type === 'complete') return null;
    return (
      <div key={idx} id={`agent-step-card-${idx}`} className="bg-brand-card border border-brand-border rounded-card shadow-card p-card animate-fadeIn mb-8">
        <h3 className="text-lg font-semibold text-brand-heading mb-2">{step.label}</h3>
        {step.type === 'datasource' && (
          <div className="mt-4">
            <div className="text-xs text-brand-muted mb-2">Sample data being analyzed:</div>
            {getDataSourceSummary((step as any).ds)}
          </div>
        )}
        {step.type === 'action' && (
          <div className="mt-4">
            <div className="text-xs text-brand-muted mb-2">Result:</div>
            {getActionSummary((step as any).action)}
          </div>
        )}
        {step.type === 'init' && (
          <div className="mt-4 text-brand-muted text-sm">Preparing environment and loading configuration...</div>
        )}
      </div>
    );
  });

  // PDF download handler
  const handleDownloadPDF = async () => {
    const element = document.getElementById('agent-simulation-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 40;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight);
    pdf.save('agent-workflow-report.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Horizontal progress bar at the top */}
      <div className="mb-8">
        <ProgressTracker steps={stepperSteps} currentStep={currentStep} />
      </div>
      <div id="agent-simulation-content">
      {/* Modern summary card with pills/badges */}
      <div className="bg-brand-card border border-brand-border rounded-card shadow-card p-6 flex flex-col gap-4 items-center mb-8 text-white">
        <div className="flex flex-wrap gap-3 justify-center">
          <span className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm">
            <BriefcaseIcon className="w-4 h-4 mr-1" /> {workflow}
          </span>
          {dataSources.map((ds, i) => (
            <span key={ds + i} className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm">
              <ServerStackIcon className="w-4 h-4 mr-1" /> {ds}
            </span>
          ))}
          <span className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm">
            <SparklesIcon className="w-4 h-4 mr-1" /> {llm}
          </span>
        </div>
      </div>
      {/* Timeline of steps */}
      {renderedSteps}
      {/* Loader and Completion */}
      {!executionComplete && (
        <div className="text-center mt-10">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-brand-primary h-12 w-12 mb-4 mx-auto"></div>
          <p className="text-lg text-brand-muted">{stepSequence[currentStep].label}...</p>
        </div>
      )}
      {executionComplete && (
        <div className="flex flex-col items-center justify-center mt-20 mb-12">
          <div className="bg-brand-card border border-brand-border rounded-card shadow-card px-8 py-6 flex flex-col items-center w-full max-w-md">
            <span className="inline-flex items-center text-brand-success text-base font-semibold gap-2 mb-4">
              <svg className="w-5 h-5 text-brand-success" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9"/></svg>
              Agent workflow completed successfully!
            </span>
            <p className="text-sm text-gray-600 mb-4 text-center">
              The fraud investigation workflow has been executed and all suspicious activities have been analyzed.
            </p>
            <div className="flex justify-center gap-4 mt-2 w-full">
              <button className="btn-primary w-1/2" onClick={onRestart}>New Agent</button>
              <button className="btn-primary w-1/2" onClick={handleDownloadPDF}>Download Report</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Loader and fadeIn animation (add to your global CSS if not present)
/*
.loader {
  border-top-color: #635BFF;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
*/ 