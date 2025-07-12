import React from "react";
import { PillButton } from "../PillButton/PillButton";
import { classNames } from "../../../helpers";

interface ErrorBoundaryProps {
  error: Error;
  onRetry?: () => void;
  onClearData?: () => void;
  className?: string;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  onRetry,
  onClearData,
  className = "",
}) => {
  const isInstallationLimitError = error.name === "InstallationLimitError";
  const isConnectionError =
    error.message.includes("network") ||
    error.message.includes("connection") ||
    error.message.includes("timeout");

  const containerStyles: React.CSSProperties = {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    margin: "16px",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const contentStyles: React.CSSProperties = {
    textAlign: "center",
    color: "#374151",
  };

  const iconStyles: React.CSSProperties = {
    fontSize: "48px",
    marginBottom: "16px",
  };

  const titleStyles: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#1f2937",
  };

  const messageStyles: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: "1.5",
    marginBottom: "20px",
    color: "#6b7280",
  };

  const solutionsStyles: React.CSSProperties = {
    textAlign: "left",
    backgroundColor: "#f3f4f6",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px",
  };

  const actionsStyles: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  };

  const detailsStyles: React.CSSProperties = {
    textAlign: "left",
    marginTop: "16px",
  };

  const preStyles: React.CSSProperties = {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "12px",
    overflow: "auto",
    maxHeight: "150px",
    fontFamily: "monospace",
  };

  return (
    <div
      className={classNames("error-boundary", className)}
      style={containerStyles}>
      <div className="error-boundary-content" style={contentStyles}>
        <div className="error-icon" style={iconStyles}>
          {isInstallationLimitError ? "⚠️" : isConnectionError ? "🔄" : "❌"}
        </div>

        <h3 className="error-title" style={titleStyles}>
          {isInstallationLimitError
            ? "Installation Limit Reached"
            : isConnectionError
              ? "Connection Error"
              : "Something went wrong"}
        </h3>

        {isInstallationLimitError ? (
          <div className="installation-limit-error">
            <p className="error-message" style={messageStyles}>
              This wallet address has reached the maximum number of zkλ
              installations (5/5).
            </p>

            <div className="error-solutions" style={solutionsStyles}>
              <h4 style={{ marginBottom: "12px", color: "#1f2937" }}>
                Solutions:
              </h4>
              <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Clear local data:</strong> This will clear your local
                  zkλ data and may allow you to reconnect
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Use a different wallet:</strong> Switch to a different
                  wallet address for testing
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Contact support:</strong> If you need help revoking
                  old installations
                </li>
              </ul>
            </div>

            <div className="error-actions" style={actionsStyles}>
              {onClearData && (
                <PillButton
                  label="Clear Local Data"
                  variant="primary"
                  onClick={onClearData}
                  size="large"
                />
              )}
              {onRetry && (
                <PillButton
                  label="Try Again"
                  variant="secondary"
                  onClick={onRetry}
                  size="large"
                />
              )}
            </div>

            <div className="error-details" style={detailsStyles}>
              <details>
                <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
                  Technical Details
                </summary>
                <pre className="error-stack" style={preStyles}>
                  {error.message}
                </pre>
              </details>
            </div>
          </div>
        ) : (
          <div className="general-error">
            <p className="error-message" style={messageStyles}>
              {error.message || "An unexpected error occurred"}
            </p>

            <div className="error-actions" style={actionsStyles}>
              {onRetry && (
                <PillButton
                  label={isConnectionError ? "Retry Connection" : "Try Again"}
                  variant="primary"
                  onClick={onRetry}
                  size="large"
                />
              )}
              {onClearData && (
                <PillButton
                  label="Clear Data"
                  variant="secondary"
                  onClick={onClearData}
                  size="large"
                />
              )}
            </div>

            <div className="error-details" style={detailsStyles}>
              <details>
                <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
                  Technical Details
                </summary>
                <pre className="error-stack" style={preStyles}>
                  {error.stack}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
