import { useState, useCallback, memo, useMemo } from "react";
import {
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  EyeIcon,
  DotsHorizontalIcon,
  EmojiHappyIcon,
  ReplyIcon,
  ShareIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/outline";
import { useCanMessage } from "../../../hooks/useV3Hooks";
import { CachedMessageWithId } from "../../../types/xmtpV3Types";
import { shortAddress, safeFormatTimestamp } from "../../../helpers";

// Message status types
type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
type MessageReaction = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

interface FullMessageProps {
  message: CachedMessageWithId;
  status?: MessageStatus;
  reactions?: MessageReaction[];
  isOwn?: boolean;
  isSelected?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  canReact?: boolean;
  canReply?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
  onSelect?: (messageId: string) => void;
}

// Performance optimization: Memoized status indicator component
const MessageStatusIndicator = memo(
  ({ status, isOwn }: { status?: MessageStatus; isOwn?: boolean }) => {
    if (!isOwn || !status) return null;

    const getStatusContent = () => {
      switch (status) {
        case "sending":
          return (
            <div className="flex items-center space-x-1 text-gray-400">
              <ClockIcon className="w-3 h-3 animate-spin" />
              <span className="text-xs">Sending...</span>
            </div>
          );
        case "sent":
          return (
            <div className="flex items-center space-x-1 text-gray-400">
              <CheckIcon className="w-3 h-3" />
              <span className="text-xs">Sent</span>
            </div>
          );
        case "delivered":
          return (
            <div className="flex items-center space-x-1 text-blue-500">
              <CheckCircleIcon className="w-3 h-3" />
              <span className="text-xs">Delivered</span>
            </div>
          );
        case "read":
          return (
            <div className="flex items-center space-x-1 text-green-500">
              <EyeIcon className="w-3 h-3" />
              <span className="text-xs">Read</span>
            </div>
          );
        case "failed":
          return (
            <div className="flex items-center space-x-1 text-red-500">
              <ExclamationCircleIcon className="w-3 h-3" />
              <span className="text-xs">Failed</span>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="message-status transition-all duration-200">
        {getStatusContent()}
      </div>
    );
  },
);

MessageStatusIndicator.displayName = "MessageStatusIndicator";

// Performance optimization: Memoized reactions component
const MessageReactions = memo(
  ({
    reactions,
    messageId,
    onReact,
  }: {
    reactions?: MessageReaction[];
    messageId: string;
    onReact?: (messageId: string, emoji: string) => void;
  }) => {
    if (!reactions || reactions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {reactions.map((reaction, index) => (
          <button
            key={`${reaction.emoji}-${index}`}
            onClick={() => onReact?.(messageId, reaction.emoji)}
            className={`
            flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
            ${
              reaction.userReacted
                ? "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
            }
            transform hover:scale-105
          `}>
            <span>{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </button>
        ))}
      </div>
    );
  },
);

MessageReactions.displayName = "MessageReactions";

// Performance optimization: Memoized message actions component
const MessageActions = memo(
  ({
    messageId,
    isOwn,
    canReact,
    canReply,
    canEdit,
    canDelete,
    onReact,
    onReply,
    onEdit,
    onDelete,
    onShare,
  }: {
    messageId: string;
    isOwn?: boolean;
    canReact?: boolean;
    canReply?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    onReact?: (messageId: string, emoji: string) => void;
    onReply?: (messageId: string) => void;
    onEdit?: (messageId: string) => void;
    onDelete?: (messageId: string) => void;
    onShare?: (messageId: string) => void;
  }) => {
    const [showActions, setShowActions] = useState(false);

    const handleQuickReaction = (emoji: string) => {
      onReact?.(messageId, emoji);
      setShowActions(false);
    };

    return (
      <div className="message-actions opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-1 bg-white rounded-full shadow-lg border border-gray-200 p-1">
          {canReact && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="React">
                <EmojiHappyIcon className="w-4 h-4 text-gray-600" />
              </button>

              {showActions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10">
                  <div className="flex space-x-2">
                    {["❤️", "👍", "😂", "😮", "😢", "😡"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleQuickReaction(emoji)}
                        className="text-lg hover:scale-125 transition-transform duration-200">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {canReply && (
            <button
              onClick={() => onReply?.(messageId)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Reply">
              <ReplyIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}

          <button
            onClick={() => onShare?.(messageId)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Share">
            <ShareIcon className="w-4 h-4 text-gray-600" />
          </button>

          {isOwn && canEdit && (
            <button
              onClick={() => onEdit?.(messageId)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit">
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {isOwn && canDelete && (
            <button
              onClick={() => onDelete?.(messageId)}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
              title="Delete">
              <TrashIcon className="w-4 h-4 text-red-600" />
            </button>
          )}

          <button
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="More">
            <DotsHorizontalIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  },
);

MessageActions.displayName = "MessageActions";

const FullMessage: React.FC<FullMessageProps> = memo(
  ({
    message,
    status = "delivered",
    reactions = [],
    isOwn = false,
    isSelected = false,
    showAvatar = true,
    showTimestamp = true,
    canReact = true,
    canReply = true,
    canEdit = true,
    canDelete = true,
    onReact,
    onReply,
    onEdit,
    onDelete,
    onShare,
    onSelect,
  }) => {
    const { canMessage } = useCanMessage();
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Performance optimization: Memoized sender address
    const senderAddress = useMemo(() => {
      if (message.senderInboxId) {
        return shortAddress(message.senderInboxId);
      }
      return message.senderAddress || "Unknown";
    }, [message.senderInboxId, message.senderAddress]);

    // Performance optimization: Memoized timestamp
    const timestamp = useMemo(() => {
      return safeFormatTimestamp(message.sentAtNs);
    }, [message.sentAtNs]);

    // Performance optimization: Memoized message content
    const messageContent = useMemo(() => {
      if (typeof message.content === "string") {
        return message.content;
      }
      return message.content?.text || "No content";
    }, [message.content]);

    // Performance optimization: Memoized click handler
    const handleMessageClick = useCallback(() => {
      if (onSelect && message.id) {
        onSelect(message.id);
      }
    }, [onSelect, message.id]);

    // Performance optimization: Memoized avatar
    const avatar = useMemo(() => {
      if (!showAvatar) return null;

      const initials = senderAddress.slice(0, 2).toUpperCase();
      const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-red-500",
        "bg-gray-500",
      ];
      const colorIndex = senderAddress.length % colors.length;

      return (
        <div
          className={`
        w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
        ${colors[colorIndex]}
        ${isOwn ? "order-2 ml-2" : "order-1 mr-2"}
      `}>
          {initials}
        </div>
      );
    }, [showAvatar, senderAddress, isOwn]);

    // Performance optimization: Memoized message styling
    const messageClasses = useMemo(() => {
      const baseClasses =
        "message-container group relative transition-all duration-200";
      const layoutClasses = `flex ${isOwn ? "justify-end" : "justify-start"} items-start space-x-2`;
      const selectionClasses = isSelected
        ? "bg-blue-50 border-blue-300"
        : "hover:bg-gray-50";
      const statusClasses = status === "failed" ? "border-red-300" : "";

      return `${baseClasses} ${layoutClasses} ${selectionClasses} ${statusClasses} p-4 border-b border-gray-200`;
    }, [isOwn, isSelected, status]);

    const bubbleClasses = useMemo(() => {
      const baseClasses =
        "message-bubble relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200";
      const ownClasses = isOwn
        ? "bg-blue-500 text-white rounded-br-md"
        : "bg-white text-gray-900 border border-gray-200 rounded-bl-md";
      const hoverClasses = isHovered
        ? "shadow-lg transform scale-[1.02]"
        : "shadow-md";
      const statusClasses = status === "sending" ? "opacity-70" : "";

      return `${baseClasses} ${ownClasses} ${hoverClasses} ${statusClasses}`;
    }, [isOwn, isHovered, status]);

    return (
      <div
        className={messageClasses}
        onClick={handleMessageClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* Avatar */}
        {avatar}

        {/* Message Content */}
        <div className={`flex-1 ${isOwn ? "order-1" : "order-2"}`}>
          {/* Message Header */}
          {showTimestamp && (
            <div
              className={`message-header mb-1 ${isOwn ? "text-right" : "text-left"}`}>
              <span className="text-xs font-medium text-gray-500">
                {!isOwn && `${senderAddress} • `}
                {timestamp}
              </span>
            </div>
          )}

          {/* Message Bubble */}
          <div className={bubbleClasses}>
            {/* Message Content */}
            <div className="message-content">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {messageContent}
              </p>
            </div>

            {/* Message Status (for own messages) */}
            {isOwn && (
              <div className="message-status-container mt-2 flex justify-end">
                <MessageStatusIndicator status={status} isOwn={isOwn} />
              </div>
            )}
          </div>

          {/* Reactions */}
          <MessageReactions
            reactions={reactions}
            messageId={message.id || ""}
            onReact={onReact}
          />

          {/* Retry Button for Failed Messages */}
          {status === "failed" && isOwn && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => {
                  // Handle retry logic here
                  console.log("Retrying message:", message.id);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors">
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div
          className={`message-actions-container ${isOwn ? "order-3" : "order-3"} absolute top-2 ${isOwn ? "left-2" : "right-2"}`}>
          <MessageActions
            messageId={message.id || ""}
            isOwn={isOwn}
            canReact={canReact}
            canReply={canReply}
            canEdit={canEdit}
            canDelete={canDelete}
            onReact={onReact}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
          />
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  },
);

// Performance optimization: Display name for debugging
FullMessage.displayName = "FullMessage";

export { FullMessage };
export default FullMessage;
