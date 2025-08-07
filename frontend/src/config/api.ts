// API Configuration
// Centralized configuration for all backend API endpoints

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    // System endpoints
    health: string;
    root: string;
    
    // N8N workflow endpoints
    workflows: string;
    webhook: string;
    
    // File management endpoints
    uploadFile: string;
    downloadFile: string;
    deleteFile: string;
    bucketExists: string;
    objectExists: string;
    createBucket: string;
    listBuckets: string;
    
    // Zendesk endpoints
    zendeskProxy: string;
    zendeskHealth: string;
    
    // Workflow endpoints
    uploadSop: string;
    workflowAction: string;
    workflowStatus: string;
    workflowEmail: string;
    workflowSlack: string;
    workflowRedisJobStatus: string;
    workflowStartTask: string;
  };
}

// Production API configuration
const API_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://fastapi-alb-135111181.us-east-1.elb.amazonaws.com',
  endpoints: {
    // System
    health: '/health',
    root: '/',
    
    // N8N workflows
    workflows: '/n8n/workflows',
    webhook: '/n8n/webhook',
    
    // File management
    uploadFile: '/v1/upload_file',
    downloadFile: '/v1/download_file',
    deleteFile: '/v1/delete_file',
    bucketExists: '/v1/bucket_exists',
    objectExists: '/v1/object_exists',
    createBucket: '/v1/create_bucket',
    listBuckets: '/v1/list_buckets',
    
    // Zendesk
    zendeskProxy: '/zendesk/',
    zendeskHealth: '/zendesk/health',
    
    // Workflow operations
    uploadSop: '/workflow/upload_sop',
    workflowAction: '/workflow/action',
    workflowStatus: '/workflow/status',
    workflowEmail: '/workflow/email',
    workflowSlack: '/workflow/slack',
    workflowRedisJobStatus: '/workflow/redis_job_status',
    workflowStartTask: '/workflow/start-task',
  },
};

// Helper functions to build full URLs
export const getApiUrl = (endpoint: keyof ApiConfig['endpoints']): string => {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`;
};

export const getApiUrlWithPath = (endpoint: keyof ApiConfig['endpoints'], path: string): string => {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}${path}`;
};

// Export the config for direct access if needed
export default API_CONFIG;

// Environment-specific overrides (for development/testing)
export const getBaseUrl = (): string => {
  // Check for environment override
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://fastapi-alb-135111181.us-east-1.elb.amazonaws.com';
  if (envBaseUrl) {
    return envBaseUrl;
  }
  
  // Default to production URL
  return API_CONFIG.baseUrl;
};

// Health check utility
export const checkApiHealth = async (): Promise<{ healthy: boolean; error?: string }> => {
  try {
    const response = await fetch(getApiUrl('health'));
    if (response.ok) {
      return { healthy: true };
    } else {
      return { healthy: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
