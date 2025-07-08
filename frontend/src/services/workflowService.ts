// Workflow Service for triggering and managing workflow execution

export interface WorkflowStep {
  step: number;
  action: string;
  heading: string;
  element_type: string;
  element_description: string;
  url?: string;
}

export interface WorkflowExecutionState {
  workflowId: string;
  steps: WorkflowStep[];
  currentStep: number;
  completedSteps: Set<number>;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastUpdateTime: number;
  isInFallbackMode: boolean;
}

// Backend webhook endpoint
const WORKFLOW_TRIGGER_ENDPOINT = 'http://143.198.111.85:5678/webhook/mock-workflow';

// Sample workflow steps for demonstration
export const SAMPLE_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    action: "read",
    heading: "Read input business list",
    element_type: "file",
    element_description: "Read the provided list of businesses for audit",
    url: "https://my-json-server.typicode.com/typicode/demo/comments"
  },
  {
    step: 2,
    action: "validate",
    heading: "Validate business data",
    element_type: "validation",
    element_description: "Check business data completeness and format"
  },
  {
    step: 3,
    action: "analyze",
    heading: "Analyze compliance status",
    element_type: "analysis",
    element_description: "Review compliance requirements for each business"
  },
  {
    step: 4,
    action: "fetch",
    heading: "Fetch regulatory data",
    element_type: "api",
    element_description: "Retrieve latest regulatory requirements",
    url: "https://api.example.com/regulations"
  },
  {
    step: 5,
    action: "compare",
    heading: "Compare against standards",
    element_type: "comparison",
    element_description: "Match business practices with regulatory standards"
  },
  {
    step: 6,
    action: "generate",
    heading: "Generate compliance report",
    element_type: "report",
    element_description: "Create detailed compliance assessment report"
  },
  {
    step: 7,
    action: "review",
    heading: "AI review and recommendations",
    element_type: "ai",
    element_description: "Generate AI-powered recommendations for compliance"
  },
  {
    step: 8,
    action: "notify",
    heading: "Send notifications",
    element_type: "notification",
    element_description: "Notify relevant stakeholders of audit results"
  }
];

export class WorkflowService {
  /**
   * Trigger a workflow execution by sending steps to the backend
   */
  static async triggerWorkflow(steps: WorkflowStep[]): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(WORKFLOW_TRIGGER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(steps),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Initialize a new workflow execution state
   */
  static createExecutionState(workflowId: string, steps: WorkflowStep[]): WorkflowExecutionState {
    return {
      workflowId,
      steps,
      currentStep: 0,
      completedSteps: new Set<number>(),
      status: 'idle',
      lastUpdateTime: Date.now(),
      isInFallbackMode: false,
    };
  }

  /**
   * Update execution state with completed step
   */
  static updateStepCompletion(
    state: WorkflowExecutionState, 
    stepNumber: number
  ): WorkflowExecutionState {
    const newCompletedSteps = new Set(state.completedSteps);
    newCompletedSteps.add(stepNumber);

    const allStepsCompleted = state.steps.every(step => 
      newCompletedSteps.has(step.step)
    );

    return {
      ...state,
      completedSteps: newCompletedSteps,
      currentStep: Math.max(state.currentStep, stepNumber),
      status: allStepsCompleted ? 'completed' : 'running',
      lastUpdateTime: Date.now(),
      isInFallbackMode: false,
    };
  }

  /**
   * Get the next uncompleted step
   */
  static getNextStep(state: WorkflowExecutionState): WorkflowStep | null {
    return state.steps.find(step => !state.completedSteps.has(step.step)) || null;
  }

  /**
   * Check if fallback mode should be activated (5+ seconds without update)
   */
  static shouldActivateFallback(state: WorkflowExecutionState): boolean {
    const timeSinceLastUpdate = Date.now() - state.lastUpdateTime;
    return state.status === 'running' && timeSinceLastUpdate > 5000;
  }
}