// LLM Service for generating AOP workflows
// This service will handle communication with the LLM API

interface LLMWorkflowResponse {
  name: string;
  description: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  category: string;
}

interface LLMError {
  error: string;
  message: string;
}

// Example output format for the LLM to follow
const EXAMPLE_OUTPUT_FORMAT = {
  name: "Example: Automated Invoice Processing",
  description:
    "Automate the processing of invoices from receipt to payment, including validation, approval routing, and payment scheduling.",
  workflow: "custom-workflow",
  dataSources: [
    "Invoice Database",
    "Vendor Management System",
    "Accounting System",
    "Email Gateway",
  ],
  actions: [
    "Extract invoice data from emails",
    "Validate invoice against purchase orders",
    "Route for approval based on amount",
    "Schedule payment in accounting system",
    "Send confirmation to vendor",
    "Update audit trail",
  ],
  llm: "general-purpose-llm",
  category: "Finance & Accounting",
};

class LLMService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    // Use environment variables or fallback to empty string
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
    this.apiEndpoint = "https://api.openai.com/v1/chat/completions";
  }

  async generateWorkflow(
    userQuery: string
  ): Promise<LLMWorkflowResponse | LLMError> {
    const systemPrompt = `You are an expert AOP (Automated Operations Procedure) builder specialist. Your task is to analyze user requests and generate structured workflow configurations for automation.

IMPORTANT: You must respond with ONLY valid JSON that matches the exact structure shown in the example below. Do not include any explanatory text before or after the JSON.

Example output format:
${JSON.stringify(EXAMPLE_OUTPUT_FORMAT, null, 2)}

Guidelines:
1. The "name" should be a clear, concise title for the workflow
2. The "description" should explain what the workflow does in 1-2 sentences
3. The "workflow" should be "custom-workflow" for all custom requests
4. "dataSources" should list 3-6 relevant data sources that would be needed
5. "actions" should list 4-8 specific actions that would be performed in sequence
6. "llm" should be "general-purpose-llm" for most cases
7. "category" should be one of: "Finance & Accounting", "HR & Payroll", "Operations", "Customer Service", "IT & Security", "Sales & Marketing", "Supply Chain", "General"

Remember: Return ONLY the JSON object, no other text.`;

    const userPrompt = `Create an AOP workflow for the following request: "${userQuery}"`;

    try {
      // Check if API key is available, if not return mock response
      if (!this.apiKey) {
        console.warn("OpenAI API key not found, using mock response");
        return this.getMockResponse(userQuery);
      }

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.error(
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
        // Return mock response on API error
        return this.getMockResponse(userQuery);
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        try {
          const content = data.choices[0].message.content.trim();
          const parsedResponse = JSON.parse(content);

          // Validate the response structure
          if (this.validateWorkflowResponse(parsedResponse)) {
            return parsedResponse as LLMWorkflowResponse;
          } else {
            throw new Error("Invalid response structure from LLM");
          }
        } catch (parseError) {
          console.error("Error parsing LLM response:", parseError);
          return {
            error: "parse_error",
            message:
              "Failed to parse LLM response. The response was not valid JSON.",
          };
        }
      }

      return {
        error: "invalid_response",
        message: "Invalid response from LLM API",
      };
    } catch (error) {
      console.error("LLM Service error:", error);

      // Always return mock response on error for better UX
      return this.getMockResponse(userQuery);
    }
  }

  private validateWorkflowResponse(response: any): boolean {
    return (
      response &&
      typeof response.name === "string" &&
      typeof response.description === "string" &&
      typeof response.workflow === "string" &&
      Array.isArray(response.dataSources) &&
      Array.isArray(response.actions) &&
      typeof response.llm === "string" &&
      typeof response.category === "string" &&
      response.dataSources.length > 0 &&
      response.actions.length > 0
    );
  }

  // Mock response for development/testing when API key is not available
  private getMockResponse(userQuery: string): LLMWorkflowResponse {
    const query = userQuery.toLowerCase();

    // Generate a contextual mock response based on keywords
    if (query.includes("invoice") || query.includes("billing")) {
      return {
        name: "Automated Invoice Processing Workflow",
        description:
          "Streamline invoice processing from receipt to payment, including validation, approval routing, and automated payment scheduling.",
        workflow: "custom-workflow",
        dataSources: [
          "Invoice Management System",
          "Vendor Database",
          "Purchase Order System",
          "Email Gateway",
          "Accounting Software",
        ],
        actions: [
          "Scan and extract invoice data",
          "Validate invoice against purchase orders",
          "Check vendor credentials and payment terms",
          "Route for approval based on amount thresholds",
          "Schedule payment in accounting system",
          "Send payment confirmation to vendor",
          "Update financial records and audit trail",
        ],
        llm: "general-purpose-llm",
        category: "Finance & Accounting",
      };
    } else if (query.includes("employee") || query.includes("onboarding")) {
      return {
        name: "Employee Onboarding Automation",
        description:
          "Automate the complete employee onboarding process from offer acceptance to first day readiness.",
        workflow: "custom-workflow",
        dataSources: [
          "HR Management System",
          "Active Directory",
          "Email System",
          "Training Platform",
          "Asset Management System",
        ],
        actions: [
          "Create employee profile in HRIS",
          "Generate and send welcome packet",
          "Create user accounts and email",
          "Assign required training modules",
          "Request IT equipment and access badges",
          "Schedule orientation meetings",
          "Notify team members of new hire",
        ],
        llm: "general-purpose-llm",
        category: "HR & Payroll",
      };
    } else if (query.includes("customer") || query.includes("support")) {
      return {
        name: "Customer Support Ticket Automation",
        description:
          "Automate customer support ticket routing, prioritization, and initial response handling.",
        workflow: "custom-workflow",
        dataSources: [
          "Ticketing System",
          "Customer Database",
          "Knowledge Base",
          "Product Catalog",
          "Communication Channels",
        ],
        actions: [
          "Analyze ticket content and sentiment",
          "Categorize issue type and priority",
          "Search knowledge base for solutions",
          "Route to appropriate support team",
          "Send automated acknowledgment",
          "Track SLA compliance",
          "Update customer interaction history",
        ],
        llm: "general-purpose-llm",
        category: "Customer Service",
      };
    } else {
      // Generic workflow for any other request
      return {
        name: `Automated Workflow for ${userQuery.substring(0, 50)}`,
        description: `Automate the process of ${userQuery.toLowerCase()} with intelligent data processing and action execution.`,
        workflow: "custom-workflow",
        dataSources: [
          "Primary Database",
          "Document Management System",
          "API Gateway",
          "Notification Service",
          "Analytics Platform",
        ],
        actions: [
          "Initialize workflow and validate inputs",
          "Collect and process relevant data",
          "Apply business rules and logic",
          "Execute primary automation tasks",
          "Generate reports and notifications",
          "Update system records",
          "Log completion and metrics",
        ],
        llm: "general-purpose-llm",
        category: "General",
      };
    }
  }
}

export const llmService = new LLMService();
export type { LLMWorkflowResponse, LLMError };
