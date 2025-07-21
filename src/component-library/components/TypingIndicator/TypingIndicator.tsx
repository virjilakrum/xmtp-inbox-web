import React from "react";

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isTyping,
  userName = "Someone",
  className = "",
}) => {
  if (!isTyping) return null;

  return (
    <div className={`flex items-center space-x-2 p-3 ${className}`}>
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />

      {/* Typing indicator */}
      <div className="flex flex-col space-y-1">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {userName} is typing...
        </span>
        <div className="typing-indicator animate-fade-in-scale">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
};

// Advanced typing indicator with multiple users
interface AdvancedTypingIndicatorProps {
  typingUsers: Array<{ id: string; name: string }>;
  className?: string;
}

export const AdvancedTypingIndicator: React.FC<
  AdvancedTypingIndicatorProps
> = ({ typingUsers, className = "" }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className={`flex items-center space-x-3 p-4 ${className}`}>
      {/* Multiple avatars */}
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-gray-800 animate-float"
            style={{ animationDelay: `${index * 0.2}s` }}
            title={user.name}
          />
        ))}
        {typingUsers.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
            +{typingUsers.length - 3}
          </div>
        )}
      </div>

      {/* Typing indicator */}
      <div className="flex flex-col space-y-1">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {getTypingText()}
        </span>
        <div className="typing-indicator animate-fade-in-scale">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
};

// Compact typing indicator for mobile
export const CompactTypingIndicator: React.FC<{
  isTyping: boolean;
  className?: string;
}> = ({ isTyping, className = "" }) => {
  if (!isTyping) return null;

  return (
    <div className={`flex items-center justify-center p-2 ${className}`}>
      <div className="typing-indicator animate-fade-in-scale">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
};
