export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 for persistent
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: "primary" | "secondary";
}

type NotificationListener = (notifications: Notification[]) => void;

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: NotificationListener[] = [];
  private nextId = 1;

  // Subscribe to notification changes
  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of changes
  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  // Add a new notification
  private addNotification(notification: Omit<Notification, "id">): string {
    const id = `notification_${this.nextId++}`;
    const newNotification: Notification = {
      ...notification,
      id,
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto-remove after duration (if specified and > 0)
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  // Show success notification
  success(
    title: string,
    message: string,
    duration: number = 5000,
    actions?: NotificationAction[]
  ): string {
    return this.addNotification({
      type: "success",
      title,
      message,
      duration,
      actions,
    });
  }

  // Show error notification
  error(
    title: string,
    message: string,
    duration: number = 0, // Persistent by default for errors
    actions?: NotificationAction[]
  ): string {
    return this.addNotification({
      type: "error",
      title,
      message,
      duration,
      actions,
    });
  }

  // Show warning notification
  warning(
    title: string,
    message: string,
    duration: number = 8000,
    actions?: NotificationAction[]
  ): string {
    return this.addNotification({
      type: "warning",
      title,
      message,
      duration,
      actions,
    });
  }

  // Show info notification
  info(
    title: string,
    message: string,
    duration: number = 5000,
    actions?: NotificationAction[]
  ): string {
    return this.addNotification({
      type: "info",
      title,
      message,
      duration,
      actions,
    });
  }

  // Remove notification by ID
  remove(id: string) {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  // Clear all notifications
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Clear notifications by type
  clearByType(type: Notification["type"]) {
    this.notifications = this.notifications.filter((n) => n.type !== type);
    this.notifyListeners();
  }

  // Get current notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Convenience methods for common scenarios
  
  // API Error handling
  apiError(error: any, context?: string): string {
    let message = "An unexpected error occurred.";
    let title = "API Error";

    if (context) {
      title = `${context} Failed`;
    }

    if (typeof error === "string") {
      message = error;
    } else if (error?.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }

    return this.error(title, message, 0, [
      {
        label: "Retry",
        action: () => {
          // This would be overridden by the calling component
          console.log("Retry action triggered");
        },
        style: "primary",
      },
    ]);
  }

  // Loading state management
  loading(title: string, message: string): string {
    return this.info(title, message, 0);
  }

  // Form validation errors
  validationError(title: string, errors: string[]): string {
    const message = errors.join("\n");
    return this.error(title, message, 10000);
  }

  // Success with action
  successWithAction(
    title: string,
    message: string,
    actionLabel: string,
    action: () => void,
    duration: number = 8000
  ): string {
    return this.success(title, message, duration, [
      {
        label: actionLabel,
        action,
        style: "primary",
      },
    ]);
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

// Export for use in React components
export default notificationService;