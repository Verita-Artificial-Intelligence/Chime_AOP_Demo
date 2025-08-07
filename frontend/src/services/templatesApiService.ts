import axios from 'axios';
import { getBaseUrl } from '../config/api';

// Types for template data
export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  steps: number;
  estimatedTime: string;
  category: string;
  icon: string;
  jsonFile: string;
}

export interface WorkflowStep {
  step: number;
  action: string;
  heading: string;
  element_type: string;
  element_description: string;
  value?: string;
}

export interface WorkflowTemplateData {
  template: WorkflowTemplate;
  steps: WorkflowStep[];
}

// Create axios instance
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// No authentication required for templates API

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Templates API Error:', error);
    throw error;
  }
);

export const templatesApiService = {
  /**
   * Get all available workflow templates
   */
  async getTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const response = await apiClient.get<WorkflowTemplate[]>('/api/templates/');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Get a specific template's metadata by ID
   */
  async getTemplate(templateId: string): Promise<WorkflowTemplate> {
    try {
      const response = await apiClient.get<WorkflowTemplate>(`/api/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Get the workflow steps for a specific template
   */
  async getTemplateSteps(templateId: string): Promise<WorkflowStep[]> {
    try {
      const response = await apiClient.get<WorkflowStep[]>(`/api/templates/${templateId}/steps`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching steps for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Get complete template data including metadata and steps
   */
  async getTemplateWithSteps(templateId: string): Promise<WorkflowTemplateData> {
    try {
      const response = await apiClient.get<WorkflowTemplateData>(`/api/templates/${templateId}/full`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching full template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Get all available template categories
   */
  async getCategories(): Promise<{ categories: string[] }> {
    try {
      const response = await apiClient.get<{ categories: string[] }>('/api/templates/categories/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching template categories:', error);
      throw error;
    }
  },

  /**
   * Get templates filtered by category
   */
  async getTemplatesByCategory(category: string): Promise<WorkflowTemplate[]> {
    try {
      const response = await apiClient.get<WorkflowTemplate[]>(`/api/templates/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching templates for category ${category}:`, error);
      throw error;
    }
  },
};

export default templatesApiService;
