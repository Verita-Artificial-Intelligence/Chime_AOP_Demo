# PDF Workflow Extractor

A Python script that extracts workflow steps from PDF documentation using OpenAI's API and outputs them in a structured JSON format suitable for automated execution.

## Features

- **PDF Text Extraction**: Uses both `pdfplumber` and `PyPDF2` for robust text extraction
- **AI-Powered Analysis**: Leverages OpenAI's GPT-o3 model with structured output
- **Comprehensive Schema**: Extracts detailed workflow information including:
  - Step sequences and dependencies
  - Input/output specifications
  - Action types and conditions
  - Integration points and tools required
  - Error handling and validation rules
- **Structured JSON Output**: Produces well-formatted JSON ready for automation systems

## Installation

1. Install required dependencies:
```bash
pip install -r requirements.txt
```

2. Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

## Usage

### Basic Usage
```bash
python pdf_workflow_extractor.py documentation.pdf
```

### With Options
```bash
# Specify output file
python pdf_workflow_extractor.py documentation.pdf -o my_workflow.json

# Print summary after extraction
python pdf_workflow_extractor.py documentation.pdf -s
```

### Command Line Arguments

- `pdf_path`: Path to the PDF documentation file (required)
- `-o, --output`: Output JSON file path (default: `{input_name}_workflow.json`)
- `-s, --summary`: Print a summary of the extracted workflow

## Output Schema

The script produces a JSON file with the following structure:

```json
{
  "workflow_name": "Automated Invoice Processing",
  "workflow_description": "End-to-end automation of invoice processing from receipt to payment",
  "workflow_category": "Finance",
  "total_steps": 8,
  "workflow_type": "sequential",
  "steps": [
    {
      "step_number": 1,
      "name": "Receive Invoice",
      "description": "Capture incoming invoices from multiple channels including email, portal uploads, and API submissions",
      "action_type": "data_processing",
      "inputs": ["Email attachment", "Portal upload", "API payload"],
      "outputs": ["Raw invoice data", "Source metadata"],
      "dependencies": [],
      "conditions": ["Valid file format (PDF, XML, EDI)"],
      "tools_required": ["Email gateway", "File upload service", "API endpoint"],
      "estimated_duration": "1-2 minutes",
      "error_handling": "Reject invalid formats, notify sender",
      "validation_rules": ["File size < 10MB", "Supported format check"]
    },
    {
      "step_number": 2,
      "name": "Extract Invoice Data",
      "description": "Use OCR and AI to extract key invoice fields including vendor, amount, line items, and dates",
      "action_type": "automated",
      "inputs": ["Raw invoice data"],
      "outputs": ["Structured invoice object", "Confidence scores"],
      "dependencies": [1],
      "conditions": ["OCR confidence > 85%"],
      "tools_required": ["OCR engine", "AI extraction model"],
      "estimated_duration": "30 seconds",
      "error_handling": "Manual review queue for low confidence",
      "validation_rules": ["Required fields present", "Data type validation"]
    }
    // ... more steps
  ],
  "data_sources": [
    "Invoice Management System",
    "Vendor Database",
    "Purchase Order System",
    "Accounting Software"
  ],
  "integration_points": [
    "Email Gateway API",
    "OCR Service",
    "ERP System",
    "Payment Gateway"
  ],
  "success_criteria": [
    "Invoice data extracted with >95% accuracy",
    "Payment scheduled within SLA",
    "Audit trail complete"
  ],
  "rollback_strategy": "Reverse payment instructions, restore original invoice status, notify stakeholders"
}
```

## Schema Field Descriptions

### Top-Level Fields

- **workflow_name**: Clear, descriptive name for the workflow
- **workflow_description**: High-level purpose and scope
- **workflow_category**: One of: Finance, HR, Operations, IT, Customer Service, Supply Chain, General
- **total_steps**: Number of steps in the workflow
- **workflow_type**: sequential, parallel, conditional, or hybrid
- **data_sources**: All systems/databases used
- **integration_points**: External APIs and services
- **success_criteria**: Measurable outcomes for success
- **rollback_strategy**: How to handle failures

### Step Fields

- **step_number**: Sequential position in workflow
- **name**: Concise step identifier
- **description**: Detailed explanation of the step
- **action_type**: Type of action (manual, automated, decision, data_processing, integration, notification)
- **inputs**: Required data/artifacts from previous steps
- **outputs**: Data/artifacts produced
- **dependencies**: Array of step numbers that must complete first
- **conditions**: Prerequisites for execution (optional)
- **tools_required**: Systems, APIs, or tools needed (optional)
- **estimated_duration**: Time estimate (optional)
- **error_handling**: Error recovery strategy (optional)
- **validation_rules**: Data validation criteria (optional)

## Example Workflow Extraction

For a PDF containing an employee onboarding process:

```bash
python pdf_workflow_extractor.py employee_onboarding.pdf -s
```

Output:
```
Extracting text from PDF: employee_onboarding.pdf
Extracted 12543 characters from PDF
Sending to OpenAI for workflow extraction...
Workflow saved to: employee_onboarding_workflow.json

==================================================
WORKFLOW EXTRACTION SUMMARY
==================================================
Workflow Name: Employee Onboarding Process
Category: HR
Type: sequential
Total Steps: 12

Data Sources (5):
  - HR Information System
  - Active Directory
  - Payroll System
  - Learning Management System
  - Asset Management Database

Integration Points (4):
  - Email Service API
  - Badge System API
  - IT Provisioning API
  - Benefits Portal API

Workflow Steps:

  Step 1: Receive New Hire Information
    Type: data_processing
    Description: Capture new employee details from HR system including personal information, role, departmen...

  Step 2: Create Employee Accounts
    Type: automated
    Description: Automatically create user accounts in Active Directory, email system, and relevant applicat...
    Dependencies: [1]

...
```

## Best Practices

1. **PDF Quality**: Ensure PDFs are text-based or have good quality for OCR
2. **Token Limits**: For very large PDFs, the script truncates at 15,000 characters. Adjust in code if needed
3. **API Costs**: Be aware of OpenAI API usage costs, especially for large documents
4. **Validation**: Review the extracted JSON for accuracy before using in production
5. **Error Handling**: The script includes fallback extraction methods and error reporting

## Troubleshooting

### Common Issues

1. **"No text could be extracted from the PDF"**
   - PDF might be image-only or corrupted
   - Try converting to text-based PDF first

2. **Token limit errors**
   - Reduce the PDF text limit in `create_user_prompt()`
   - Split large PDFs into sections

3. **JSON parsing errors**
   - Check OpenAI API response format
   - Ensure structured output schema is valid

## Future Enhancements

- Batch processing for multiple PDFs
- Custom schema definitions
- Integration with workflow automation platforms
- Support for complex workflow diagrams
- Multi-language PDF support 