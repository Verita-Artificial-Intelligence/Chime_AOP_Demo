import React from "react";
import { 
  DocumentMagnifyingGlassIcon, 
  UserIcon, 
  GiftIcon,
  BookOpenIcon,
  ArrowLeftCircleIcon
} from "@heroicons/react/24/outline";

interface ServiceJourneyProps {
  steps: { type: string; label: string; ds?: string; action?: string }[];
  currentStep: number;
}

interface JourneyStep {
  type: "systems_integration" | "knowledge_engine" | "journey";
  name: string;
  icon?: any;
}

interface Journey {
  id: string;
  name: string;
  steps: JourneyStep[];
}

const ServiceJourney: React.FC<ServiceJourneyProps> = ({ steps, currentStep }) => {
  // Map the workflow steps to journey structure
  const mapStepsToJourneys = (): Journey[] => {
    const journeys: Journey[] = [];
    
    // Welcome Journey (initialization)
    if (steps.some(s => s.type === "init")) {
      journeys.push({
        id: "welcome",
        name: "Welcome",
        steps: []
      });
    }

    // Determine journey structure based on workflow steps
    const dataSourceSteps = steps.filter(s => s.type === "datasource");
    const actionSteps = steps.filter(s => s.type === "action");
    
    // For FCRA workflows, use specific journey names
    const isFCRAWorkflow = steps.some(s => 
      s.label?.toLowerCase().includes("fcra") || 
      s.label?.toLowerCase().includes("acdv") ||
      s.ds?.toLowerCase().includes("acdv") ||
      s.ds?.toLowerCase().includes("verification")
    );
    
    if (isFCRAWorkflow) {
      // Track Order Journey (for FCRA data sources)
      if (dataSourceSteps.length > 0) {
        const trackOrderSteps: JourneyStep[] = dataSourceSteps.map(step => {
          let name = step.ds || "Data Source";
          // Map data source names to more user-friendly names
          if (name.includes("ACDV")) name = "Order Lookup";
          else if (name.includes("B-Point") || name.includes("Verification")) name = "Find Products";
          
          return {
            type: "systems_integration" as const,
            name,
            icon: DocumentMagnifyingGlassIcon
          };
        });
        
        journeys.push({
          id: "track-order",
          name: "Track Order",
          steps: trackOrderSteps
        });
      }

      // Product Recommendation Journey (for FCRA actions)
      if (actionSteps.length > 0) {
        const recommendationSteps: JourneyStep[] = [];
        
        actionSteps.forEach(step => {
          const actionName = step.action || "Action";
          
          // Map action names to journey steps
          if (actionName.toLowerCase().includes("verify") || 
              actionName.toLowerCase().includes("validate")) {
            recommendationSteps.push({
              type: "systems_integration",
              name: "Lookup Customer",
              icon: UserIcon
            });
          } else if (actionName.toLowerCase().includes("generate") ||
                     actionName.toLowerCase().includes("create")) {
            recommendationSteps.push({
              type: "systems_integration",
              name: "Get Available Offers",
              icon: GiftIcon
            });
            recommendationSteps.push({
              type: "knowledge_engine",
              name: "Offer Details",
              icon: BookOpenIcon
            });
          }
        });
        
        if (recommendationSteps.length > 0) {
          journeys.push({
            id: "product-recommendation",
            name: "Product Recommendation",
            steps: recommendationSteps
          });
        }
      }
    } else {
      // Generic journey structure for non-FCRA workflows
      if (dataSourceSteps.length > 0) {
        const trackOrderSteps: JourneyStep[] = dataSourceSteps.map(step => ({
          type: "systems_integration" as const,
          name: step.ds || "Data Source",
          icon: DocumentMagnifyingGlassIcon
        }));
        
        journeys.push({
          id: "track-order",
          name: "Track Order",
          steps: trackOrderSteps
        });
      }

      if (actionSteps.length > 0) {
        const recommendationSteps: JourneyStep[] = actionSteps.map(step => {
          const isKnowledgeEngine = step.action?.toLowerCase().includes("details") || 
                                   step.action?.toLowerCase().includes("generate");
          
          return {
            type: isKnowledgeEngine ? "knowledge_engine" : "systems_integration",
            name: step.action || "Action",
            icon: isKnowledgeEngine ? BookOpenIcon : GiftIcon
          };
        });
        
        journeys.push({
          id: "product-recommendation",
          name: "Product Recommendation",
          steps: recommendationSteps
        });
      }
    }

    // Add enrollment journey if workflow is complete or has update actions
    const hasUpdateAction = actionSteps.some(s => 
      s.action?.toLowerCase().includes("update") || 
      s.action?.toLowerCase().includes("enroll")
    );
    
    if (steps.some(s => s.type === "complete") || hasUpdateAction) {
      journeys.push({
        id: "enrollment",
        name: "Enroll in Auto-Delivery",
        steps: [
          {
            type: "systems_integration",
            name: "Lookup Customer",
            icon: UserIcon
          },
          {
            type: "systems_integration",
            name: "Update Enrollment",
            icon: ArrowLeftCircleIcon
          }
        ]
      });
    }

    return journeys;
  };

  const journeys = mapStepsToJourneys();
  
  // Calculate which journey and step we're currently on
  const getCurrentJourneyAndStep = () => {
    let stepCount = 0;
    const currentStepType = steps[currentStep]?.type;
    
    // Special handling for init step
    if (currentStepType === "init") {
      return { journeyIndex: 0, stepIndex: -1 };
    }
    
    // Count through actual workflow steps
    let dsCount = 0;
    let actionCount = 0;
    
    for (let i = 0; i <= currentStep; i++) {
      if (steps[i].type === "datasource") dsCount++;
      else if (steps[i].type === "action") actionCount++;
    }
    
    // Determine which journey we're in
    for (let i = 0; i < journeys.length; i++) {
      const journey = journeys[i];
      
      if (journey.id === "welcome" && currentStepType === "init") {
        return { journeyIndex: i, stepIndex: -1 };
      } else if (journey.id === "track-order" && currentStepType === "datasource") {
        // Find which data source step we're on
        const dsSteps = steps.filter(s => s.type === "datasource");
        const currentDsIndex = dsSteps.findIndex(s => s === steps[currentStep]);
        return { journeyIndex: i, stepIndex: Math.min(currentDsIndex, journey.steps.length - 1) };
      } else if (journey.id === "product-recommendation" && currentStepType === "action") {
        // Find which action step we're on
        const actionSteps = steps.filter(s => s.type === "action");
        const currentActionIndex = actionSteps.findIndex(s => s === steps[currentStep]);
        return { journeyIndex: i, stepIndex: Math.min(currentActionIndex, journey.steps.length - 1) };
      } else if (journey.id === "enrollment" && currentStepType === "complete") {
        return { journeyIndex: i, stepIndex: journey.steps.length - 1 };
      }
    }
    
    return { journeyIndex: -1, stepIndex: -1 };
  };

  const { journeyIndex, stepIndex } = getCurrentJourneyAndStep();

  return (
    <div className="fixed right-4 top-24 w-96 bg-gray-50 rounded-lg shadow-xl border border-gray-200 p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Service Journey
      </h2>
      
      <div className="space-y-8">
        {journeys.map((journey, jIdx) => (
          <div key={journey.id} className="relative">
            {/* Journey title */}
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                jIdx < journeyIndex || (jIdx === journeyIndex && journey.steps.length === 0) 
                  ? "bg-green-500" 
                  : jIdx === journeyIndex 
                  ? "bg-blue-600" 
                  : "bg-gray-300"
              }`} />
              <h3 className={`text-sm uppercase tracking-wide font-semibold ${
                jIdx <= journeyIndex ? "text-gray-600" : "text-gray-400"
              }`}>
                Journey
              </h3>
            </div>
            <div className={`ml-6 text-xl font-bold mb-4 ${
              jIdx <= journeyIndex ? "text-gray-800" : "text-gray-400"
            }`}>
              {journey.name}
            </div>

            {/* Journey steps */}
            {journey.steps.length > 0 && (
              <div className="ml-6 space-y-2">
                {journey.steps.map((step, sIdx) => {
                  const isActive = jIdx === journeyIndex && sIdx === stepIndex;
                  const isComplete = jIdx < journeyIndex || (jIdx === journeyIndex && sIdx < stepIndex);
                  
                  return (
                    <div key={sIdx} className={`flex items-start p-3 rounded-md transition-all ${
                      isActive ? "bg-white shadow-md border-l-4 border-blue-600" : 
                      isComplete ? "bg-white shadow-sm" : "bg-gray-100"
                    }`}>
                      <div className="mr-3 mt-0.5 flex-shrink-0">
                        {step.type === "systems_integration" ? (
                          <div className={`p-1.5 rounded ${
                            isComplete ? "bg-green-100" : 
                            isActive ? "bg-blue-100" : "bg-gray-200"
                          }`}>
                            <DocumentMagnifyingGlassIcon className={`w-4 h-4 ${
                              isComplete ? "text-green-600" : 
                              isActive ? "text-blue-600" : "text-gray-500"
                            }`} />
                          </div>
                        ) : (
                          <div className={`p-1.5 rounded ${
                            isComplete ? "bg-green-100" : 
                            isActive ? "bg-blue-100" : "bg-gray-200"
                          }`}>
                            <BookOpenIcon className={`w-4 h-4 ${
                              isComplete ? "text-green-600" : 
                              isActive ? "text-blue-600" : "text-gray-500"
                            }`} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-medium ${
                          isComplete ? "text-gray-600" : 
                          isActive ? "text-gray-600" : "text-gray-400"
                        }`}>
                          {step.type === "systems_integration" ? "Systems integration" : "Knowledge Engine"}
                        </div>
                        <div className={`text-base font-semibold mt-0.5 ${
                          isComplete || isActive ? "text-gray-800" : "text-gray-500"
                        }`}>
                          {step.name}
                        </div>
                      </div>
                      {isActive && (
                        <div className="ml-2 flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        </div>
                      )}
                      {isComplete && (
                        <div className="ml-2 flex items-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Connector line */}
            {jIdx < journeys.length - 1 && (
              <div className="absolute left-2.5 top-14 bottom-0 w-0.5 bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceJourney; 