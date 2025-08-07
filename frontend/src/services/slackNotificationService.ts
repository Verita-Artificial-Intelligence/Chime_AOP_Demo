import { DisputeApiService } from './disputeApiService';

export interface SlackNotificationService {
  sendNotification(message: string, channel?: string): Promise<void>;
  sendWorkflowStartNotification(workflowTitle: string): Promise<void>;
  sendVerificationNotification(stepDescription: string, verificationType: string): Promise<void>;
  sendBigActionNotification(actionDescription: string): Promise<void>;
  sendCompletionNotification(workflowTitle: string, stepCount: number): Promise<void>;
  sendErrorNotification(error: string, workflowTitle?: string): Promise<void>;
}

class SlackNotificationServiceImpl implements SlackNotificationService {
  private async sendMessage(text: string, channel?: string): Promise<void> {
    try {
      const result = await DisputeApiService.safeApiCall(
        () => DisputeApiService.sendSlackMessage(text, channel),
        'Send Slack Notification'
      );

      if (result.success) {
        console.log('Slack notification sent successfully:', text);
      } else {
        console.error('Failed to send Slack notification:', result.error);
        console.error('Message was:', text);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      console.error('Message was:', text);
    }
  }

  async sendNotification(message: string, channel?: string): Promise<void> {
    await this.sendMessage(message, channel);
  }

  async sendWorkflowStartNotification(workflowTitle: string): Promise<void> {
    const message = `**Workflow Started**: ${workflowTitle}\n\nThe workflow execution has begun. You'll receive updates at key stages.`;
    await this.sendMessage(message);
  }

  async sendVerificationNotification(stepDescription: string, verificationType: string): Promise<void> {
    const verificationEmoji = verificationType === 'slack' ? '💬' : verificationType === 'gmail' ? '📧' : '✅';
    const message = `${verificationEmoji} **Verification Required**\n\n**Step**: ${stepDescription}\n**Type**: ${verificationType.toUpperCase()}\n\nPlease complete the verification to continue the workflow.`;
    await this.sendMessage(message);
  }

  async sendBigActionNotification(actionDescription: string): Promise<void> {
    const message = `⚡ **Important Action About to Execute**\n\n**Action**: ${actionDescription}\n\nThis action will modify external systems or send data. The workflow will proceed automatically.`;
    await this.sendMessage(message);
  }

  async sendCompletionNotification(workflowTitle: string, stepCount: number): Promise<void> {
    const message = `**Workflow Completed Successfully**\n\n**Workflow**: ${workflowTitle}\n**Steps Completed**: ${stepCount}\n\nAll steps have been executed successfully!`;
    await this.sendMessage(message);
  }

  async sendErrorNotification(error: string, workflowTitle?: string): Promise<void> {
    const workflowInfo = workflowTitle ? `\n**Workflow**: ${workflowTitle}` : '';
    const message = `**Workflow Error**${workflowInfo}\n\n**Error**: ${error}\n\nPlease check the workflow execution for details.`;
    await this.sendMessage(message);
  }
}

// Export singleton instance
export const slackNotificationService: SlackNotificationService = new SlackNotificationServiceImpl(); 