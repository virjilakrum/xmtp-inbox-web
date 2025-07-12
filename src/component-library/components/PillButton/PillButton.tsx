import type React from "react";
import { ArrowCircleRightIcon } from "@heroicons/react/outline";
import { ButtonLoader } from "../Loaders/ButtonLoader";
import { classNames } from "../../../helpers";

interface PillButtonProps {
  /**
   * What are the button contents?
   */
  label: React.ReactNode;
  /**
   * What color scheme is this button?
   */
  variant?: "primary" | "secondary";
  /**
   * How large is this button?
   */
  size?: "small" | "large";
  /**
   * Should the button display a loading state?
   */
  isLoading?: boolean;
  /**
   * Should the button be disabled?
   */
  isDisabled?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * What should the screen reader text show?
   */
  srText?: string;
  /**
   * Is there an icon that should override the default icon?
   */
  iconOverride?: React.ReactNode;
  /**
   * What is the test id?
   */
  testId?: React.ReactNode;
}

const colorClassMapping = {
  primary: {
    backgroundColor:
      "gradient-primary hover:shadow-modern focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
    fontColor: "text-white",
  },
  secondary: {
    backgroundColor:
      "bg-white border-2 border-gray-300 hover:border-gray-600 hover:shadow-elegant focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
    fontColor: "text-gray-700 hover:text-gray-900",
  },
};

const sizeClassMapping = {
  large: "h-12 px-8 py-4 text-base",
  small: "text-sm h-10 px-6 py-3",
};

/**
 * Pill button component with text
 */

export const PillButton = ({
  label,
  variant = "primary",
  isLoading = false,
  isDisabled = false,
  size = "large",
  srText = "",
  onClick,
  iconOverride,
  testId,
}: PillButtonProps) => {
  const disabled = isDisabled ? "opacity-50 cursor-not-allowed" : "";
  const sizeClass = sizeClassMapping[size];

  const { backgroundColor, fontColor } =
    variant === "primary"
      ? colorClassMapping.primary
      : colorClassMapping.secondary;

  const minWidth = size === "large" ? 25 : 20;

  return (
    <button
      data-testid={testId}
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={classNames(
        backgroundColor,
        fontColor,
        disabled,
        sizeClass,
        `min-w-[${minWidth}%]`,
        "font-semibold",
        "rounded-none",
        "transition-all duration-300 ease-out",
        "transform hover:scale-105 active:scale-95",
        "shadow-elegant hover:shadow-modern",
        "relative overflow-hidden",
        "group",
        "m-2",
      )}
      aria-label={srText || (label as string)}>
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 group-hover:animate-pulse" />

      <div className="flex justify-center items-center space-x-2 relative z-10">
        <div className="transition-transform duration-200 group-hover:translate-x-0.5">
          {label}
        </div>
        {isLoading ? (
          <ButtonLoader color="primary" size={size} />
        ) : (
          iconOverride || (
            <ArrowCircleRightIcon
              width={size === "large" ? 20 : 16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )
        )}
      </div>
    </button>
  );
};
