import React from "react";
import { useNavigate } from "react-router-dom";
import { BuilderProgressTracker } from "../components/BuilderProgressTracker";
import mockData from "../data/mockData.json";
import content from "../config/content";

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

export function WorkflowPage() {
  const [step, setStep] = React.useState(0);
  const [workflow, setWorkflow] = React.useState<WorkflowId>("");
  const [dataSources, setDataSources] = React.useState<DataSource[]>([]);
  const [actions, setActions] = React.useState<Action[]>([]);
  const [llm, setLLM] = React.useState<LLM>(mockData.llmOptions[0]?.id || "");
  const navigate = useNavigate();

  const workflows = mockData.workflows;
  const dataSourceOptions = mockData.dataSourceOptions;
  const actionOptions = mockData.actionOptions;
  const llmOptions = mockData.llmOptions;

  const stepConfiguration = [
    { title: "Start" },
    { title: "Workflow" },
    { title: "Data Sources" },
    { title: "Actions" },
    { title: "LLM" },
  ];

  function getCompatibleDataSourcesForWorkflow(wfId: WorkflowId) {
    const wf = workflows.find((w) => w.id === wfId);
    return wf?.compatibleDataSources || [];
  }

  function getRequiredDataSourcesForWorkflow(wfId: WorkflowId) {
    const wf = workflows.find((w) => w.id === wfId);
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
  function next() {
    setStep((s) => Math.min(s + 1, stepConfiguration.length - 1));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }
  function startAgent() {
    function getStoredAgents() {
      const storedAgents = localStorage.getItem("aopAgents");
      if (storedAgents) {
        return JSON.parse(storedAgents);
      }
      return [];
    }
    function saveAgents(agents: any) {
      localStorage.setItem("aopAgents", JSON.stringify(agents));
    }
    const newAgent = {
      id: workflow + "-" + Date.now(),
      workflow,
      dataSources,
      actions,
      llm,
      createdAt: new Date().toISOString(),
    };
    const existingAgents = getStoredAgents();
    saveAgents([...existingAgents, newAgent]);

    navigate("/workflow/run", {
      state: {
        workflow: workflow,
        dataSources: dataSources,
        actions: actions,
        llm: llm,
        id: newAgent.id,
      },
    });
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-heading mb-2">
              Create Automated Workflows to streamline your{" "}
              <span className="text-brand-primary">daily operations</span>
            </h1>
            <p className="text-brand-muted">
              Create automated workflows to streamline your{" "}
              {content.builderDescription}
            </p>
            <button
              onClick={() => navigate("/workflow/templates")}
              className="w-full px-8 py-4 bg-brand-primary text-brand-dark rounded-lg shadow-md hover:bg-brand-hover transition-all duration-200 font-semibold text-lg"
            >
              Create Workflows
            </button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-brand-dark">
              Select Workflow ({workflows.length} options)
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => {
                    setWorkflow(wf.id);
                    next();
                  }}
                  className={`p-6 border rounded-lg text-left hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 flex flex-col justify-between h-full ${
                    workflow === wf.id
                      ? "bg-brand-light border-brand-primary"
                      : "border-brand-border"
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark">
                      {wf.name}
                    </h3>
                    <p className="text-sm text-brand-muted mt-1">
                      {wf.description}
                    </p>
                  </div>
                  <p className="text-xs text-brand-muted mt-3">
                    Category: {wf.category}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prev}
                className="px-4 py-2 text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-light transition-all duration-200"
              >
                Back
              </button>
            </div>
          </div>
        );
      case 2:
        const currentWorkflowDetails = workflows.find(
          (wf) => wf.id === workflow
        );
        const availableDataSources = dataSourceOptions.filter((ds) => {
          if (!currentWorkflowDetails) return true;
          return [
            ...(currentWorkflowDetails.compatibleDataSources || []),
            ...(currentWorkflowDetails.requiredDataSources || []),
          ].includes(ds);
        });
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-brand-dark">
              Select Data Sources for "{currentWorkflowDetails?.name}"
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableDataSources.map((ds) => {
                const isRequired =
                  currentWorkflowDetails?.requiredDataSources.includes(ds);
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
                    className={`p-4 border rounded-md text-left hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 ${
                      dataSources.includes(ds)
                        ? "bg-brand-light border-brand-primary"
                        : "border-brand-border"
                    } ${
                      isRequired && !dataSources.includes(ds)
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <h3 className="text-lg font-medium text-brand-dark">
                      {ds}
                    </h3>
                    {isRequired && (
                      <span className="text-xs text-red-600"> (Required)</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prev}
                className="px-4 py-2 text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-light transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={
                  !currentWorkflowDetails?.requiredDataSources.every((rs) =>
                    dataSources.includes(rs)
                  )
                }
                className="px-6 py-2 text-brand-dark bg-brand-primary rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        const currentActionOptions =
          actionOptions[workflow as keyof typeof actionOptions] || [];
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-brand-dark">
              Select Actions for "
              {workflows.find((wf) => wf.id === workflow)?.name}"
            </h2>
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
                    className={`p-4 border rounded-md text-left hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 ${
                      actions.includes(action)
                        ? "bg-brand-light border-brand-primary"
                        : "border-brand-border"
                    }`}
                  >
                    <h3 className="text-lg font-medium text-brand-dark">
                      {action}
                    </h3>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-brand-muted">
                No specific actions defined for this workflow. You can proceed
                or go back to select a different workflow.
              </p>
            )}
            <div className="flex justify-between mt-6">
              <button
                onClick={prev}
                className="px-4 py-2 text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-light transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={next}
                className="px-6 py-2 text-brand-dark bg-brand-primary rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-brand-dark">
              Select LLM for "{workflows.find((wf) => wf.id === workflow)?.name}
              "
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {llmOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setLLM(option.id as LLM)}
                  className={`p-6 border rounded-lg text-left hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 flex flex-col justify-between h-full ${
                    llm === option.id
                      ? "bg-brand-light border-brand-primary"
                      : "border-brand-border"
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark">
                      {option.name}
                    </h3>
                    <p className="text-sm text-brand-muted mt-1">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={prev}
                className="px-4 py-2 text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-light transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={startAgent}
                disabled={!workflow || dataSources.length === 0 || !llm}
                className="px-6 py-2 text-brand-dark bg-brand-primary rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200"
              >
                Create AOPS
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center text-brand-danger">
            Error: Unknown step. Please try again.
          </div>
        );
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <BuilderProgressTracker
        currentStep={step}
        steps={stepConfiguration}
        onStepClick={goToStep}
      />
      <div className="p-6 md:p-8 mt-8 bg-brand-card rounded-lg border border-brand-border">
        {renderStep()}
      </div>
    </div>
  );
}
