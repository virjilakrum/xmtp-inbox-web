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
  useMessageManagement,
  useNotifications,
  useKeyboardShortcuts,
  useBulkOperations,
} from "../../../store/advancedInbox";
import { AdvancedConversationList } from "../AdvancedConversationList/AdvancedConversationList";
import { AdvancedMessageDisplay } from "../AdvancedMessageDisplay/AdvancedMessageDisplay";
import { AdvancedMessageInput } from "../AdvancedMessageInput/AdvancedMessageInput";
import { NotificationCenter } from "../NotificationCenter/NotificationCenter";
import { AdvancedSettings } from "../AdvancedSettings/AdvancedSettings";
import { ContactManagement } from "../ContactManagement/ContactManagement";
import { ShortcutHelper } from "../ShortcutHelper/ShortcutHelper";
import type {
  CachedConversationWithId,
  CachedMessageWithId,
  MessageContent,
  NotificationSettings,
} from "../../../types/xmtpV3Types";
// Custom icon components
const Bars3Icon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const Cog6ToothIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const ChatBubbleLeftRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const SpeakerXMarkIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
    />
  </svg>
);

const QuestionMarkCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ArrowsPointingInIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9v4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5m0-4.5h4.5m-4.5 0l5.5 5.5"
    />
  </svg>
);

const ArrowsPointingOutIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
    />
  </svg>
);

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const ComputerDesktopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

// Sidebar navigation
const SidebarNavigation: React.FC<{
  activeView: string;
  onViewChange: (view: string) => void;
  unreadCount: number;
  notificationCount: number;
  isCollapsed: boolean;
}> = ({
  activeView,
  onViewChange,
  unreadCount,
  notificationCount,
  isCollapsed,
}) => {
  const { t } = useTranslation();

  const navItems = [
    {
      id: "conversations",
      label: t("inbox.nav.conversations"),
      icon: ChatBubbleLeftRightIcon,
      badge: unreadCount,
    },
    {
      id: "notifications",
      label: t("inbox.nav.notifications"),
      icon: BellIcon,
      badge: notificationCount,
    },
    {
      id: "contacts",
      label: t("inbox.nav.contacts"),
      icon: UserGroupIcon,
    },
    {
      id: "settings",
      label: t("inbox.nav.settings"),
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <nav
      className={`bg-gray-900 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}>
      <div className="p-4">
        {/* Logo/Title */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">zkλ</span>
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold">{t("inbox.title")}</h1>
          )}
        </div>

        {/* Navigation items */}
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                activeView === item.id
                  ? "bg-white text-gray-900"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {!isCollapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Top header
const InboxHeader: React.FC<{
  currentView: string;
  selectedConversation: CachedConversationWithId | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  currentTheme: "light" | "dark" | "auto";
}> = ({
  currentView,
  selectedConversation,
  isFullscreen,
  onToggleFullscreen,
  onToggleSidebar,
  onToggleTheme,
  currentTheme,
}) => {
  const { t } = useTranslation();

  const getHeaderTitle = () => {
    switch (currentView) {
      case "conversations":
        return selectedConversation
          ? selectedConversation.enhancedMetadata.title ||
              `${selectedConversation.peerAddress.slice(0, 6)}...${selectedConversation.peerAddress.slice(-4)}`
          : t("inbox.nav.conversations");
      case "notifications":
        return t("inbox.nav.notifications");
      case "contacts":
        return t("inbox.nav.contacts");
      case "settings":
        return t("inbox.nav.settings");
      default:
        return t("inbox.title");
    }
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case "light":
        return SunIcon;
      case "dark":
        return MoonIcon;
      default:
        return ComputerDesktopIcon;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bars3Icon className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {getHeaderTitle()}
            </h2>

            {selectedConversation && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {selectedConversation.isGroup && (
                  <span>
                    {selectedConversation.groupInfo?.memberIds.length} members
                  </span>
                )}
                {selectedConversation.enhancedMetadata.isMuted && (
                  <SpeakerXMarkIcon className="w-4 h-4" />
                )}
                {selectedConversation.enhancedMetadata.isPinned && (
                  <span>📌</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={t("inbox.toggle_theme") as string}>
            <ThemeIcon className="w-5 h-5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={t("inbox.toggle_fullscreen") as string}>
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            )}
          </button>

          {/* Help */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={t("inbox.help") as string}>
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

// Empty state component
const EmptyState: React.FC<{
  view: string;
  onAction?: () => void;
}> = ({ view, onAction }) => {
  const { t } = useTranslation();

  const getEmptyStateContent = () => {
    switch (view) {
      case "conversations":
        return {
          icon: ChatBubbleLeftRightIcon,
          title: t("inbox.empty.conversations.title"),
          description: t("inbox.empty.conversations.description"),
          actionLabel: t("inbox.empty.conversations.action"),
        };
      case "notifications":
        return {
          icon: BellIcon,
          title: t("inbox.empty.notifications.title"),
          description: t("inbox.empty.notifications.description"),
        };
      case "contacts":
        return {
          icon: UserGroupIcon,
          title: t("inbox.empty.contacts.title"),
          description: t("inbox.empty.contacts.description"),
          actionLabel: t("inbox.empty.contacts.action"),
        };
      default:
        return {
          icon: ChatBubbleLeftRightIcon,
          title: t("inbox.empty.default.title"),
          description: t("inbox.empty.default.description"),
        };
    }
  };

  const {
    icon: Icon,
    title,
    description,
    actionLabel,
  } = getEmptyStateContent();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="gradient-primary text-white px-6 py-3 font-semibold shadow-elegant hover:shadow-modern transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto">
            <PlusIcon className="w-5 h-5" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// Typing indicator
const TypingIndicator: React.FC<{
  conversation: CachedConversationWithId;
  typingUsers: string[];
}> = ({ conversation, typingUsers }) => {
  const { t } = useTranslation();

  if (typingUsers.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
        <span className="text-sm text-gray-600">
          {typingUsers.length === 1
            ? t("inbox.typing.single", { user: typingUsers[0] })
            : typingUsers.length === 2
              ? t("inbox.typing.double", {
                  user1: typingUsers[0],
                  user2: typingUsers[1],
                })
              : t("inbox.typing.multiple", {
                  user: typingUsers[0],
                  count: typingUsers.length - 1,
                })}
        </span>
      </div>
    </div>
  );
};

// Main component
export const AdvancedInbox: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const { t } = useTranslation();

  // Local state
  const [activeView, setActiveView] = useState("conversations");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutHelper, setShowShortcutHelper] = useState(false);

  // Store hooks
  const {
    conversations,
    messages,
    currentUser,
    totalUnreadCount,
    userPresence,
    sync,
    forceRefresh,
  } = useAdvancedInboxStore();

  const { notifications } = useNotifications();
  const { sendMessage } = useMessageManagement();
  const { executeShortcut } = useKeyboardShortcuts();

  // Computed values
  const selectedConversation = useMemo(() => {
    return (
      conversations.find((conv) => conv.id === selectedConversationId) || null
    );
  }, [conversations, selectedConversationId]);

  const conversationMessages = useMemo(() => {
    return selectedConversationId ? messages[selectedConversationId] || [] : [];
  }, [messages, selectedConversationId]);

  const typingUsers = useMemo(() => {
    if (!selectedConversationId) return [];
    return Object.entries(userPresence)
      .filter(
        ([_, presence]) =>
          presence.isTyping &&
          presence.typingInConversation === selectedConversationId,
      )
      .map(([userId]) => userId);
  }, [userPresence, selectedConversationId]);

  // Effects
  useEffect(() => {
    // Initial sync
    sync();
  }, [sync]);

  useEffect(() => {
    // Handle fullscreen
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setActiveView("conversations");
        // Focus search
      } else if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        // Create new conversation
      } else if (e.key === "Escape") {
        setSelectedConversationId(null);
        setShowShortcutHelper(false);
      } else if (e.key === "F1") {
        e.preventDefault();
        setShowShortcutHelper(true);
      }

      executeShortcut(e.key, e.ctrlKey, e.shiftKey, e.altKey);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [executeShortcut]);

  // Handlers
  const handleConversationSelect = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    setActiveView("conversations");
  }, []);

  const handleSendMessage = useCallback(
    async (content: MessageContent) => {
      if (!selectedConversationId) return;

      try {
        await sendMessage(selectedConversationId, content);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [selectedConversationId, sendMessage],
  );

  const handleMessageAction = useCallback(
    (action: string, messageId: string, data?: any) => {
      switch (action) {
        case "reply":
          // Set reply context in message input
          console.log("Reply to message:", messageId);
          break;
        case "forward":
          // Open forward dialog
          console.log("Forward message:", messageId);
          break;
        case "edit":
          // Enable edit mode
          console.log("Edit message:", messageId);
          break;
        default:
          console.log("Unknown action:", action, messageId, data);
      }
    },
    [],
  );

  const handleThemeToggle = useCallback(() => {
    const themes = ["light", "dark", "auto"] as const;
    const currentIndex = themes.indexOf(currentUser.settings.appearance.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    // Would update user settings
    console.log("Toggle theme to:", nextTheme);
  }, [currentUser.settings.appearance.theme]);

  const renderMainContent = () => {
    switch (activeView) {
      case "conversations":
        return (
          <div className="flex-1 flex h-full">
            {/* Conversation list */}
            <div className="w-1/3 min-w-0 border-r border-gray-200">
              <AdvancedConversationList
                onConversationSelect={handleConversationSelect}
                selectedConversationId={selectedConversationId || undefined}
              />
            </div>

            {/* Message view */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-hidden">
                    <AdvancedMessageDisplay
                      conversation={selectedConversation}
                      messages={conversationMessages}
                      currentUserAddress={currentUser.address}
                      onMessageAction={handleMessageAction}
                    />
                  </div>

                  {/* Typing indicator */}
                  <TypingIndicator
                    conversation={selectedConversation}
                    typingUsers={typingUsers}
                  />

                  {/* Message input */}
                  <AdvancedMessageInput
                    conversation={selectedConversation}
                    onSendMessage={handleSendMessage}
                    placeholder={t("inbox.message_placeholder") as string}
                  />
                </>
              ) : (
                <EmptyState
                  view="select_conversation"
                  onAction={() => {
                    // Create new conversation
                    console.log("Create new conversation");
                  }}
                />
              )}
            </div>
          </div>
        );

      case "notifications":
        return <NotificationCenter />;

      case "contacts":
        return <ContactManagement />;

      case "settings":
        return <AdvancedSettings />;

      default:
        return <EmptyState view={activeView} />;
    }
  };

  return (
    <div
      className={`flex h-full bg-gray-50 ${className} ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}>
      {/* Sidebar */}
      <SidebarNavigation
        activeView={activeView}
        onViewChange={setActiveView}
        unreadCount={totalUnreadCount}
        notificationCount={notifications.filter((n) => !n.isRead).length}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <InboxHeader
          currentView={activeView}
          selectedConversation={selectedConversation}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleTheme={handleThemeToggle}
          currentTheme={currentUser.settings.appearance.theme}
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderMainContent()}</div>
      </div>

      {/* Keyboard shortcut helper */}
      {showShortcutHelper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcutHelper(false)}
                className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <ShortcutHelper />
          </div>
        </div>
      )}
    </div>
  );
};
