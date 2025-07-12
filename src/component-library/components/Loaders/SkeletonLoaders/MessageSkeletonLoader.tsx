export const MessageSkeletonLoader = ({ incoming = true }) => (
  <div role="status" className="max-w-full p-4">
    {incoming ? (
      <div className="flex space-x-3">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide" />
          </div>
        </div>

        {/* Message content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Sender name */}
          <div className="relative overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-24">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide" />
            </div>
          </div>

          {/* Message lines */}
          <div className="space-y-2">
            <div className="relative overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-full max-w-md">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide"
                  style={{ animationDelay: "0.1s" }}
                />
              </div>
            </div>
            <div className="relative overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-3/4 max-w-sm">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="relative overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-12">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex justify-end">
        <div className="max-w-md space-y-3">
          {/* Message lines - right aligned */}
          <div className="space-y-2">
            <div className="relative overflow-hidden ml-auto">
              <div className="h-3 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg w-64">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide" />
              </div>
            </div>
            <div className="relative overflow-hidden ml-auto">
              <div className="h-3 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg w-48">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide"
                  style={{ animationDelay: "0.1s" }}
                />
              </div>
            </div>
          </div>

          {/* Timestamp - right aligned */}
          <div className="relative overflow-hidden ml-auto">
            <div className="h-2 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg w-12">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse-slide"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
