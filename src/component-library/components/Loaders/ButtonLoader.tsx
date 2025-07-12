interface ButtonLoaderProps {
  /**
   * What color should the loader/spinner be?
   */
  color?: "primary" | "secondary";
  /**
   * How large is this button?
   */
  size?: "small" | "large";
}

/**
 * Modern button loader component with Tailwind animations
 */
export const ButtonLoader = ({
  size = "large",
  color = "primary",
}: ButtonLoaderProps) => {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    large: "w-5 h-5 border-2",
  };

  const colorClasses = {
    primary: "border-white/30 border-t-white",
    secondary: "border-gray-300 border-t-gray-700",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          rounded-full animate-spin transition-all duration-200
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        style={{
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
};
