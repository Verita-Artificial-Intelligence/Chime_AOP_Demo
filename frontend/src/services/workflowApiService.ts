import axios, { AxiosResponse } from 'axios';
import { getApiUrl, getApiUrlWithPath } from '../config/api';

// API interfaces for workflow management

// Job Status interfaces
export interface RedisJobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  result?: any;
  error?: string;
  createdAt: string;
  processedAt?: string;
  finishedAt?: string;
}

/**
 * Service for workflow API operations including job management and webhooks
 */
export class WorkflowApiService {


  /**
   * Get webhook endpoint
   */
  static async getWebhook(webhookPath: string): Promise<any> {
    const response: AxiosResponse<any> = await axios.get(
      getApiUrlWithPath('webhook', `/${webhookPath}`)
    );
    return response.data;
  }

  /**
   * Post to webhook endpoint
   */
  static async postWebhook(webhookPath: string, data?: any): Promise<any> {
    const response: AxiosResponse<any> = await axios.post(
      getApiUrlWithPath('webhook', `/${webhookPath}`),
      data
    );
    return response.data;
  }

  /**
   * Get Redis job status
   */
  static async getRedisJobStatus(jobId: string): Promise<RedisJobStatus> {
    const response: AxiosResponse<RedisJobStatus> = await axios.get(
      getApiUrlWithPath('workflowRedisJobStatus', `/${jobId}`)
    );
    return response.data;
  }

  /**
   * Start a task (example endpoint)
   */
  static async startTask(x: number): Promise<any> {
    const response: AxiosResponse<any> = await axios.post(
      getApiUrl('workflowStartTask'),
      null,
      {
        params: { x },
      }
    );
    return response.data;
  }

  /**
   * Helper method for safe API calls with error handling
   */
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

  /**
   * Polling utility for job status
   */
  static async pollJobStatus(
    jobId: string,
    onUpdate: (status: RedisJobStatus) => void,
    maxAttempts: number = 60,
    intervalMs: number = 2000
  ): Promise<RedisJobStatus> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const poll = async () => {
        try {
          attempts++;
          const status = await this.getRedisJobStatus(jobId);
          onUpdate(status);
          
          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }
          
          if (attempts >= maxAttempts) {
            reject(new Error('Polling timeout exceeded'));
            return;
          }
          
          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
}

export default WorkflowApiService;
