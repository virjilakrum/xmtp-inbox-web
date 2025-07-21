import React from "react";
import { useTheme } from "../../../context/ThemeProvider";

// Custom icons since heroicons might not be available
const SunIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const ComputerDesktopIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabels = false,
  size = "md",
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <SunIcon className={iconSizes[size]} />;
      case "dark":
        return <MoonIcon className={iconSizes[size]} />;
      case "auto":
        return <ComputerDesktopIcon className={iconSizes[size]} />;
      default:
        return <SunIcon className={iconSizes[size]} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      case "auto":
        return "Auto Mode";
      default:
        return "Theme";
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          relative rounded-full p-2 transition-all duration-300 ease-in-out
          bg-white/90 backdrop-blur-sm border border-gray-200/50
          hover:bg-white hover:shadow-elegant hover:scale-105
          active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500
          dark:bg-gray-800/90 dark:border-gray-600/50
          dark:hover:bg-gray-700 dark:focus:ring-blue-400
          theme-transition
        `}
        aria-label={`Switch to ${getThemeLabel()}`}
        title={getThemeLabel()}>
        <div className="relative">
          {/* Icon with smooth transition */}
          <div className="absolute inset-0 flex items-center justify-center">
            {getThemeIcon()}
          </div>

          {/* Animated background */}
          <div
            className={`
              absolute inset-0 rounded-full transition-all duration-300
              ${
                isDark
                  ? "bg-gradient-to-br from-blue-600 to-purple-600 opacity-20"
                  : "bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20"
              }
            `}
          />
        </div>
      </button>

      {showLabels && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 theme-transition">
          {getThemeLabel()}
        </span>
      )}
    </div>
  );
};

// Advanced theme toggle with dropdown
export const AdvancedThemeToggle: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const { theme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const themes = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "auto", label: "Auto", icon: ComputerDesktopIcon },
  ] as const;

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <SunIcon className="w-5 h-5" />;
      case "dark":
        return <MoonIcon className="w-5 h-5" />;
      case "auto":
        return <ComputerDesktopIcon className="w-5 h-5" />;
      default:
        return <SunIcon className="w-5 h-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      case "auto":
        return "Auto Mode";
      default:
        return "Theme";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center space-x-2 px-3 py-2 rounded-lg
          bg-white/90 backdrop-blur-sm border border-gray-200/50
          hover:bg-white hover:shadow-elegant transition-all duration-200
          dark:bg-gray-800/90 dark:border-gray-600/50 dark:hover:bg-gray-700
          theme-transition
        ">
        {getThemeIcon()}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getThemeLabel()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg shadow-elegant dark:bg-gray-800/95 dark:border-gray-600/50 z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 text-left
                hover:bg-gray-100/80 dark:hover:bg-gray-700/80
                transition-colors duration-200
                ${theme === value ? "bg-blue-50 dark:bg-blue-900/20" : ""}
              `}>
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </span>
              {theme === value && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
