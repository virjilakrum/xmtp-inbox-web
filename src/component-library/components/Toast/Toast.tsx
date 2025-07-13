import React, { useEffect, useRef, useCallback } from "react";
import { classNames } from "../../../helpers/classNames";
import { IconButton } from "../IconButton/IconButton";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastItemProps {
  toast: ToastData;
  onClose: (id: string) => void;
  position: ToastPosition;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, position }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = useCallback(() => {
    if (isLeaving) return;

    setIsLeaving(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose(toast.id);
      if (toast.onClose) {
        toast.onClose();
      }
    }, 300); // Animation duration
  }, [toast.id, toast.onClose, onClose, isLeaving]);

  useEffect(() => {
    // Show animation
    setIsVisible(true);

    // Auto-dismiss unless persistent
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || 5000;
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [toast.duration, toast.persistent, handleClose]);

  const getIconForType = (type: ToastType) => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5"
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
        );
      case "info":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClasses = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200",
          icon: "text-green-600 bg-green-100",
          title: "text-green-800",
          message: "text-green-600",
          closeButton: "text-green-400 hover:text-green-600",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200",
          icon: "text-red-600 bg-red-100",
          title: "text-red-800",
          message: "text-red-600",
          closeButton: "text-red-400 hover:text-red-600",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200",
          icon: "text-yellow-600 bg-yellow-100",
          title: "text-yellow-800",
          message: "text-yellow-600",
          closeButton: "text-yellow-400 hover:text-yellow-600",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200",
          icon: "text-blue-600 bg-blue-100",
          title: "text-blue-800",
          message: "text-blue-600",
          closeButton: "text-blue-400 hover:text-blue-600",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200",
          icon: "text-gray-600 bg-gray-100",
          title: "text-gray-800",
          message: "text-gray-600",
          closeButton: "text-gray-400 hover:text-gray-600",
        };
    }
  };

  const getAnimationClasses = (position: ToastPosition) => {
    const baseClasses = "transition-all duration-300 ease-out";

    if (isLeaving) {
      return `${baseClasses} opacity-0 scale-95 translate-y-2`;
    }

    if (!isVisible) {
      const slideDirection = position.includes("right")
        ? "translate-x-full"
        : position.includes("left")
          ? "-translate-x-full"
          : position.includes("top")
            ? "-translate-y-full"
            : "translate-y-full";
      return `${baseClasses} opacity-0 scale-95 ${slideDirection}`;
    }

    return `${baseClasses} opacity-100 scale-100 translate-x-0 translate-y-0`;
  };

  const colors = getColorClasses(toast.type);
  const animationClasses = getAnimationClasses(position);

  return (
    <div
      className={classNames(
        "max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
        colors.container,
        animationClasses,
      )}
      role="alert"
      aria-live="polite">
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div
            className={classNames(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3",
              colors.icon,
            )}>
            {getIconForType(toast.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={classNames("text-sm font-medium", colors.title)}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={classNames("mt-1 text-sm", colors.message)}>
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className={classNames(
                    "text-sm font-medium underline hover:no-underline",
                    colors.title,
                  )}>
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={handleClose}
              className={classNames(
                "rounded-md p-1.5 hover:bg-opacity-20 hover:bg-current focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                colors.closeButton,
              )}
              aria-label="Close notification">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
  position?: ToastPosition;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = "top-right",
  className = "",
}) => {
  const getPositionClasses = (position: ToastPosition) => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      default:
        return "top-4 right-4";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={classNames(
        "fixed z-50 pointer-events-none",
        getPositionClasses(position),
        className,
      )}
      aria-live="polite"
      aria-label="Notifications">
      <div className="flex flex-col space-y-4">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={onClose}
            position={position}
          />
        ))}
      </div>
    </div>
  );
};

// Toast context and hook
interface ToastContextType {
  showToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined,
);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const showToast = useCallback(
    (toast: Omit<ToastData, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastData = { ...toast, id };

      setToasts((prevToasts) => {
        const updatedToasts = [...prevToasts, newToast];
        // Remove oldest toasts if exceeding maxToasts
        if (updatedToasts.length > maxToasts) {
          return updatedToasts.slice(-maxToasts);
        }
        return updatedToasts;
      });
    },
    [maxToasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    removeToast,
    removeAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Convenience functions
export const toast = {
  success: (title: string, message?: string, options?: Partial<ToastData>) => ({
    type: "success" as const,
    title,
    message,
    ...options,
  }),
  error: (title: string, message?: string, options?: Partial<ToastData>) => ({
    type: "error" as const,
    title,
    message,
    ...options,
  }),
  warning: (title: string, message?: string, options?: Partial<ToastData>) => ({
    type: "warning" as const,
    title,
    message,
    ...options,
  }),
  info: (title: string, message?: string, options?: Partial<ToastData>) => ({
    type: "info" as const,
    title,
    message,
    ...options,
  }),
};
