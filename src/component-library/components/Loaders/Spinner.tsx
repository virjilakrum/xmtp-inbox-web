// Modern spinner component with Tailwind classes
export const Spinner = (): JSX.Element | null => (
  <div className="relative inline-block w-12 h-12">
    {/* Single clean rotating circle */}
    <div className="absolute inset-0 border-4 border-gray-200 rounded-full animate-spin">
      <div className="absolute inset-0 border-4 border-transparent border-t-gray-900 rounded-full animate-spin"></div>
    </div>

    {/* Modern pulsing center dot */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
    </div>
  </div>
);
