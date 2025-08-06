import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { notificationService, Notification } from "../services/notificationService";

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case "error":
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case "info":
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
      default:
        return "text-blue-800";
    }
  };

  const getMessageColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-700";
      case "error":
        return "text-red-700";
      case "warning":
        return "text-yellow-700";
      case "info":
      default:
        return "text-blue-700";
    }
  };

  const getCloseButtonColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-500 hover:text-green-700";
      case "error":
        return "text-red-500 hover:text-red-700";
      case "warning":
        return "text-yellow-500 hover:text-yellow-700";
      case "info":
      default:
        return "text-blue-500 hover:text-blue-700";
    }
  };

  const getActionButtonStyle = (style?: "primary" | "secondary") => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-md transition-colors";
    
    if (style === "primary") {
      switch (notification.type) {
        case "success":
          return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
        case "error":
          return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
        case "warning":
          return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700`;
        case "info":
        default:
          return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
      }
    } else {
      switch (notification.type) {
        case "success":
          return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
        case "error":
          return `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`;
        case "warning":
          return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`;
        case "info":
        default:
          return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      }
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow-sm transition-all duration-300 ease-in-out ${getBackgroundColor()}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-semibold ${getTitleColor()}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`mt-1 text-sm ${getMessageColor()} whitespace-pre-line`}>
              {notification.message}
            </p>
          )}
          
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={getActionButtonStyle(action.style)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onClose(notification.id)}
          className={`ml-4 flex-shrink-0 ${getCloseButtonColor()} transition-colors`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export const NotificationDisplay: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={notificationService.remove.bind(notificationService)}
        />
      ))}
    </div>
  );
};

export default NotificationDisplay;