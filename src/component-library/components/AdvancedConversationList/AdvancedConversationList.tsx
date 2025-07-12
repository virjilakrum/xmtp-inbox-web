import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import {
  useAdvancedInboxStore,
  useSearch,
  useConversationManagement,
  useBulkOperations,
  useKeyboardShortcuts,
} from "../../../store/advancedInbox";
import { useVirtualizer } from "@tanstack/react-virtual";
import type {
  CachedConversationWithId,
  SearchFilters,
  UserPresence,
} from "../../../types/xmtpV3Types";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  PinIcon,
  ArchiveBoxIcon,
  SpeakerXMarkIcon,
  TrashIcon,
  TagIcon,
  ExportIcon,
  PlusIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  Squares2X2Icon,
  DocumentDuplicateIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  BellSlashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolidIcon,
  PinIcon as PinSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon,
} from "@heroicons/react/24/solid";

// Advanced search component
const AdvancedSearch: React.FC<{
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  activeFilters: SearchFilters;
}> = ({ onFiltersChange, activeFilters }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(activeFilters.query || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ query: localQuery });
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t("inbox.search_placeholder")}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl modern-input"
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <FunnelIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Advanced filters */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 bg-gray-50">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("inbox.search.date_from")}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg modern-input"
                onChange={(e) =>
                  onFiltersChange({
                    dateRange: {
                      ...activeFilters.dateRange,
                      start: new Date(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("inbox.search.date_to")}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg modern-input"
                onChange={(e) =>
                  onFiltersChange({
                    dateRange: {
                      ...activeFilters.dateRange,
                      end: new Date(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Message types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("inbox.search.message_types")}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "text",
                "image",
                "video",
                "audio",
                "document",
                "location",
                "contact",
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    const currentTypes = activeFilters.messageTypes || [];
                    const newTypes = currentTypes.includes(type as any)
                      ? currentTypes.filter((t) => t !== type)
                      : [...currentTypes, type as any];
                    onFiltersChange({ messageTypes: newTypes });
                  }}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeFilters.messageTypes?.includes(type as any)
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}>
                  {t(`inbox.search.types.${type}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Additional filters */}
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={activeFilters.hasAttachments}
                onChange={(e) =>
                  onFiltersChange({ hasAttachments: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                {t("inbox.search.has_attachments")}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={activeFilters.hasReactions}
                onChange={(e) =>
                  onFiltersChange({ hasReactions: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                {t("inbox.search.has_reactions")}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={activeFilters.isUnread}
                onChange={(e) =>
                  onFiltersChange({ isUnread: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                {t("inbox.search.unread_only")}
              </span>
            </label>
          </div>

          {/* Sort options */}
          <div className="flex gap-3">
            <select
              value={activeFilters.sortBy}
              onChange={(e) =>
                onFiltersChange({ sortBy: e.target.value as any })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg modern-input">
              <option value="relevance">
                {t("inbox.search.sort.relevance")}
              </option>
              <option value="date">{t("inbox.search.sort.date")}</option>
              <option value="sender">{t("inbox.search.sort.sender")}</option>
            </select>
            <select
              value={activeFilters.sortOrder}
              onChange={(e) =>
                onFiltersChange({ sortOrder: e.target.value as any })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg modern-input">
              <option value="desc">{t("inbox.search.sort.desc")}</option>
              <option value="asc">{t("inbox.search.sort.asc")}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Conversation item component
const ConversationItem: React.FC<{
  conversation: CachedConversationWithId;
  isSelected: boolean;
  isHighlighted: boolean;
  unreadCount: number;
  userPresence: UserPresence | null;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  compactMode: boolean;
}> = ({
  conversation,
  isSelected,
  isHighlighted,
  unreadCount,
  userPresence,
  onSelect,
  onClick,
  onContextMenu,
  compactMode,
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);

  const formatTime = (timestamp: bigint | Date) => {
    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Handle file drop
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Would upload files to this conversation
      console.log("Dropping files to conversation:", conversation.id, files);
    }
  };

  return (
    <div
      className={`relative flex items-center p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-gray-100 border-l-4 border-l-gray-900"
          : "hover:bg-gray-50"
      } ${isHighlighted ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""} ${
        isDragOver ? "bg-blue-50 border-l-4 border-l-blue-400" : ""
      } ${compactMode ? "py-2" : "py-4"}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      {/* Selection checkbox */}
      <div className="mr-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
        />
      </div>

      {/* Avatar with presence indicator */}
      <div className="relative mr-3 flex-shrink-0">
        <div
          className={`${compactMode ? "w-8 h-8" : "w-12 h-12"} bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center`}>
          <span className="text-white font-semibold text-sm">
            {conversation.peerAddress.slice(2, 4).toUpperCase()}
          </span>
        </div>
        {userPresence && (
          <div
            className={`absolute -bottom-1 -right-1 ${compactMode ? "w-3 h-3" : "w-4 h-4"} rounded-full border-2 border-white ${
              userPresence.status === "online"
                ? "bg-green-500"
                : userPresence.status === "away"
                  ? "bg-yellow-500"
                  : userPresence.status === "busy"
                    ? "bg-red-500"
                    : "bg-gray-400"
            }`}
          />
        )}
        {userPresence?.isTyping && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Conversation content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Name and status */}
            <div className="flex items-center space-x-2">
              <h3
                className={`font-semibold text-gray-900 truncate ${
                  compactMode ? "text-sm" : "text-base"
                } ${unreadCount > 0 ? "font-bold" : ""}`}>
                {conversation.enhancedMetadata.title ||
                  `${conversation.peerAddress.slice(0, 6)}...${conversation.peerAddress.slice(-4)}`}
              </h3>

              {/* Status indicators */}
              <div className="flex items-center space-x-1">
                {conversation.enhancedMetadata.isPinned && (
                  <PinSolidIcon className="w-4 h-4 text-yellow-500" />
                )}
                {conversation.enhancedMetadata.isMuted && (
                  <SpeakerXMarkIcon className="w-4 h-4 text-gray-400" />
                )}
                {conversation.enhancedMetadata.isArchived && (
                  <ArchiveBoxIcon className="w-4 h-4 text-gray-400" />
                )}
                {conversation.isGroup && (
                  <ChatSolidIcon className="w-4 h-4 text-blue-500" />
                )}
              </div>
            </div>

            {/* Last message preview */}
            {!compactMode && conversation.lastMessage && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {conversation.lastMessage.content?.text ||
                  (conversation.lastMessage.content?.attachments?.length
                    ? `📎 ${t("inbox.attachment")}`
                    : t("inbox.no_preview"))}
              </p>
            )}

            {/* Tags */}
            {!compactMode && conversation.enhancedMetadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {conversation.enhancedMetadata.tags
                  .slice(0, 3)
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                {conversation.enhancedMetadata.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{conversation.enhancedMetadata.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Time and unread count */}
          <div className="flex flex-col items-end space-y-1 ml-2">
            <span
              className={`text-gray-500 ${compactMode ? "text-xs" : "text-sm"}`}>
              {conversation.lastMessage &&
                formatTime(conversation.lastMessage.sentAtNs)}
            </span>
            {unreadCount > 0 && (
              <span
                className={`inline-flex items-center justify-center ${
                  compactMode ? "w-5 h-5 text-xs" : "w-6 h-6 text-sm"
                } font-bold text-white bg-gray-900 rounded-full`}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Bulk actions toolbar
const BulkActionsToolbar: React.FC<{
  selectedCount: number;
  onArchive: () => void;
  onMute: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  onClearSelection: () => void;
}> = ({
  selectedCount,
  onArchive,
  onMute,
  onDelete,
  onMarkRead,
  onClearSelection,
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-3 z-10 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4">
        <span className="font-medium">
          {t("inbox.selected_count", { count: selectedCount })}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkRead}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title={t("inbox.mark_read")}>
            <CheckIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onArchive}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title={t("inbox.archive")}>
            <ArchiveBoxIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onMute}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title={t("inbox.mute")}>
            <SpeakerXMarkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-red-400"
            title={t("inbox.delete")}>
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <button
        onClick={onClearSelection}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        title={t("inbox.clear_selection")}>
        ✕
      </button>
    </div>
  );
};

// Context menu component
const ContextMenu: React.FC<{
  isOpen: boolean;
  position: { x: number; y: number };
  conversation: CachedConversationWithId | null;
  onClose: () => void;
  onPin: () => void;
  onArchive: () => void;
  onMute: () => void;
  onDelete: () => void;
  onExport: () => void;
  onTag: () => void;
}> = ({
  isOpen,
  position,
  conversation,
  onClose,
  onPin,
  onArchive,
  onMute,
  onDelete,
  onExport,
  onTag,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  if (!isOpen || !conversation) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48"
      style={{ left: position.x, top: position.y }}>
      <button
        onClick={() => {
          onPin();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
        <PinIcon className="w-4 h-4" />
        <span>
          {conversation.enhancedMetadata.isPinned
            ? t("inbox.unpin")
            : t("inbox.pin")}
        </span>
      </button>

      <button
        onClick={() => {
          onArchive();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
        <ArchiveBoxIcon className="w-4 h-4" />
        <span>
          {conversation.enhancedMetadata.isArchived
            ? t("inbox.unarchive")
            : t("inbox.archive")}
        </span>
      </button>

      <button
        onClick={() => {
          onMute();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
        <SpeakerXMarkIcon className="w-4 h-4" />
        <span>
          {conversation.enhancedMetadata.isMuted
            ? t("inbox.unmute")
            : t("inbox.mute")}
        </span>
      </button>

      <button
        onClick={() => {
          onTag();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
        <TagIcon className="w-4 h-4" />
        <span>{t("inbox.manage_tags")}</span>
      </button>

      <button
        onClick={() => {
          onExport();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
        <ExportIcon className="w-4 h-4" />
        <span>{t("inbox.export")}</span>
      </button>

      <hr className="my-2" />

      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center space-x-2">
        <TrashIcon className="w-4 h-4" />
        <span>{t("inbox.delete")}</span>
      </button>
    </div>
  );
};

// Main component
export const AdvancedConversationList: React.FC<{
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
}> = ({ onConversationSelect, selectedConversationId }) => {
  const { t } = useTranslation();
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    conversation: CachedConversationWithId | null;
  }>({ isOpen: false, position: { x: 0, y: 0 }, conversation: null });

  // Store hooks
  const {
    conversations,
    isLoading,
    unreadCounts,
    userPresence,
    currentUser,
    selectedConversations,
    sync,
    syncStatus,
  } = useAdvancedInboxStore();

  const {
    searchResults,
    isSearching,
    activeFilters,
    searchMessages,
    clearSearch,
    updateSearchFilters,
  } = useSearch();

  const {
    pinConversation,
    archiveConversation,
    muteConversation,
    deleteConversation,
    exportConversation,
    tagConversation,
  } = useConversationManagement();

  const {
    selectConversation,
    selectAllConversations,
    clearSelection,
    bulkArchive,
    bulkMute,
    bulkDelete,
    bulkMarkRead,
  } = useBulkOperations();

  const { executeShortcut } = useKeyboardShortcuts();

  // Local state
  const [viewMode, setViewMode] = useState<"list" | "compact">("list");
  const [showArchived, setShowArchived] = useState(false);
  const [showMuted, setShowMuted] = useState(true);
  const [highlightedConversations, setHighlightedConversations] = useState<
    Set<string>
  >(new Set());

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);

  // Filter conversations based on current view
  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter((conv) => {
      if (!showArchived && conv.enhancedMetadata.isArchived) return false;
      if (!showMuted && conv.enhancedMetadata.isMuted) return false;
      return true;
    });

    // Apply search results if searching
    if (isSearching && searchResults.length > 0) {
      const searchConversationIds = new Set(
        searchResults.map((r) => r.conversation.id),
      );
      filtered = filtered.filter((conv) => searchConversationIds.has(conv.id));
    }

    // Sort conversations
    filtered.sort((a, b) => {
      // Pinned conversations first
      if (a.enhancedMetadata.isPinned && !b.enhancedMetadata.isPinned)
        return -1;
      if (!a.enhancedMetadata.isPinned && b.enhancedMetadata.isPinned) return 1;

      // Then by last message time
      const aTime = a.lastMessage
        ? Number(a.lastMessage.sentAtNs)
        : Number(a.createdAtNs);
      const bTime = b.lastMessage
        ? Number(b.lastMessage.sentAtNs)
        : Number(b.createdAtNs);
      return bTime - aTime;
    });

    return filtered;
  }, [conversations, showArchived, showMuted, isSearching, searchResults]);

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: filteredConversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === "compact" ? 60 : 96),
  });

  // Handle search
  const handleSearch = useCallback(
    (filters: Partial<SearchFilters>) => {
      updateSearchFilters(filters);
      if (filters.query) {
        searchMessages({ ...activeFilters, ...filters });
      } else {
        clearSearch();
      }
    },
    [activeFilters, searchMessages, clearSearch, updateSearchFilters],
  );

  // Handle context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, conversation: CachedConversationWithId) => {
      e.preventDefault();
      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        conversation,
      });
    },
    [],
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      executeShortcut(e.key, e.ctrlKey, e.shiftKey, e.altKey);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [executeShortcut]);

  // Handle conversation actions
  const handlePin = useCallback(async () => {
    if (contextMenu.conversation) {
      await pinConversation(
        contextMenu.conversation.id,
        !contextMenu.conversation.enhancedMetadata.isPinned,
      );
    }
  }, [contextMenu.conversation, pinConversation]);

  const handleArchive = useCallback(async () => {
    if (contextMenu.conversation) {
      await archiveConversation(
        contextMenu.conversation.id,
        !contextMenu.conversation.enhancedMetadata.isArchived,
      );
    }
  }, [contextMenu.conversation, archiveConversation]);

  const handleMute = useCallback(async () => {
    if (contextMenu.conversation) {
      await muteConversation(
        contextMenu.conversation.id,
        !contextMenu.conversation.enhancedMetadata.isMuted,
      );
    }
  }, [contextMenu.conversation, muteConversation]);

  const handleDelete = useCallback(async () => {
    if (contextMenu.conversation && confirm(t("inbox.confirm_delete"))) {
      await deleteConversation(contextMenu.conversation.id);
    }
  }, [contextMenu.conversation, deleteConversation, t]);

  const handleExport = useCallback(async () => {
    if (contextMenu.conversation) {
      try {
        const exportData = await exportConversation(
          contextMenu.conversation.id,
          "json",
        );
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conversation-${contextMenu.conversation.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Export failed:", error);
      }
    }
  }, [contextMenu.conversation, exportConversation]);

  const handleTag = useCallback(async () => {
    if (contextMenu.conversation) {
      const tags = prompt(
        t("inbox.enter_tags"),
        contextMenu.conversation.enhancedMetadata.tags.join(", "),
      );
      if (tags !== null) {
        await tagConversation(
          contextMenu.conversation.id,
          tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        );
      }
    }
  }, [contextMenu.conversation, tagConversation, t]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Bulk actions toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedConversations.length}
        onArchive={() => bulkArchive(true)}
        onMute={() => bulkMute(true)}
        onDelete={() => bulkDelete()}
        onMarkRead={() => bulkMarkRead()}
        onClearSelection={clearSelection}
      />

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("inbox.conversations")} ({filteredConversations.length})
          </h2>

          <div className="flex items-center space-x-2">
            {/* Sync status */}
            <button
              onClick={() => sync()}
              disabled={syncStatus === "syncing"}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                syncStatus === "syncing" ? "animate-spin" : ""
              }`}
              title={t("inbox.sync")}>
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            {/* View mode toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-600"}`}>
                <Bars3Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`p-2 ${viewMode === "compact" ? "bg-gray-900 text-white" : "text-gray-600"}`}>
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`p-2 rounded-lg transition-colors ${
                  showArchived
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={t("inbox.show_archived")}>
                <ArchiveBoxIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMuted(!showMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  showMuted
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={t("inbox.show_muted")}>
                {showMuted ? (
                  <BellIcon className="w-5 h-5" />
                ) : (
                  <BellSlashIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Settings */}
            <button
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title={t("inbox.settings")}>
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <AdvancedSearch
        onFiltersChange={handleSearch}
        activeFilters={activeFilters}
      />

      {/* Conversation list */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-gray-500">{t("inbox.loading")}</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("inbox.no_conversations")}
              </h3>
              <p className="text-gray-500 mb-6">
                {t("inbox.no_conversations_description")}
              </p>
              <button className="gradient-primary text-white px-6 py-3 font-semibold shadow-elegant hover:shadow-modern transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto">
                <PlusIcon className="w-5 h-5" />
                {t("inbox.start_conversation")}
              </button>
            </div>
          </div>
        ) : (
          <div ref={parentRef} className="h-full overflow-auto">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const conversation = filteredConversations[virtualItem.index];
                const isSelected = selectedConversations.includes(
                  conversation.id,
                );
                const isHighlighted = highlightedConversations.has(
                  conversation.id,
                );
                const unreadCount = unreadCounts[conversation.id] || 0;
                const presence = userPresence[conversation.peerAddress] || null;

                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}>
                    <ConversationItem
                      conversation={conversation}
                      isSelected={isSelected}
                      isHighlighted={isHighlighted}
                      unreadCount={unreadCount}
                      userPresence={presence}
                      onSelect={(selected) =>
                        selectConversation(conversation.id, selected)
                      }
                      onClick={() => onConversationSelect(conversation.id)}
                      onContextMenu={(e) => handleContextMenu(e, conversation)}
                      compactMode={viewMode === "compact"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        conversation={contextMenu.conversation}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        onPin={handlePin}
        onArchive={handleArchive}
        onMute={handleMute}
        onDelete={handleDelete}
        onExport={handleExport}
        onTag={handleTag}
      />
    </div>
  );
};
