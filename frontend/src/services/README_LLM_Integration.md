# LLM Integration for Workflow Builder

## Overview
The Workflow Builder now supports dynamic workflow generation using Large Language Models (LLMs). When users input requests that don't match the predefined "fraud" or "compliance" keywords, the system will use an LLM to generate a custom workflow.

## Setup

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```bash
# OpenAI API Key (provided by Rishi)
REACT_APP_LLM_API_KEY=your_openai_api_key_here

# Optional: Custom LLM endpoint (defaults to OpenAI)
REACT_APP_LLM_API_ENDPOINT=https://api.openai.com/v1/chat/completions
```

### 2. How It Works

1. **User Input Processing**: When a user types in the chat builder:
   - If the input contains "fraud" → Uses predefined fraud workflow
   - If the input contains "compliance" → Uses predefined compliance workflow
   - Otherwise → Calls LLM to generate a custom workflow

2. **LLM Prompt Structure**: The system sends a carefully crafted prompt to the LLM that includes:
   - System role as a "workflow builder specialist"
   - Example output format (JSON structure)
   - User's raw query
   - Guidelines for generating appropriate workflows

3. **Response Processing**: The LLM returns a structured JSON response containing:
   - Workflow name and description
   - Required data sources
   - Sequential actions to perform
   - Appropriate LLM model selection
   - Category classification

4. **Fallback Mechanism**: If the LLM API fails or returns invalid data:
   - The system provides contextual mock responses based on keywords
   - Generic workflows are generated for unrecognized requests
   - Error messages guide users to be more specific

## Example Workflows

### Invoice Processing (Mock Response)
```json
{
  "name": "Automated Invoice Processing Workflow",
  "description": "Streamline invoice processing from receipt to payment...",
  "workflow": "custom-workflow",
  "dataSources": [
    "Invoice Management System",
    "Vendor Database",
    "Purchase Order System",
    "Email Gateway",
    "Accounting Software"
  ],
  "actions": [
    "Scan and extract invoice data",
    "Validate invoice against purchase orders",
    "Check vendor credentials and payment terms",
    "Route for approval based on amount thresholds",
    "Schedule payment in accounting system",
    "Send payment confirmation to vendor",
    "Update financial records and audit trail"
  ],
  "llm": "general-purpose-llm",
  "category": "Finance & Accounting"
}
```

### Employee Onboarding (Mock Response)
```json
{
  "name": "Employee Onboarding Automation",
  "description": "Automate the complete employee onboarding process...",
  "workflow": "custom-workflow",
  "dataSources": [
    "HR Management System",
    "Active Directory",
    "Email System",
    "Training Platform",
    "Asset Management System"
  ],
  "actions": [
    "Create employee profile in HRIS",
    "Generate and send welcome packet",
    "Create user accounts and email",
    "Assign required training modules",
    "Request IT equipment and access badges",
    "Schedule orientation meetings",
    "Notify team members of new hire"
  ],
  "llm": "general-purpose-llm",
  "category": "HR & Payroll"
}
```

## Testing Without API Key

The system includes comprehensive mock responses for development and testing:
- Invoice/billing related queries
- Employee/onboarding related queries
- Customer support related queries
- Generic workflows for other requests

To test without an API key, simply leave `REACT_APP_LLM_API_KEY` empty or undefined.

## Data Flow

1. User enters custom request in chat
2. System calls `llmService.generateWorkflow(userQuery)`
3. LLM generates structured workflow or returns mock data
4. Workflow is displayed in chat with step-by-step building animation
5. User can save and run the generated workflow
6. Completed runs are saved to localStorage with full history

## Error Handling

- **Invalid API Key**: Falls back to mock responses
- **Network Errors**: Displays user-friendly error messages
- **Invalid LLM Response**: Attempts to use fallback workflow
- **Parsing Errors**: Logs errors and provides generic workflow

## Future Enhancements

1. **Caching**: Cache LLM responses for similar queries
2. **Fine-tuning**: Train custom models for specific industries
3. **Multi-language**: Support for non-English queries
4. **Workflow Templates**: Save and share custom workflows
5. **Advanced Validation**: More sophisticated workflow validation 

## Integration Details

### System Prompt
- System role as a "workflow builder specialist" 