// Webhook Service for receiving status updates from the backend

export interface StatusUpdate {
  step: number;
  status: string;
  timestamp: string;
}

export class WebhookService {
  private static eventSource: EventSource | null = null;
  private static webhookServerUrl = 'http://localhost:3001';

  /**
   * Get the webhook URL for the backend to send updates to
   */
  static getWebhookUrl(): string {
    // In production, this would be your deployed frontend's webhook endpoint
    // For local development, we use the Express server
    return `${this.webhookServerUrl}/api/status-update`;
  }

  /**
   * Subscribe to workflow updates via Server-Sent Events
   */
  static subscribeToWorkflowUpdates(
    workflowId: string,
    onUpdate: (update: StatusUpdate) => void
  ): () => void {
    // Close any existing connection
    if (this.eventSource) {
      this.eventSource.close();
    }

    // Create new EventSource connection
    const url = `${this.webhookServerUrl}/api/workflow-updates/${workflowId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Skip connection messages
        if (data.type === 'connected') {
          console.log('Connected to workflow updates:', workflowId);
          return;
        }

        // Process status updates
        if (data.step) {
          onUpdate({
            step: data.step,
            status: data.status || 'completed',
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // Return cleanup function
    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  /**
   * Check if webhook server is available
   */
  static async checkWebhookServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.webhookServerUrl}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Webhook server health check failed:', error);
      return false;
    }
  }
}