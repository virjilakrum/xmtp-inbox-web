export const IconSkeletonLoader = () => (
  <div role="status" className="h-full w-full flex justify-end">
    <div className="relative overflow-hidden">
      <div className="h-4 mt-2 ml-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-8">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide rounded-lg" />
      </div>
    </div>
  </div>
);
