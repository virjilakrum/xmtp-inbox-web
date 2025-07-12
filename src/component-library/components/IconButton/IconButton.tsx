import type React from "react";
import { PlusCircleIcon } from "@heroicons/react/outline";
import { ButtonLoader } from "../Loaders/ButtonLoader";
import { classNames } from "../../../helpers";

interface IconButtonProps {
  /**
   * What are the button contents?
   */
  label: React.ReactNode;
  /**
   * Is this a round or message shape of the button?
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
   * What is the test id associated with this button?
   */
  testId?: string;
}

const colorClassMapping = {
  primary: {
    backgroundColor:
      "gradient-primary hover:shadow-modern focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
    fontColor: null,
  },
  secondary: {
    backgroundColor:
      "bg-white border-2 border-gray-300 hover:border-gray-600 hover:shadow-elegant focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
    fontColor: null,
  },
};

const sizeClassMapping = {
  large: "text-lg p-0",
  small: "text-sm p-0",
};

/**
 * Icon-only button component
 */
export const IconButton = ({
  label = <PlusCircleIcon width="24" color="white" />,
  variant = "primary",
  isLoading = false,
  isDisabled = false,
  size = "large",
  srText,
  onClick,
  testId,
}: IconButtonProps) => {
  const disabled = isDisabled ? "opacity-50 cursor-not-allowed" : "";
  const sizeClass = sizeClassMapping[size];
  const shape =
    variant === "primary"
      ? "rounded-full"
      : "rounded-tl-2xl rounded-tr-2xl rounded-br-2xl";

  return (
    <button
      data-testid={testId}
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={classNames(
        variant === "primary"
          ? colorClassMapping.primary.backgroundColor
          : colorClassMapping.secondary.backgroundColor,
        sizeClass,
        disabled,
        "rounded-none",
        "flex",
        "justify-center",
        "items-center",
        "transition-all duration-200 ease-out",
        "transform hover:scale-105 active:scale-95",
        "group",
        "relative overflow-hidden",
        size === "small" ? "p-2" : "p-3",
      )}
      aria-label={srText}>
      {/* Animated background overlay for primary variant */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12" />
      )}

      <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        {isLoading ? <ButtonLoader color="primary" size={size} /> : label}
      </div>
    </button>
  );
};
