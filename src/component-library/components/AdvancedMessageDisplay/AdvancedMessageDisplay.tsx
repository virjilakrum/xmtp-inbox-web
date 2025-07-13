import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import {
  useAdvancedInboxStore,
  useMessageManagement,
  useFileManagement,
} from "../../../store/advancedInbox";
import type {
  CachedMessageWithId,
  CachedConversationWithId,
  MessageContent,
  AttachmentMetadata,
  UserPresence,
} from "../../../types/xmtpV3Types";
import {
  EllipsisVerticalIcon,
  FaceSmileIcon,
  ArrowUturnLeftIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  PauseIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  LinkIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon,
  StarIcon as StarSolidIcon,
  FaceSmileIcon as SmileSolidIcon,
} from "@heroicons/react/24/solid";
import {
  safeFormatTimestamp,
  safeFormatDate,
  safeConvertTimestamp,
} from "../../../helpers";

// Emoji picker component
const EmojiPicker: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position: { x: number; y: number };
}> = ({ isOpen, onClose, onEmojiSelect, position }) => {
  const commonEmojis = [
    "👍",
    "❤️",
    "😊",
    "😂",
    "😮",
    "😢",
    "😡",
    "🎉",
    "🔥",
    "💯",
  ];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      style={{ left: position.x, top: position.y - 60 }}>
      <div className="grid grid-cols-5 gap-2">
        {commonEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Reactions display component
const ReactionsDisplay: React.FC<{
  reactions: {
    [emoji: string]: {
      count: number;
      users: string[];
      hasCurrentUser: boolean;
    };
  };
  onReactionClick: (emoji: string) => void;
}> = ({ reactions, onReactionClick }) => {
  if (Object.keys(reactions).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Object.entries(reactions).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => onReactionClick(emoji)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm transition-colors ${
            data.hasCurrentUser
              ? "bg-blue-100 text-blue-800 border border-blue-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}>
          <span>{emoji}</span>
          <span className="font-medium">{data.count}</span>
        </button>
      ))}
    </div>
  );
};

// Attachment display component
const AttachmentDisplay: React.FC<{
  attachment: AttachmentMetadata;
  onDownload: () => void;
  compact?: boolean;
}> = ({ attachment, onDownload, compact = false }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handlePlayPause = () => {
    if (attachment.type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (attachment.type === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderIcon = () => {
    switch (attachment.type) {
      case "image":
        return <PhotoIcon className="w-6 h-6" />;
      case "video":
        return <VideoCameraIcon className="w-6 h-6" />;
      case "audio":
        return <SpeakerWaveIcon className="w-6 h-6" />;
      case "document":
        return <DocumentIcon className="w-6 h-6" />;
      case "location":
        return <MapPinIcon className="w-6 h-6" />;
      case "contact":
        return <UserIcon className="w-6 h-6" />;
      default:
        return <DocumentIcon className="w-6 h-6" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
        <div className="text-gray-500">{renderIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.filename}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(attachment.size)}
          </p>
        </div>
        <button
          onClick={onDownload}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          {t("message.download")}
        </button>
      </div>
    );
  }

  switch (attachment.type) {
    case "image":
      return (
        <div className="max-w-sm rounded-lg overflow-hidden shadow-md">
          {attachment.url ? (
            <img
              src={attachment.url}
              alt={attachment.filename}
              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(attachment.url, "_blank")}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <PhotoIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="p-3 bg-white">
            <p className="text-sm font-medium text-gray-900">
              {attachment.filename}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
      );

    case "video":
      return (
        <div className="max-w-md rounded-lg overflow-hidden shadow-md">
          {attachment.url ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={attachment.url}
                className="w-full h-auto"
                controls={false}
                poster={attachment.thumbnailUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all">
                {isPlaying ? (
                  <PauseIcon className="w-12 h-12 text-white" />
                ) : (
                  <PlayIcon className="w-12 h-12 text-white" />
                )}
              </button>
              {attachment.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(attachment.duration / 60)}:
                  {String(attachment.duration % 60).padStart(2, "0")}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <VideoCameraIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="p-3 bg-white">
            <p className="text-sm font-medium text-gray-900">
              {attachment.filename}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
      );

    case "audio":
      return (
        <div className="max-w-sm bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlayPause}
              className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.filename}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full w-0"></div>
                </div>
                {attachment.duration && (
                  <span className="text-xs text-gray-500">
                    {Math.floor(attachment.duration / 60)}:
                    {String(attachment.duration % 60).padStart(2, "0")}
                  </span>
                )}
              </div>
            </div>
          </div>
          {attachment.url && (
            <audio
              ref={audioRef}
              src={attachment.url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>
      );

    case "location":
      return (
        <div className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
          {attachment.location && (
            <>
              <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <MapPinIcon className="w-12 h-12 text-white" />
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900">
                  {attachment.location.name || t("message.location")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {attachment.location.address}
                </p>
                <button
                  onClick={() => {
                    const url = `https://maps.google.com/maps?q=${attachment.location!.latitude},${attachment.location!.longitude}`;
                    window.open(url, "_blank");
                  }}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {t("message.open_in_maps")}
                </button>
              </div>
            </>
          )}
        </div>
      );

    case "contact":
      return (
        <div className="max-w-sm bg-white rounded-lg shadow-md p-4">
          {attachment.contact && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                {attachment.contact.avatar ? (
                  <img
                    src={attachment.contact.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {attachment.contact.name}
                </p>
                {attachment.contact.phone && (
                  <p className="text-sm text-gray-600">
                    {attachment.contact.phone}
                  </p>
                )}
                {attachment.contact.email && (
                  <p className="text-sm text-gray-600">
                    {attachment.contact.email}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="max-w-sm bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-gray-500">{renderIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.filename}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(attachment.size)}
              </p>
            </div>
            <button
              onClick={onDownload}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {t("message.download")}
            </button>
          </div>
        </div>
      );
  }
};

// Poll display component
const PollDisplay: React.FC<{
  poll: NonNullable<MessageContent["poll"]>;
  onVote: (optionId: string) => void;
  canVote: boolean;
}> = ({ poll, onVote, canVote }) => {
  const { t } = useTranslation();
  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0,
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-md">
      <h4 className="font-medium text-gray-900 mb-3">{poll.question}</h4>
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const hasVoted = option.voters.includes("current-user"); // Would use actual user ID

          return (
            <button
              key={option.id}
              onClick={() => canVote && onVote(option.id)}
              disabled={!canVote}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                hasVoted
                  ? "bg-blue-50 border-blue-300"
                  : canVote
                    ? "hover:bg-gray-50 border-gray-300"
                    : "border-gray-200"
              }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.text}</span>
                <span className="text-sm text-gray-500">
                  {option.votes} votes
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-3">
        {totalVotes} {totalVotes === 1 ? t("poll.vote") : t("poll.votes")}
        {poll.expiresAt && (
          <>
            {" "}
            • {t("poll.expires")}{" "}
            {new Date(poll.expiresAt).toLocaleDateString()}
          </>
        )}
      </p>
    </div>
  );
};

// Calendar event display
const CalendarEventDisplay: React.FC<{
  event: NonNullable<MessageContent["calendar"]>;
  onAddToCalendar: () => void;
}> = ({ event, onAddToCalendar }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-md">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{event.title}</h4>
          {event.description && (
            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
          )}
          <div className="mt-2 space-y-1 text-sm text-gray-500">
            <p>{new Date(event.startTime).toLocaleString()}</p>
            <p>to {new Date(event.endTime).toLocaleString()}</p>
            {event.location && <p>📍 {event.location}</p>}
            {event.attendees && event.attendees.length > 0 && (
              <p>{event.attendees.length} attendees</p>
            )}
          </div>
          <button
            onClick={onAddToCalendar}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
            {t("message.add_to_calendar")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment display
const PaymentDisplay: React.FC<{
  payment: NonNullable<MessageContent["payment"]>;
}> = ({ payment }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-md">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <CreditCardIcon className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {payment.amount} {payment.currency}
            </h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
              {payment.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">to {payment.recipient}</p>
          {payment.memo && (
            <p className="text-sm text-gray-500 mt-1">"{payment.memo}"</p>
          )}
          {payment.transactionId && (
            <p className="text-xs text-gray-400 mt-2 font-mono">
              {payment.transactionId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Link preview component
const LinkPreview: React.FC<{
  link: {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
  };
}> = ({ link }) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-md bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {link.imageUrl && (
        <img src={link.imageUrl} alt="" className="w-full h-32 object-cover" />
      )}
      <div className="p-3">
        {link.title && (
          <h4 className="font-medium text-gray-900 line-clamp-2">
            {link.title}
          </h4>
        )}
        {link.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {link.description}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2 truncate">{link.url}</p>
      </div>
    </a>
  );
};

// Quote/Reply display
const QuoteDisplay: React.FC<{
  quote: NonNullable<MessageContent["quote"]>;
  onQuoteClick: () => void;
}> = ({ quote, onQuoteClick }) => {
  return (
    <button
      onClick={onQuoteClick}
      className="w-full text-left p-3 bg-gray-50 border-l-4 border-l-gray-400 rounded-r-lg hover:bg-gray-100 transition-colors">
      <p className="text-xs text-gray-500 font-medium">{quote.author}</p>
      <p className="text-sm text-gray-700 mt-1 line-clamp-3">{quote.text}</p>
    </button>
  );
};

// Main message component
const MessageItem: React.FC<{
  message: CachedMessageWithId;
  conversation: CachedConversationWithId;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  isHighlighted: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onForward: () => void;
  onCopy: () => void;
}> = ({
  message,
  conversation,
  isOwn,
  showAvatar,
  showTimestamp,
  isHighlighted,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onCopy,
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({
    x: 0,
    y: 0,
  });
  const messageRef = useRef<HTMLDivElement>(null);

  const { downloadAttachment } = useFileManagement();

  const formatTimestamp = (timestamp: bigint) => {
    return safeFormatTimestamp(timestamp);
  };

  const handleEmojiClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setEmojiPickerPosition({ x: rect.left, y: rect.top });
    setEmojiPickerOpen(true);
  };

  const handleDownload = async (attachment: AttachmentMetadata) => {
    try {
      const blob = await downloadAttachment(attachment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderMessageContent = () => {
    const content = message.content;
    if (!content) return null;

    return (
      <div className="space-y-3">
        {/* Reply/Quote */}
        {content.quote && (
          <QuoteDisplay
            quote={content.quote}
            onQuoteClick={() => {
              // Navigate to quoted message
              console.log("Navigate to message:", content.quote!.messageId);
            }}
          />
        )}

        {/* Text content */}
        {content.text && (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap break-words">{content.text}</p>
          </div>
        )}

        {/* Attachments */}
        {content.attachments && content.attachments.length > 0 && (
          <div className="space-y-2">
            {content.attachments.map((attachment) => (
              <AttachmentDisplay
                key={attachment.id}
                attachment={attachment}
                onDownload={() => handleDownload(attachment)}
              />
            ))}
          </div>
        )}

        {/* Location */}
        {content.location && (
          <AttachmentDisplay
            attachment={{
              id: "location",
              type: "location",
              filename: "Location",
              size: 0,
              mimeType: "",
              location: content.location,
              isDownloaded: true,
            }}
            onDownload={() => {}}
          />
        )}

        {/* Contact */}
        {content.contact && (
          <AttachmentDisplay
            attachment={{
              id: "contact",
              type: "contact",
              filename: content.contact.name,
              size: 0,
              mimeType: "",
              contact: content.contact,
              isDownloaded: true,
            }}
            onDownload={() => {}}
          />
        )}

        {/* Poll */}
        {content.poll && (
          <PollDisplay
            poll={content.poll}
            onVote={(optionId) => {
              console.log("Vote for option:", optionId);
            }}
            canVote={!isOwn}
          />
        )}

        {/* Calendar event */}
        {content.calendar && (
          <CalendarEventDisplay
            event={content.calendar}
            onAddToCalendar={() => {
              console.log("Add to calendar:", content.calendar);
            }}
          />
        )}

        {/* Payment */}
        {content.payment && <PaymentDisplay payment={content.payment} />}

        {/* Link previews */}
        {content.text && (
          <div className="space-y-2">
            {message.metadata.links.map((link, index) => (
              <LinkPreview key={index} link={link} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={messageRef}
      className={`group flex space-x-3 p-4 ${
        isOwn ? "justify-end" : "justify-start"
      } ${isHighlighted ? "bg-yellow-50" : "hover:bg-gray-50"} transition-colors`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {message.senderAddress.slice(2, 4).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Message content */}
      <div
        className={`flex-1 max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwn
              ? "bg-gray-900 text-white rounded-br-md"
              : "bg-white border border-gray-200 rounded-bl-md"
          }`}>
          {renderMessageContent()}

          {/* Message metadata */}
          <div
            className={`flex items-center justify-between mt-2 text-xs ${
              isOwn ? "text-gray-300" : "text-gray-500"
            }`}>
            <div className="flex items-center space-x-2">
              {showTimestamp && (
                <span>{formatTimestamp(message.sentAtNs)}</span>
              )}
              {message.metadata.isEdited && (
                <span className="italic">{t("message.edited")}</span>
              )}
              {message.metadata.isEncrypted && (
                <span title={t("message.encrypted")}>🔒</span>
              )}
            </div>

            {/* Delivery status */}
            {isOwn && (
              <div className="flex items-center space-x-1">
                {message.metadata.deliveryStatus === "sending" && (
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                )}
                {message.metadata.deliveryStatus === "sent" && (
                  <CheckIcon className="w-3 h-3" />
                )}
                {message.metadata.deliveryStatus === "delivered" && (
                  <div className="flex space-x-0.5">
                    <CheckIcon className="w-3 h-3" />
                    <CheckIcon className="w-3 h-3 -ml-1" />
                  </div>
                )}
                {message.metadata.deliveryStatus === "read" && (
                  <div className="flex space-x-0.5 text-blue-400">
                    <CheckIcon className="w-3 h-3" />
                    <CheckIcon className="w-3 h-3 -ml-1" />
                  </div>
                )}
                {message.metadata.deliveryStatus === "failed" && (
                  <ExclamationTriangleIcon className="w-3 h-3 text-red-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(message.metadata.reactions).length > 0 && (
          <div className="mt-1">
            <ReactionsDisplay
              reactions={message.metadata.reactions}
              onReactionClick={onReact}
            />
          </div>
        )}
      </div>

      {/* Message actions */}
      {showActions && (
        <div
          className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
            isOwn ? "order-first mr-2" : "ml-2"
          }`}>
          <div className="flex space-x-1">
            <button
              onClick={handleEmojiClick}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              title={t("message.add_reaction")}>
              <FaceSmileIcon className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onReply}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              title={t("message.reply")}>
              <ArrowUturnLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onForward}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              title={t("message.forward")}>
              <ShareIcon className="w-4 h-4 text-gray-500" />
            </button>
            {isOwn && (
              <button
                onClick={onEdit}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                title={t("message.edit")}>
                <PencilIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              onClick={onCopy}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              title={t("message.copy")}>
              <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              title={t("message.delete")}>
              <TrashIcon className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker */}
      <EmojiPicker
        isOpen={emojiPickerOpen}
        onClose={() => setEmojiPickerOpen(false)}
        onEmojiSelect={onReact}
        position={emojiPickerPosition}
      />
    </div>
  );
};

// Main component
export const AdvancedMessageDisplay: React.FC<{
  conversation: CachedConversationWithId;
  messages: CachedMessageWithId[];
  currentUserAddress: string;
  onMessageAction: (action: string, messageId: string, data?: any) => void;
}> = ({ conversation, messages, currentUserAddress, onMessageAction }) => {
  const { t } = useTranslation();
  const { reactToMessage, editMessage, deleteMessage, forwardMessage } =
    useMessageManagement();

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find((m) => m.id === messageId);
      const hasReacted = message?.metadata.reactions[emoji]?.hasCurrentUser;
      await reactToMessage(messageId, emoji, hasReacted ? "remove" : "add");
    } catch (error) {
      console.error("Reaction failed:", error);
    }
  };

  const handleCopy = (message: CachedMessageWithId) => {
    if (message.content?.text) {
      navigator.clipboard.writeText(message.content.text);
    }
  };

  const handleEdit = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.content?.text) {
      const newText = prompt(t("message.edit_prompt"), message.content.text);
      if (newText !== null && newText !== message.content.text) {
        editMessage(messageId, { ...message.content, text: newText });
      }
    }
  };

  const handleDelete = async (messageId: string) => {
    if (confirm(t("message.confirm_delete"))) {
      await deleteMessage(messageId);
    }
  };

  const handleForward = (messageId: string) => {
    onMessageAction("forward", messageId);
  };

  const handleReply = (messageId: string) => {
    onMessageAction("reply", messageId);
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: CachedMessageWithId[] }[] = [];
    let currentDate = "";
    let currentGroup: CachedMessageWithId[] = [];

    messages.forEach((message) => {
      const messageDate = safeConvertTimestamp(message.sentAtNs).toDateString();
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {groupedMessages.map(({ date, messages: groupMessages }) => (
        <div key={date}>
          {/* Date divider */}
          <div className="flex items-center justify-center py-4">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
              {safeFormatDate(groupMessages[0]?.sentAtNs)}
            </div>
          </div>

          {/* Messages for this date */}
          {groupMessages.map((message, index) => {
            const isOwn = message.senderAddress === currentUserAddress;
            const prevMessage = index > 0 ? groupMessages[index - 1] : null;
            const nextMessage =
              index < groupMessages.length - 1
                ? groupMessages[index + 1]
                : null;

            const showAvatar =
              !isOwn &&
              (!nextMessage ||
                nextMessage.senderAddress !== message.senderAddress);
            const showTimestamp =
              !prevMessage ||
              Math.abs(
                Number(message.sentAtNs) - Number(prevMessage.sentAtNs),
              ) > 300000000000; // 5 minutes in nanoseconds

            return (
              <MessageItem
                key={message.id}
                message={message}
                conversation={conversation}
                isOwn={isOwn}
                showAvatar={showAvatar}
                showTimestamp={showTimestamp}
                isHighlighted={message.localMetadata.isHighlighted}
                onReact={(emoji) => handleReaction(message.id, emoji)}
                onReply={() => handleReply(message.id)}
                onEdit={() => handleEdit(message.id)}
                onDelete={() => handleDelete(message.id)}
                onForward={() => handleForward(message.id)}
                onCopy={() => handleCopy(message)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
