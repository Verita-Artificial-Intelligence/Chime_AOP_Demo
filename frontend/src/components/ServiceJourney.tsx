import React from "react";
import { 
  ServerStackIcon,
  CpuChipIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface ServiceJourneyProps {
  steps: { type: string; label: string; ds?: string; action?: string }[];
  currentStep: number;
  executionComplete: boolean;
}

interface StepGroup {
  id: string;
  title: string;
  icon: any;
  steps: Array<{
    name: string;
    originalIndex: number;
    type: string;
  }>;
}

const ServiceJourney: React.FC<ServiceJourneyProps> = ({ steps, currentStep, executionComplete }) => {
  // Group steps dynamically based on their type
  const groupSteps = (): StepGroup[] => {
    const groups: StepGroup[] = [];
    let stepIndex = 0;
    
    // Add initialization group if present
    const initSteps = steps.filter(s => s.type === "init");
    if (initSteps.length > 0) {
      groups.push({
        id: "initialization",
        title: "Initializing Workflow",
        icon: PlayCircleIcon,
        steps: initSteps.map((step, idx) => ({
          name: step.label.replace(/^Initializing workflow for /, ''),
          originalIndex: stepIndex++,
          type: step.type
        }))
      });
    }
    
    // Add data sources group
    const dataSourceSteps = steps.filter(s => s.type === "datasource");
    if (dataSourceSteps.length > 0) {
      groups.push({
        id: "datasources",
        title: "Analyzing Data Sources",
        icon: ServerStackIcon,
        steps: dataSourceSteps.map((step) => ({
          name: step.ds || step.label.replace(/^Analyzing data source: /, ''),
          originalIndex: stepIndex++,
          type: step.type
        }))
      });
    }
    
    // Add actions group
    const actionSteps = steps.filter(s => s.type === "action");
    if (actionSteps.length > 0) {
      groups.push({
        id: "actions",
        title: "Executing Actions",
        icon: CpuChipIcon,
        steps: actionSteps.map((step) => ({
          name: step.action || step.label.replace(/^Executing action: /, ''),
          originalIndex: stepIndex++,
          type: step.type
        }))
      });
    }
    
    // Add completion group if workflow is complete
    if (executionComplete || steps.some(s => s.type === "complete")) {
      groups.push({
        id: "completion",
        title: "Workflow Complete",
        icon: CheckCircleIcon,
        steps: [{
          name: "All steps completed successfully",
          originalIndex: stepIndex++,
          type: "complete"
        }]
      });
    }
    
    return groups;
  };

  const groups = groupSteps();
  
  // Get current active group and step within that group
  const getActiveGroupAndStep = () => {
    // Handle completion state
    if (executionComplete) {
      const completionGroup = groups.findIndex(g => g.id === "completion");
      return { groupIndex: completionGroup, stepIndex: 0 };
    }
    
    // Find which group contains the current step
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      for (let j = 0; j < group.steps.length; j++) {
        if (group.steps[j].originalIndex === currentStep) {
          return { groupIndex: i, stepIndex: j };
        }
      }
    }
    
    return { groupIndex: -1, stepIndex: -1 };
  };

  const { groupIndex, stepIndex } = getActiveGroupAndStep();

  return (
    <div className="fixed right-4 top-10 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[calc(90vh)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Workflow Steps</h2>
        {!executionComplete && currentStep > 0 && (
          <p className="text-sm text-blue-600 mt-1 flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            Workflow executing...
          </p>
        )}
      </div>
      
      {/* Steps container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {groups.map((group, gIdx) => {
            const isCurrentGroup = gIdx === groupIndex;
            const isPastGroup = gIdx < groupIndex;
            const isFutureGroup = gIdx > groupIndex;
            
            // Calculate if all steps in this group are complete
            const allStepsComplete = group.steps.every(step => 
              step.originalIndex < currentStep || executionComplete
            );
            
            const Icon = group.icon;
            
            return (
              <div key={group.id} className="relative">
                {/* Group header */}
                <div className="flex items-start mb-3">
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                    allStepsComplete 
                      ? "bg-green-100" 
                      : isCurrentGroup 
                      ? "bg-blue-100" 
                      : "bg-gray-100"
                  }`}>
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      allStepsComplete 
                        ? "text-green-600" 
                        : isCurrentGroup 
                        ? "text-blue-600" 
                        : "text-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold transition-all duration-300 ${
                      isPastGroup || isCurrentGroup ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {group.title}
                    </h3>
                  </div>
                  {allStepsComplete && (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  )}
                </div>

                {/* Group steps */}
                <div className="ml-11 space-y-2">
                  {group.steps.map((step, sIdx) => {
                    const isActiveStep = gIdx === groupIndex && sIdx === stepIndex;
                    const isCompleteStep = step.originalIndex < currentStep || executionComplete;
                    const isPendingStep = step.originalIndex > currentStep && !executionComplete;
                    
                    return (
                      <div 
                        key={sIdx} 
                        className={`
                          relative flex items-center p-3 rounded-lg transition-all duration-300
                          ${isActiveStep 
                            ? "bg-blue-50 border border-blue-200 shadow-sm" 
                            : isCompleteStep 
                            ? "bg-green-50 border border-green-100" 
                            : "bg-gray-50 border border-gray-100"
                          }
                        `}
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-medium transition-all duration-300 ${
                            isCompleteStep 
                              ? "text-gray-900" 
                              : isActiveStep
                              ? "text-blue-900"
                              : "text-gray-500"
                          }`}>
                            {step.name}
                          </p>
                        </div>
                        
                        {/* Status indicator */}
                        {isActiveStep && !executionComplete && (
                          <div className="ml-3 flex items-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          </div>
                        )}
                        {isCompleteStep && (
                          <div className="ml-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        {isPendingStep && (
                          <div className="ml-3">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Connector line between groups */}
                {gIdx < groups.length - 1 && (
                  <div className={`
                    absolute left-5 top-16 bottom-0 w-0.5 transition-all duration-300
                    ${isPastGroup ? "bg-green-400" : "bg-gray-200"}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceJourney; 