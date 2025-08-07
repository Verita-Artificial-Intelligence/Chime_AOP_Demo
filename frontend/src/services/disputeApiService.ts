import axios, { AxiosResponse } from 'axios';
import { getApiUrl } from '../config/api';

// API Contract Interfaces - exactly matching the specification
export interface UploadSOPRequest {
  file: File;
}

export interface UploadSOPResponse {
  success: boolean;
  message: string;
  disputeCode: string;
  workflowRunId: string;
  workflowRunDto: object;
}

export interface WorkflowActionRequest {
  action: 'start' | 'pause' | 'resume';
  workflowRunId: string;
}

export interface WorkflowActionResponse {
  success: boolean;
  workflowRunId: string;
  action: 'start' | 'pause' | 'resume';
  message: string;
}

export interface WorkflowStatusRequest {
  workflowRunId: string;
}

export interface WorkflowStatusResponse {
  workflowRunId: string;
  action: 'start' | 'pause' | 'resume';
  dispute_code?: string; // Added based on backend implementation
  workflowDtoStatus: Array<{
    id: string; // node-id
    status: 'completed' | 'pending';
  }>;
}

export interface EmailRequest {
  email: string;
  subject: string;
  body: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface SlackRequest {
  message: string;
}

export interface SlackResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// API Service Class
export class DisputeApiService {

  /**
   * Upload SOP - Ingests PDF and runs agents to verify dispute details and maps to dispute code
   */
  static async uploadSOP(file: File): Promise<UploadSOPResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<UploadSOPResponse> = await axios.post(
      getApiUrl('uploadSop'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Workflow Action - Performs actions on the workflow: start | pause | resume
   */
  static async executeWorkflowAction(
    action: 'start' | 'pause' | 'resume',
    workflowRunId: string
  ): Promise<WorkflowActionResponse> {
    const response: AxiosResponse<WorkflowActionResponse> = await axios.post(
      getApiUrl('workflowAction'),
      null,
      {
        params: {
          action,
          workflowRunId,
        },
      }
    );

    return response.data;
  }

  /**
   * Workflow Status - Gets status of a workflow run
   */
  static async getWorkflowStatus(workflowRunId: string): Promise<WorkflowStatusResponse> {
    const response: AxiosResponse<WorkflowStatusResponse> = await axios.get(
      getApiUrl('workflowStatus'),
      {
        params: { workflowRunId },
      }
    );

    return response.data;
  }

  /**
   * Send Email - Sends email over Gmail to given email
   */
  static async sendEmail(
    email: string,
    subject: string,
    body: string
  ): Promise<EmailResponse> {
    const response: AxiosResponse<EmailResponse> = await axios.post(
      getApiUrl('workflowEmail'),
      null,
      {
        params: {
          email,
          subject,
          body,
        },
      }
    );

    return response.data;
  }

  /**
   * Send Slack Message - Sends message to slack channel #n8n-logs
   */
  static async sendSlackMessage(message: string, channel?: string): Promise<SlackResponse> {
    const response: AxiosResponse<SlackResponse> = await axios.post(
      getApiUrl('workflowSlack'),
      null,
      {
        params: {
          message,
          ...(channel && { channel }),
        },
      }
    );

    return response.data;
  }

  // Helper methods for better error handling
  static async safeApiCall<T>(
    apiCall: () => Promise<T>,
    errorContext: string
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const data = await apiCall();
      return { success: true, data };
    } catch (error) {
      console.error(`${errorContext}:`, error);
      
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }
}

export default DisputeApiService;