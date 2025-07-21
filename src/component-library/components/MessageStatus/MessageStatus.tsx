import React from "react";

type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

interface MessageStatusProps {
  status: MessageStatus;
  timestamp?: Date;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  timestamp,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const getStatusIcon = () => {
    switch (status) {
      case "sending":
        return (
          <div
            className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
          />
        );
      case "sent":
        return (
          <svg
            className={sizeClasses[size]}
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "delivered":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className={`${sizeClasses[size]} text-blue-600`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              className={`${sizeClasses[size]} text-blue-600`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "read":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className={`${sizeClasses[size]} text-blue-600`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              className={`${sizeClasses[size]} text-blue-600`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "failed":
        return (
          <svg
            className={`${sizeClasses[size]} text-red-500`}
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "sending":
        return "Sending...";
      case "sent":
        return "Sent";
      case "delivered":
        return "Delivered";
      case "read":
        return "Read";
      case "failed":
        return "Failed to send";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "sending":
        return "text-gray-500";
      case "sent":
        return "text-gray-400";
      case "delivered":
        return "text-blue-600";
      case "read":
        return "text-blue-600";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${getStatusColor()} transition-colors duration-200`}>
        {getStatusIcon()}
      </div>
      {timestamp && (
        <span
          className={`text-xs ${getStatusColor()} transition-colors duration-200`}>
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
      <span
        className={`text-xs ${getStatusColor()} transition-colors duration-200`}>
        {getStatusText()}
      </span>
    </div>
  );
};

// Advanced message status with retry functionality
interface AdvancedMessageStatusProps extends MessageStatusProps {
  onRetry?: () => void;
  showTimestamp?: boolean;
  showText?: boolean;
}

export const AdvancedMessageStatus: React.FC<AdvancedMessageStatusProps> = ({
  status,
  timestamp,
  onRetry,
  showTimestamp = true,
  showText = false,
  className = "",
  size = "md",
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <MessageStatus status={status} size={size} />

      {showTimestamp && timestamp && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}

      {showText && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {status === "failed" ? "Failed to send" : status}
        </span>
      )}

      {status === "failed" && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 underline">
          Retry
        </button>
      )}
    </div>
  );
};

// Message status indicator for message bubbles
export const MessageBubbleStatus: React.FC<{
  status: MessageStatus;
  isOwn: boolean;
  className?: string;
}> = ({ status, isOwn, className = "" }) => {
  const sizeClasses = "w-3 h-3";

  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (status) {
      case "sending":
        return (
          <div
            className={`${sizeClasses} animate-spin rounded-full border border-white border-t-transparent`}
          />
        );
      case "sent":
        return (
          <svg
            className={`${sizeClasses} text-white opacity-70`}
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "delivered":
        return (
          <div className="flex items-center space-x-0.5">
            <svg
              className={`${sizeClasses} text-white opacity-70`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              className={`${sizeClasses} text-white opacity-70`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "read":
        return (
          <div className="flex items-center space-x-0.5">
            <svg
              className={`${sizeClasses} text-blue-300`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              className={`${sizeClasses} text-blue-300`}
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "failed":
        return (
          <svg
            className={`${sizeClasses} text-red-300`}
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center justify-end ${className}`}>
      {getStatusIcon()}
    </div>
  );
};
