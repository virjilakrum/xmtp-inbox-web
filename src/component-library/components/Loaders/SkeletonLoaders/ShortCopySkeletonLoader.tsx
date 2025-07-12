export const ShortCopySkeletonLoader = ({ lines = 1 }) => (
  <div role="status" className="animate-pulse max-w-lg">
    {lines === 1 ? (
      <div className="relative overflow-hidden">
        <div className="h-4 my-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48 relative">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide rounded-lg" />
        </div>
      </div>
    ) : (
      <div className="my-2 space-y-3">
        <div className="relative overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-32">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide rounded-lg" />
          </div>
        </div>
        <div className="relative overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide rounded-lg"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
