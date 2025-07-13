import React, { Component, ErrorInfo, ReactNode } from "react";
import { IconButton } from "../IconButton/IconButton";
import { PillButton } from "../PillButton/PillButton";
import { classNames } from "../../../helpers/classNames";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
  lastErrorTime: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  isolateErrors?: boolean;
  showErrorDetails?: boolean;
  className?: string;
}

interface ErrorDisplayProps {
  error: Error;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  onReport: () => void;
  onDismiss: () => void;
  retryCount: number;
  maxRetries: number;
  showDetails: boolean;
  isRecovering: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorInfo,
  onRetry,
  onReport,
  onDismiss,
  retryCount,
  maxRetries,
  showDetails,
  isRecovering,
}) => {
  const [showFullDetails, setShowFullDetails] = React.useState(false);

  const getErrorType = (error: Error): string => {
    if (error.name === "ChunkLoadError") return "Network Error";
    if (error.message.includes("Loading chunk")) return "Loading Error";
    if (error.message.includes("TypeError")) return "Type Error";
    if (error.message.includes("ReferenceError")) return "Reference Error";
    if (error.message.includes("NetworkError")) return "Network Error";
    if (error.message.includes("XMTP")) return "XMTP Error";
    return "Application Error";
  };

  const getErrorSeverity = (error: Error): "low" | "medium" | "high" => {
    if (error.name === "ChunkLoadError") return "medium";
    if (error.message.includes("Loading chunk")) return "medium";
    if (error.message.includes("NetworkError")) return "high";
    if (error.message.includes("XMTP")) return "high";
    return "medium";
  };

  const getRecoveryMessage = (): string => {
    const errorType = getErrorType(error);

    switch (errorType) {
      case "Network Error":
        return "Please check your internet connection and try again.";
      case "Loading Error":
        return "There was an issue loading the application. Refreshing should fix this.";
      case "XMTP Error":
        return "There was an issue with the messaging service. Please try again.";
      default:
        return "An unexpected error occurred. Please try refreshing the page.";
    }
  };

  const severity = getErrorSeverity(error);
  const errorType = getErrorType(error);

  return (
    <div
      className={classNames(
        "flex flex-col items-center justify-center min-h-[200px] p-6 rounded-lg border-2",
        severity === "high"
          ? "border-red-200 bg-red-50"
          : severity === "medium"
            ? "border-yellow-200 bg-yellow-50"
            : "border-gray-200 bg-gray-50",
      )}>
      {/* Error Icon */}
      <div
        className={classNames(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          severity === "high"
            ? "bg-red-100"
            : severity === "medium"
              ? "bg-yellow-100"
              : "bg-gray-100",
        )}>
        <svg
          className={classNames(
            "w-8 h-8",
            severity === "high"
              ? "text-red-600"
              : severity === "medium"
                ? "text-yellow-600"
                : "text-gray-600",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{errorType}</h3>

      {/* Error Message */}
      <p className="text-sm text-gray-600 text-center mb-4 max-w-md">
        {getRecoveryMessage()}
      </p>

      {/* Retry Information */}
      {maxRetries > 0 && (
        <p className="text-xs text-gray-500 mb-4">
          Retry attempts: {retryCount}/{maxRetries}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {retryCount < maxRetries && (
          <PillButton
            label={isRecovering ? "Retrying..." : "Retry"}
            onClick={onRetry}
            variant="primary"
            isDisabled={isRecovering}
            size="small"
          />
        )}

        <PillButton
          label="Refresh"
          onClick={() => window.location.reload()}
          variant="secondary"
          size="small"
        />

        <PillButton
          label="Report"
          onClick={onReport}
          variant="secondary"
          size="small"
        />

        <PillButton
          label="Dismiss"
          onClick={onDismiss}
          variant="secondary"
          size="small"
        />
      </div>

      {/* Error Details Toggle */}
      {showDetails && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-xs text-gray-500 hover:text-gray-700 mb-2">
            {showFullDetails ? "Hide" : "Show"} technical details
          </button>

          {showFullDetails && (
            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-700 max-h-40 overflow-y-auto">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
              <div>
                <strong>Component Stack:</strong>
                <pre className="whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private errorReportingUrl: string | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      lastErrorTime: 0,
    };

    // Setup error reporting endpoint
    this.errorReportingUrl =
      (import.meta.env as any).VITE_ERROR_REPORTING_URL || null;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if ((import.meta.env as any).MODE === "development") {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Error Info:", errorInfo);
    }

    // Auto-report critical errors
    if (this.shouldAutoReport(error)) {
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state when props change (if enabled)
    if (
      resetOnPropsChange &&
      hasError &&
      prevProps.children !== this.props.children
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0,
        isRecovering: false,
      });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private shouldAutoReport = (error: Error): boolean => {
    // Auto-report network errors and critical application errors
    return (
      error.name === "ChunkLoadError" ||
      error.message.includes("Loading chunk") ||
      error.message.includes("NetworkError") ||
      error.message.includes("XMTP")
    );
  };

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    if (!this.errorReportingUrl) return;

    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: "anonymous", // Replace with actual user ID if available
      };

      await fetch(this.errorReportingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) return;

    this.setState({
      isRecovering: true,
      retryCount: retryCount + 1,
    });

    // Simulate recovery attempt with timeout
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
      });
    }, 1000);
  };

  private handleReport = () => {
    const { error, errorInfo } = this.state;
    if (error && errorInfo) {
      this.reportError(error, errorInfo);
    }
  };

  private handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
    });
  };

  render() {
    const {
      children,
      fallback,
      maxRetries = 3,
      showErrorDetails = (import.meta.env as any).MODE === "development",
      className = "",
    } = this.props;

    const { hasError, error, errorInfo, retryCount, isRecovering } = this.state;

    if (hasError && error && errorInfo) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className={classNames("error-boundary", className)}>
          <ErrorDisplay
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            onReport={this.handleReport}
            onDismiss={this.handleDismiss}
            retryCount={retryCount}
            maxRetries={maxRetries}
            showDetails={showErrorDetails}
            isRecovering={isRecovering}
          />
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for easy error boundary wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error reporting from functional components
export const useErrorHandler = () => {
  const reportError = React.useCallback((error: Error, errorInfo?: any) => {
    // Trigger error boundary by throwing the error
    throw error;
  }, []);

  return { reportError };
};
