import { DisputeApiService } from './disputeApiService';

export interface EmailNotificationService {
  sendNotification(email: string, subject: string, body: string): Promise<void>;
  sendWorkflowStartNotification(email: string, workflowTitle: string): Promise<void>;
  sendWorkflowCompletionNotification(email: string, workflowTitle: string, stepCount: number): Promise<void>;
  sendWorkflowErrorNotification(email: string, error: string, workflowTitle?: string): Promise<void>;
  sendStatusUpdateNotification(email: string, workflowTitle: string, progress: { completed: number; total: number }): Promise<void>;
}

class EmailNotificationServiceImpl implements EmailNotificationService {
  async sendNotification(email: string, subject: string, body: string): Promise<void> {
    try {
      const result = await DisputeApiService.safeApiCall(
        () => DisputeApiService.sendEmail(email, subject, body),
        'Send Email Notification'
      );

      if (result.success) {
        console.log('Email notification sent successfully to:', email);
      } else {
        console.error('Failed to send email notification:', result.error);
        console.error('Email details:', { email, subject, body });
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
      console.error('Email details:', { email, subject, body });
    }
  }

  async sendWorkflowStartNotification(email: string, workflowTitle: string): Promise<void> {
    const subject = `Workflow Started: ${workflowTitle}`;
    const body = `
Dear User,

Your workflow "${workflowTitle}" has been started successfully and is now running.

You will receive email updates at key stages of the workflow execution.

Best regards,
Verita AI Platform
    `.trim();

    await this.sendNotification(email, subject, body);
  }

  async sendWorkflowCompletionNotification(email: string, workflowTitle: string, stepCount: number): Promise<void> {
    const subject = `Workflow Completed: ${workflowTitle}`;
    const body = `
Dear User,

Great news! Your workflow "${workflowTitle}" has been completed successfully.

Summary:
- Workflow: ${workflowTitle}
- Total steps completed: ${stepCount}
- Status: Completed successfully

You can now review the results in your dashboard.

Best regards,
Verita AI Platform
    `.trim();

    await this.sendNotification(email, subject, body);
  }

  async sendWorkflowErrorNotification(email: string, error: string, workflowTitle?: string): Promise<void> {
    const workflowInfo = workflowTitle ? ` "${workflowTitle}"` : '';
    const subject = `Workflow Error${workflowInfo}`;
    const body = `
Dear User,

We encountered an error while executing your workflow${workflowInfo}.

Error Details:
${error}

Please check your workflow configuration and try again. If the problem persists, contact support.

Best regards,
Verita AI Platform
    `.trim();

    await this.sendNotification(email, subject, body);
  }

  async sendStatusUpdateNotification(
    email: string, 
    workflowTitle: string, 
    progress: { completed: number; total: number }
  ): Promise<void> {
    const percentage = Math.round((progress.completed / progress.total) * 100);
    const subject = `Workflow Progress Update: ${workflowTitle}`;
    const body = `
Dear User,

Your workflow "${workflowTitle}" is making progress.

Current Status:
- Progress: ${progress.completed}/${progress.total} steps completed (${percentage}%)
- Status: In progress

We'll notify you when the workflow is complete.

Best regards,
Verita AI Platform
    `.trim();

    await this.sendNotification(email, subject, body);
  }
}

// Export singleton instance
export const emailNotificationService: EmailNotificationService = new EmailNotificationServiceImpl();
