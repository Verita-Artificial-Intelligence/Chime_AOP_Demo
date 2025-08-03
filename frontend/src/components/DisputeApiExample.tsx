import React, { useState } from "react";
import { DisputeApiService } from "../services/disputeApiService";
import { notificationService } from "../services/notificationService";

/**
 * Example component demonstrating proper usage of the DisputeApiService
 * This component shows how to use all the API endpoints according to the contract
 */
export const DisputeApiExample: React.FC = () => {
  const [workflowRunId, setWorkflowRunId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Example: Upload SOP File
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.uploadSOP(file),
      "Upload SOP"
    );

    if (result.success) {
      const response = result.data;
      setWorkflowRunId(response.workflowRunId);
      
      notificationService.successWithAction(
        "File Uploaded Successfully!",
        `Dispute Code: ${response.disputeCode}, Run ID: ${response.workflowRunId}`,
        "View Status",
        () => handleGetStatus(response.workflowRunId)
      );
    } else {
      notificationService.error("Upload Failed", result.error);
    }
    
    setIsLoading(false);
  };

  // Example: Get Workflow Status
  const handleGetStatus = async (runId: string) => {
    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.getWorkflowStatus(runId),
      "Get Workflow Status"
    );

    if (result.success) {
      const status = result.data;
      console.log("Workflow Status:", status);
      
      const completedSteps = status.workflowDtoStatus.filter(s => s.status === 'completed').length;
      const totalSteps = status.workflowDtoStatus.length;
      
      notificationService.info(
        "Workflow Status",
        `Action: ${status.action}, Progress: ${completedSteps}/${totalSteps} steps completed`
      );
    } else {
      notificationService.error("Status Check Failed", result.error);
    }
  };

  // Example: Execute Workflow Action
  const handleWorkflowAction = async (action: 'start' | 'pause' | 'resume', runId: string) => {
    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.executeWorkflowAction(action, runId),
      `Workflow ${action}`
    );

    if (result.success) {
      const response = result.data;
      notificationService.success(
        `Workflow ${action.charAt(0).toUpperCase() + action.slice(1)}ed`,
        response.message
      );
      
      // Refresh status after action
      setTimeout(() => handleGetStatus(runId), 1000);
    } else {
      notificationService.error(`${action} Failed`, result.error);
    }
  };

  // Example: Send Email
  const handleSendEmail = async () => {
    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.sendEmail(
        "example@test.com",
        "Dispute Update",
        "Your dispute has been processed successfully."
      ),
      "Send Email"
    );

    if (result.success) {
      notificationService.success("Email Sent", result.data.message);
    } else {
      notificationService.error("Email Failed", result.error);
    }
  };

  // Example: Send Slack Message
  const handleSendSlack = async () => {
    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.sendSlackMessage("Test message from dispute automation system"),
      "Send Slack Message"
    );

    if (result.success) {
      notificationService.success("Slack Message Sent", result.data.message);
    } else {
      notificationService.error("Slack Failed", result.error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6">
      <h3 className="text-lg font-semibold text-brand-heading mb-4">
        Dispute API Service Examples
      </h3>
      
      <div className="space-y-4">
        {/* File Upload Example */}
        <div>
          <h4 className="font-medium text-brand-heading mb-2">1. Upload SOP File</h4>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primaryDark"
          />
        </div>

        {/* Workflow Controls */}
        {workflowRunId && (
          <div>
            <h4 className="font-medium text-brand-heading mb-2">2. Workflow Controls</h4>
            <p className="text-sm text-brand-muted mb-2">Run ID: {workflowRunId}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleWorkflowAction('start', workflowRunId)}
                disabled={isLoading}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={() => handleWorkflowAction('pause', workflowRunId)}
                disabled={isLoading}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Pause
              </button>
              <button
                onClick={() => handleWorkflowAction('resume', workflowRunId)}
                disabled={isLoading}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Resume
              </button>
              <button
                onClick={() => handleGetStatus(workflowRunId)}
                disabled={isLoading}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Get Status
              </button>
            </div>
          </div>
        )}

        {/* Communication Examples */}
        <div>
          <h4 className="font-medium text-brand-heading mb-2">3. Communications</h4>
          <div className="flex gap-2">
            <button
              onClick={handleSendEmail}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send Test Email
            </button>
            <button
              onClick={handleSendSlack}
              disabled={isLoading}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Send Test Slack
            </button>
          </div>
        </div>

        {/* API Contract Information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-brand-heading mb-2">API Contract Summary</h4>
          <div className="text-sm text-brand-muted space-y-1">
            <p><strong>Upload SOP:</strong> POST /api/workflow/upload_sop</p>
            <p><strong>Action:</strong> POST /api/workflow/action</p>
            <p><strong>Status:</strong> GET /api/workflow/status</p>
            <p><strong>Email:</strong> POST /api/workflow/email</p>
            <p><strong>Slack:</strong> POST /api/workflow/slack</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeApiExample;