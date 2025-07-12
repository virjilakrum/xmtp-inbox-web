import type React from "react";
import { ArrowCircleRightIcon } from "@heroicons/react/outline";
import { ButtonLoader } from "../Loaders/ButtonLoader";
import { classNames } from "../../../helpers";

interface GhostButtonProps {
  /**
   * What are the button contents?
   */
  label: React.ReactNode;
  /**
   * Is this in the primary or secondary colors?
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
   * Is there an icon that should override the current icon?
   */
  icon?: React.ReactNode;
  /**
   * What is the test id associated with this button?
   */
  testId?: string;
}

const colorClassMapping = {
  primary: {
    backgroundColor: "bg-transparent hover:bg-gray-50",
    fontColor:
      "text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
  },
  secondary: {
    backgroundColor: "bg-transparent hover:bg-red-50",
    fontColor:
      "text-red-600 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2",
  },
};

const sizeClassMapping = {
  large: "text-lg p-0",
  small: "text-sm p-0",
};

/**
 * Ghost button component that includes text
 */

export const GhostButton = ({
  label,
  variant = "primary",
  isLoading = false,
  isDisabled = false,
  size = "large",
  srText = "",
  onClick,
  icon = <ArrowCircleRightIcon width={size === "large" ? 24 : 16} />,
  testId,
}: GhostButtonProps) => {
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
        "px-4 py-2",
        "transition-all duration-200 ease-out",
        "transform hover:scale-105 active:scale-95",
        "border-2 border-transparent hover:border-gray-200",
        "shadow-sm hover:shadow-elegant",
        "group",
        "m-1",
      )}
      aria-label={srText}>
      <div className="flex justify-center items-center space-x-2">
        <div className="transition-transform duration-200 group-hover:translate-x-0.5">
          {label}
        </div>
        {isLoading ? (
          <ButtonLoader color="primary" size={size} />
        ) : (
          <div className="transition-transform duration-200 group-hover:translate-x-0.5">
            {icon}
          </div>
        )}
      </div>
    </button>
  );
};
