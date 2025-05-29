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

interface UploadedFile {
  id: string;
  file: File;
  type: "image" | "video";
  url: string;
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

  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async generateWorkflowWithVisuals(
    userQuery: string,
    files: UploadedFile[]
  ): Promise<LLMWorkflowResponse | LLMError> {
    const systemPrompt = `You are an expert AOP (Automated Operations Procedure) builder specialist. Your task is to analyze user requests along with any provided images or videos to generate structured workflow configurations for automation.

IMPORTANT: You must respond with ONLY valid JSON that matches the exact structure shown in the example below. Do not include any explanatory text before or after the JSON.

When analyzing images or videos:
1. Look for UI elements, forms, screens, workflows, or processes shown
2. Identify tools, systems, or applications visible
3. Extract any text, labels, or data fields shown
4. Understand the sequence of steps or actions demonstrated
5. Map visual elements to appropriate data sources and actions

Example output format:
${JSON.stringify(EXAMPLE_OUTPUT_FORMAT, null, 2)}

Guidelines:
1. The "name" should be a clear, concise title for the workflow based on what you see
2. The "description" should explain what the workflow does, referencing visual elements if applicable
3. The "workflow" should be "custom-workflow" for all custom requests
4. "dataSources" should list 3-6 relevant data sources, including any systems shown in the visuals
5. "actions" should list 4-8 specific actions that would be performed, matching the steps shown in images/videos
6. "llm" should be "general-purpose-llm" for most cases, or "vision-llm" if visual analysis is critical
7. "category" should be one of: "Finance & Accounting", "HR & Payroll", "Operations", "Customer Service", "IT & Security", "Sales & Marketing", "Supply Chain", "General"

Remember: Return ONLY the JSON object, no other text.`;

    const userPrompt =
      userQuery ||
      "Analyze the provided images/videos and create an appropriate AOP workflow based on what you see.";

    try {
      // Check if API key is available
      if (!this.apiKey) {
        console.warn("OpenAI API key not found, using mock response");
        return this.getVisualMockResponse(userQuery, files.length > 0);
      }

      // Prepare message content with images
      const messageContent: any[] = [{ type: "text", text: userPrompt }];

      // Add images to the message
      for (const file of files) {
        if (file.type === "image") {
          try {
            const base64Data = await this.fileToBase64(file.file);
            messageContent.push({
              type: "image_url",
              image_url: {
                url: `data:${file.file.type};base64,${base64Data}`,
                detail: "high", // Use high detail for better analysis
              },
            });
          } catch (error) {
            console.error(`Error processing image ${file.file.name}:`, error);
          }
        } else if (file.type === "video") {
          // For videos, we'll add a note that video analysis isn't directly supported
          messageContent.push({
            type: "text",
            text: `[Note: Video file "${file.file.name}" was provided. Please base the workflow on the description and any video context provided in the text.]`,
          });
        }
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
            { role: "user", content: messageContent },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.error(
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
        // Return visual mock response on API error
        return this.getVisualMockResponse(userQuery, files.length > 0);
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
      // Return visual mock response on error
      return this.getVisualMockResponse(userQuery, files.length > 0);
    }
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

  // Mock response for visual inputs
  private getVisualMockResponse(
    userQuery: string,
    hasVisuals: boolean
  ): LLMWorkflowResponse {
    if (hasVisuals) {
      return {
        name: "Visual Process Automation Workflow",
        description:
          "Automate the process captured in the uploaded visuals, extracting key steps and mapping them to automated actions.",
        workflow: "custom-workflow",
        dataSources: [
          "Visual Recognition System",
          "Process Database",
          "UI Automation Platform",
          "Document Management System",
          "Workflow Engine",
        ],
        actions: [
          "Analyze visual content for UI elements and workflows",
          "Extract text and data fields from images",
          "Map visual steps to automation sequences",
          "Configure UI automation for identified screens",
          "Set up data extraction and validation rules",
          "Create automated workflow based on visual process",
          "Generate documentation from visual analysis",
        ],
        llm: "vision-llm",
        category: "Operations",
      };
    }

    // Fall back to the existing mock response logic
    return this.getMockResponse(userQuery);
  }
}

export const llmService = new LLMService();
export type { LLMWorkflowResponse, LLMError };
