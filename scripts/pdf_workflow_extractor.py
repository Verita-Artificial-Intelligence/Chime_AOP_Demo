#!/usr/bin/env python3
"""
PDF Workflow Extractor
This script extracts workflow steps from PDF documentation using OpenAI's API
and outputs them in a structured JSON format suitable for automated execution.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import pdfplumber

# PDF processing libraries
import PyPDF2

# OpenAI API
from openai import OpenAI
from pydantic import BaseModel, Field


class WorkflowStep(BaseModel):
    """Schema for individual workflow step"""

    step_number: int = Field(
        description="Sequential number of this step in the workflow"
    )
    name: str = Field(description="Clear, concise name for the step")
    description: str = Field(description="Detailed description of what this step does")
    action_type: str = Field(
        description="Type of action: 'manual', 'automated', 'decision', 'data_processing', 'integration', 'notification'"
    )
    inputs: List[str] = Field(description="List of required inputs for this step")
    outputs: List[str] = Field(description="List of outputs produced by this step")
    dependencies: List[int] = Field(
        description="List of step numbers that must complete before this step"
    )
    conditions: Optional[List[str]] = Field(
        default=None, description="Conditions that must be met for this step to execute"
    )
    tools_required: Optional[List[str]] = Field(
        default=None, description="Tools, systems, or APIs required for this step"
    )
    estimated_duration: Optional[str] = Field(
        default=None, description="Estimated time to complete this step"
    )
    error_handling: Optional[str] = Field(
        default=None, description="How errors should be handled in this step"
    )
    validation_rules: Optional[List[str]] = Field(
        default=None, description="Validation rules to ensure step completion"
    )


class WorkflowExtraction(BaseModel):
    """Schema for complete workflow extraction"""

    workflow_name: str = Field(description="Name of the overall workflow")
    workflow_description: str = Field(
        description="High-level description of the workflow purpose"
    )
    workflow_category: str = Field(
        description="Category: 'Finance', 'HR', 'Operations', 'IT', 'Customer Service', 'Supply Chain', 'General'"
    )
    total_steps: int = Field(description="Total number of steps in the workflow")
    workflow_type: str = Field(
        description="Type: 'sequential', 'parallel', 'conditional', 'hybrid'"
    )
    steps: List[WorkflowStep] = Field(description="List of all workflow steps")
    data_sources: List[str] = Field(description="All data sources used in the workflow")
    integration_points: List[str] = Field(
        description="External systems or APIs integrated in the workflow"
    )
    success_criteria: List[str] = Field(
        description="Criteria for successful workflow completion"
    )
    rollback_strategy: Optional[str] = Field(
        default=None, description="Strategy for rolling back if workflow fails"
    )


class PDFWorkflowExtractor:
    def __init__(self, api_key: str):
        """Initialize the extractor with OpenAI API key"""
        self.client = OpenAI(api_key=api_key)

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF using multiple methods for robustness"""
        text = ""

        # Try pdfplumber first (better for complex layouts)
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"Warning: pdfplumber extraction failed: {e}")

        # Fallback to PyPDF2 if pdfplumber fails or returns empty
        if not text.strip():
            try:
                with open(pdf_path, "rb") as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page_num in range(len(pdf_reader.pages)):
                        page = pdf_reader.pages[page_num]
                        text += page.extract_text() + "\n\n"
            except Exception as e:
                print(f"Error: PyPDF2 extraction also failed: {e}")
                raise

        if not text.strip():
            raise ValueError("No text could be extracted from the PDF")

        return text

    def create_system_prompt(self) -> str:
        """Create the system prompt for workflow extraction"""
        return """You are an expert workflow analyst specializing in extracting structured workflow information from documentation. Your task is to analyze PDF documentation and extract detailed workflow steps in a format suitable for automated execution.

When analyzing workflows:
1. Identify each distinct step in the process
2. Understand the relationships and dependencies between steps
3. Determine what inputs each step needs and what outputs it produces
4. Classify the type of action (manual, automated, decision, etc.)
5. Identify any tools, systems, or integrations required
6. Note any conditions, validations, or error handling mentioned

Guidelines for extraction:
- Step numbers should be sequential and reflect the order of execution
- Dependencies should reference other step numbers
- Be specific about inputs and outputs - these will be used for automation
- Include all mentioned tools, systems, or APIs in tools_required
- Extract any timing information for estimated_duration
- Capture validation rules and error handling strategies when mentioned
- Ensure data_sources and integration_points cover all systems mentioned

Focus on creating actionable, executable workflow definitions that can be used by automation systems."""

    def create_user_prompt(self, pdf_text: str) -> str:
        """Create the user prompt with the PDF content"""
        return f"""Please analyze the following documentation and extract all workflow steps in a structured format suitable for automation:

<documentation>
{pdf_text[:15000]}  # Limit to avoid token limits, adjust as needed
</documentation>

Extract every workflow step mentioned in the documentation, ensuring each step has all the necessary information for automated execution. Pay special attention to:
- The sequence and dependencies between steps
- Required inputs and expected outputs
- Any conditions or decision points
- Integration points with external systems
- Error handling and validation rules

Return a comprehensive workflow extraction with all steps properly structured."""

    def extract_workflow(self, pdf_path: str) -> Dict[str, Any]:
        """Main method to extract workflow from PDF"""
        print(f"Extracting text from PDF: {pdf_path}")
        pdf_text = self.extract_text_from_pdf(pdf_path)

        print(f"Extracted {len(pdf_text)} characters from PDF")
        print("Sending to OpenAI for workflow extraction...")

        system_prompt = self.create_system_prompt()
        user_prompt = self.create_user_prompt(pdf_text)

        try:
            # Using the new structured output format
            response = self.client.chat.completions.create(
                model="o3-2025-04-16",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "workflow_extraction",
                        "schema": WorkflowExtraction.model_json_schema(),
                        "strict": True,
                    },
                },
                temperature=0.2,  # Lower temperature for more consistent extraction
            )

            # Parse the response
            content = response.choices[0].message.content
            workflow_data = json.loads(content)

            # Validate using Pydantic
            validated_workflow = WorkflowExtraction(**workflow_data)

            return validated_workflow.model_dump()

        except Exception as e:
            print(f"Error during OpenAI API call: {e}")
            raise

    def save_results(self, workflow_data: Dict[str, Any], output_path: str):
        """Save the extracted workflow to a JSON file"""
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(workflow_data, f, indent=2, ensure_ascii=False)
        print(f"Workflow saved to: {output_path}")

    def print_summary(self, workflow_data: Dict[str, Any]):
        """Print a summary of the extracted workflow"""
        print("\n" + "=" * 50)
        print("WORKFLOW EXTRACTION SUMMARY")
        print("=" * 50)
        print(f"Workflow Name: {workflow_data['workflow_name']}")
        print(f"Category: {workflow_data['workflow_category']}")
        print(f"Type: {workflow_data['workflow_type']}")
        print(f"Total Steps: {workflow_data['total_steps']}")
        print(f"\nData Sources ({len(workflow_data['data_sources'])}):")
        for ds in workflow_data["data_sources"]:
            print(f"  - {ds}")
        print(f"\nIntegration Points ({len(workflow_data['integration_points'])}):")
        for ip in workflow_data["integration_points"]:
            print(f"  - {ip}")
        print("\nWorkflow Steps:")
        for step in workflow_data["steps"]:
            print(f"\n  Step {step['step_number']}: {step['name']}")
            print(f"    Type: {step['action_type']}")
            print(f"    Description: {step['description'][:100]}...")
            if step["dependencies"]:
                print(f"    Dependencies: {step['dependencies']}")


def main():
    parser = argparse.ArgumentParser(
        description="Extract workflow steps from PDF documentation using OpenAI"
    )
    parser.add_argument("pdf_path", type=str, help="Path to the PDF documentation file")
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        default=None,
        help="Output JSON file path (default: input_workflow.json)",
    )
    parser.add_argument(
        "-s",
        "--summary",
        action="store_true",
        help="Print a summary of the extracted workflow",
    )

    args = parser.parse_args()

    # Get API key
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OpenAI API key is required.")
        sys.exit(1)

    # Check if PDF exists
    if not os.path.exists(args.pdf_path):
        print(f"Error: PDF file not found: {args.pdf_path}")
        sys.exit(1)

    # Set output path
    if args.output:
        output_path = args.output
    else:
        pdf_name = Path(args.pdf_path).stem
        output_path = f"{pdf_name}_workflow.json"

    # Extract workflow
    try:
        extractor = PDFWorkflowExtractor(api_key)
        workflow_data = extractor.extract_workflow(args.pdf_path)

        # Save results
        extractor.save_results(workflow_data, output_path)

        # Print summary if requested
        if args.summary:
            extractor.print_summary(workflow_data)

        print(
            f"\nExtraction complete! Check {output_path} for the full workflow definition."
        )

    except Exception as e:
        print(f"Error during extraction: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
