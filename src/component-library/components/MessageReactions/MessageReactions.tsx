import React, { useState } from "react";

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  isOwn: boolean;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  className?: string;
}

const COMMON_EMOJIS = [
  "👍",
  "👎",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
  "🎉",
  "🔥",
  "💯",
  "✨",
  "👏",
  "🙏",
  "💪",
  "🤔",
];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onAddReaction,
  onRemoveReaction,
  className = "",
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find((r) => r.emoji === emoji);
    if (existingReaction?.isOwn) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Existing reactions */}
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReactionClick(reaction.emoji)}
          className={`
            flex items-center space-x-1 px-2 py-1 rounded-full text-sm
            transition-all duration-200 hover:scale-105
            ${
              reaction.isOwn
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }
          `}>
          <span>{reaction.emoji}</span>
          <span className="text-xs font-medium">{reaction.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* Emoji picker */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10">
          <div className="grid grid-cols-8 gap-2">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onAddReaction(emoji);
                  setShowPicker(false);
                }}
                className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors duration-200">
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
