import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderProgressTracker } from '../components/ProgressTracker';
import mockData from '../data/mockData.json';

type WorkflowId = string;
type DataSource = string;
type Action = string;
type LLM = string;

type Result = {
  status: string;
  message: string;
  details: {
    workflow: WorkflowId;
    dataSources: DataSource[];
    actions: Action[];
    llm: LLM;
    execution: string;
  };
} | null;

export function AOPPage() {
  const [step, setStep] = React.useState(0);
  const [workflow, setWorkflow] = React.useState<WorkflowId>('');
  const [dataSources, setDataSources] = React.useState<DataSource[]>([]);
  const [actions, setActions] = React.useState<Action[]>([]);
  const [llm, setLLM] = React.useState<LLM>(mockData.llmOptions[0]?.id || '');
  const navigate = useNavigate();

  const workflows = mockData.workflows;
  const dataSourceOptions = mockData.dataSourceOptions;
  const actionOptions = mockData.actionOptions;
  const llmOptions = mockData.llmOptions;

  const stepConfiguration = [
    { title: 'Start' },
    { title: 'Workflow' },
    { title: 'Data Sources' },
    { title: 'Actions' },
    { title: 'LLM' },
  ];

  function getCompatibleDataSourcesForWorkflow(wfId: WorkflowId) {
    const wf = workflows.find(w => w.id === wfId);
    return wf?.compatibleDataSources || [];
  }
  
  function getRequiredDataSourcesForWorkflow(wfId: WorkflowId) {
    const wf = workflows.find(w => w.id === wfId);
    return wf?.requiredDataSources || [];
  }

  React.useEffect(() => {
    if (workflow) {
      const compatible = getCompatibleDataSourcesForWorkflow(workflow);
      const required = getRequiredDataSourcesForWorkflow(workflow);
      const allAvailable = [...new Set([...compatible, ...required])];
      
      if (allAvailable.length === 1) {
        setDataSources([allAvailable[0]]);
      } else {
        setDataSources(required);
      }
      setActions([]);
    }
  }, [workflow]);

  function goToStep(idx: number) {
    if (idx <= step) setStep(idx);
  }
  function next() { setStep((s) => Math.min(s + 1, stepConfiguration.length - 1)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }
  function startAgent() {
    function getStoredAgents() {
      const storedAgents = localStorage.getItem('aopAgents');
      if (storedAgents) {
        return JSON.parse(storedAgents);
      }
      return [];
    }
    function saveAgents(agents: any) {
      localStorage.setItem('aopAgents', JSON.stringify(agents));
    }
    const newAgent = {
      id: workflow + '-' + Date.now(),
      workflow,
      dataSources,
      actions,
      llm,
      createdAt: new Date().toISOString(),
    };
    const existingAgents = getStoredAgents();
    saveAgents([...existingAgents, newAgent]);

    navigate(
      '/aop/run',
      {
        state: {
          workflow: workflow,
          dataSources: dataSources,
          actions: actions,
          llm: llm,
          id: newAgent.id
        }
      }
    );
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-500">Welcome to the Chime AOPS Builder</h2>
            <p className="text-gray-600">
              Create Automated Operations Procedures (AOPS) to streamline your Chime workflows. Get started by selecting a workflow template.
            </p>
            <button
              onClick={next}
              className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Get Started
            </button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Select Workflow ({workflows.length} options)</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => { setWorkflow(wf.id); next(); }}
                  className={`p-6 border rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex flex-col justify-between h-full ${
                    workflow === wf.id ? 'bg-blue-50 border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{wf.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{wf.description}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Category: {wf.category}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={prev} className="px-4 py-2 text-gray-700 bg-white rounded-md hover:bg-gray-300">Back</button>
            </div>
          </div>
        );
      case 2:
        const currentWorkflowDetails = workflows.find(wf => wf.id === workflow);
        const availableDataSources = dataSourceOptions.filter(ds => {
            if (!currentWorkflowDetails) return true;
            return [...(currentWorkflowDetails.compatibleDataSources || []), ...(currentWorkflowDetails.requiredDataSources || [])].includes(ds);
        });
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Select Data Sources for "{currentWorkflowDetails?.name}"</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableDataSources.map((ds) => {
                const isRequired = currentWorkflowDetails?.requiredDataSources.includes(ds);
                return (
                  <button
                    key={ds}
                    onClick={() => {
                      const isSelected = dataSources.includes(ds);
                      if (isSelected) {
                        if (!isRequired) {
                           setDataSources(dataSources.filter((d) => d !== ds));
                        }
                      } else {
                        setDataSources([...dataSources, ds]);
                      }
                    }}
                    className={`p-4 border rounded-md text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                      dataSources.includes(ds) ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                    } ${isRequired && !dataSources.includes(ds) ? 'border-red-500' : ''}`}
                  >
                    <h3 className="text-lg font-medium text-gray-800">{ds}</h3>
                    {isRequired && <span className="text-xs text-red-600"> (Required)</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={prev} className="px-4 py-2 text-gray-700 bg-white rounded-md hover:bg-gray-300">Back</button>
              <button
                onClick={next}
                disabled={!(currentWorkflowDetails?.requiredDataSources.every(rs => dataSources.includes(rs)))}
                className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        const currentActionOptions = actionOptions[workflow as keyof typeof actionOptions] || [];
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Select Actions for "{workflows.find(wf=>wf.id === workflow)?.name}"</h2>
            {currentActionOptions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentActionOptions.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      const isSelected = actions.includes(action);
                      if (isSelected) {
                        setActions(actions.filter((a) => a !== action));
                      } else {
                        setActions([...actions, action]);
                      }
                    }}
                    className={`p-4 border rounded-md text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                      actions.includes(action) ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <h3 className="text-lg font-medium text-gray-800">{action}</h3>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No specific actions defined for this workflow. You can proceed or go back to select a different workflow.</p>
            )}
            <div className="flex justify-between mt-6">
              <button onClick={prev} className="px-4 py-2 text-gray-700 bg-white rounded-md hover:bg-gray-300">Back</button>
              <button
                onClick={next}
                className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Select LLM for "{workflows.find(wf=>wf.id === workflow)?.name}"</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {llmOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setLLM(option.id as LLM)}
                  className={`p-6 border rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex flex-col justify-between h-full ${
                    llm === option.id ? 'bg-blue-50 border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{option.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={prev} className="px-4 py-2 text-gray-700 bg-white rounded-md hover:bg-gray-300">Back</button>
              <button
                onClick={startAgent}
                disabled={!workflow || dataSources.length === 0 || !llm}
                className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                Create AOPS
              </button>
            </div>
          </div>
        );
      default:
        return <div className="text-center text-red-500">Error: Unknown step. Please try again.</div>;
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <BuilderProgressTracker currentStep={step} steps={stepConfiguration} onStepClick={goToStep} />
      <div className="p-6 md:p-8 mt-8 bg-white rounded-lg shadow-xl">
        {renderStep()}
      </div>
    </div>
  );
} 