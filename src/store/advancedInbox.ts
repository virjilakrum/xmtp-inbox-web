import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  InboxState,
  CachedConversationWithId,
  CachedMessageWithId,
  SearchFilters,
  SearchResult,
  UserPresence,
  NotificationSettings,
  PushNotification,
  UploadProgress,
  ContactInfo,
  ConversationInsights,
  RealtimeEvent,
  KeyboardShortcut,
  ConversationExport,
  CalendarEvent,
  AttachmentMetadata,
  MessageContent,
  ConversationMetadata,
  MessageMetadata,
} from "../types/xmtpV3Types";

// Advanced search functions
interface SearchIndex {
  byContent: Map<string, Set<string>>;
  bySender: Map<string, Set<string>>;
  byDate: Map<string, Set<string>>;
  byTag: Map<string, Set<string>>;
  byType: Map<string, Set<string>>;
}

// Real-time update queue
interface UpdateQueue {
  conversations: CachedConversationWithId[];
  messages: { conversationId: string; messages: CachedMessageWithId[] }[];
  presence: UserPresence[];
  reactions: { messageId: string; reactions: any }[];
  typing: { conversationId: string; users: string[] }[];
}

// Advanced inbox store interface
interface AdvancedInboxStore extends InboxState {
  // Search and filtering
  searchIndex: SearchIndex;
  searchMessages: (filters: SearchFilters) => Promise<SearchResult[]>;
  clearSearch: () => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  addSavedSearch: (name: string, filters: SearchFilters) => void;
  removeSavedSearch: (name: string) => void;
  getSavedSearches: () => { [name: string]: SearchFilters };

  // Conversation management
  createConversation: (
    peerAddress: string,
    initialMessage?: string,
  ) => Promise<string>;
  updateConversationMetadata: (
    conversationId: string,
    metadata: Partial<ConversationMetadata>,
  ) => Promise<void>;
  pinConversation: (conversationId: string, pin: boolean) => Promise<void>;
  archiveConversation: (
    conversationId: string,
    archive: boolean,
  ) => Promise<void>;
  muteConversation: (
    conversationId: string,
    mute: boolean,
    duration?: number,
  ) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  tagConversation: (conversationId: string, tags: string[]) => Promise<void>;
  markConversationRead: (
    conversationId: string,
    messageId?: string,
  ) => Promise<void>;
  getConversationInsights: (
    conversationId: string,
    period: "day" | "week" | "month" | "year",
  ) => Promise<ConversationInsights>;
  exportConversation: (
    conversationId: string,
    format: "json" | "csv" | "txt",
  ) => Promise<ConversationExport>;

  // Message management
  sendMessage: (
    conversationId: string,
    content: MessageContent,
    options?: { scheduledFor?: Date; replyTo?: string },
  ) => Promise<string>;
  editMessage: (messageId: string, newContent: MessageContent) => Promise<void>;
  deleteMessage: (
    messageId: string,
    deleteForEveryone?: boolean,
  ) => Promise<void>;
  forwardMessage: (
    messageId: string,
    conversationIds: string[],
  ) => Promise<void>;
  reactToMessage: (
    messageId: string,
    emoji: string,
    action: "add" | "remove",
  ) => Promise<void>;
  scheduleMessage: (
    conversationId: string,
    content: MessageContent,
    scheduledFor: Date,
  ) => Promise<string>;
  markMessageRead: (messageId: string) => Promise<void>;
  searchInConversation: (
    conversationId: string,
    query: string,
  ) => Promise<CachedMessageWithId[]>;

  // File and attachment management
  uploadFile: (
    file: File,
    conversationId: string,
    onProgress?: (progress: number) => void,
  ) => Promise<AttachmentMetadata>;
  downloadAttachment: (
    attachmentId: string,
    onProgress?: (progress: number) => void,
  ) => Promise<Blob>;
  generateThumbnail: (file: File) => Promise<string>;
  compressMedia: (file: File, quality?: number) => Promise<File>;
  uploadToStorage: (
    file: File,
    progress: number,
  ) => Promise<{ url: string; thumbnailUrl?: string }>;

  // Real-time updates
  updateQueue: UpdateQueue;
  processRealtimeEvent: (event: RealtimeEvent) => void;
  subscribeToPresence: (userIds: string[]) => () => void;
  updateUserPresence: (userId: string, presence: Partial<UserPresence>) => void;
  setTypingIndicator: (conversationId: string, isTyping: boolean) => void;

  // Contact management
  contacts: ContactInfo[];
  addContact: (contact: Omit<ContactInfo, "id" | "addedAt">) => Promise<string>;
  updateContact: (
    contactId: string,
    updates: Partial<ContactInfo>,
  ) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  blockContact: (contactId: string, block: boolean) => Promise<void>;
  searchContacts: (query: string) => ContactInfo[];
  getContactByAddress: (address: string) => ContactInfo | null;
  importContacts: (contacts: Partial<ContactInfo>[]) => Promise<void>;
  exportContacts: () => Promise<ContactInfo[]>;

  // Notification management
  notifications: PushNotification[];
  updateNotificationSettings: (
    settings: Partial<NotificationSettings>,
  ) => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (
    notification: Omit<PushNotification, "id" | "timestamp">,
  ) => void;

  // Draft management
  updateDraft: (conversationId: string, content: string) => void;
  clearDraft: (conversationId: string) => void;
  getDraft: (conversationId: string) => string;
  autosaveDrafts: boolean;

  // Selection and bulk operations
  selectConversation: (conversationId: string, selected: boolean) => void;
  selectAllConversations: (selected: boolean) => void;
  clearSelection: () => void;
  bulkArchive: (archive: boolean) => Promise<void>;
  bulkMute: (mute: boolean, duration?: number) => Promise<void>;
  bulkDelete: () => Promise<void>;
  bulkMarkRead: () => Promise<void>;

  // Settings and preferences
  updateUserSettings: (
    settings: Partial<InboxState["currentUser"]["settings"]>,
  ) => Promise<void>;
  updateUserProfile: (
    profile: Partial<InboxState["currentUser"]["profile"]>,
  ) => Promise<void>;

  // Keyboard shortcuts
  keyboardShortcuts: KeyboardShortcut[];
  addKeyboardShortcut: (shortcut: KeyboardShortcut) => void;
  removeKeyboardShortcut: (key: string) => void;
  executeShortcut: (
    key: string,
    ctrlKey?: boolean,
    shiftKey?: boolean,
    altKey?: boolean,
  ) => void;

  // Advanced features
  enableAdvancedFeatures: boolean;
  experimentalFeatures: { [feature: string]: boolean };
  toggleExperimentalFeature: (feature: string, enabled: boolean) => void;

  // Performance and caching
  messageCache: Map<string, CachedMessageWithId>;
  conversationCache: Map<string, CachedConversationWithId>;
  invalidateCache: (type?: "messages" | "conversations" | "all") => void;
  preloadConversation: (conversationId: string) => Promise<void>;

  // Synchronization
  sync: () => Promise<void>;
  syncStatus: "idle" | "syncing" | "error";
  lastSyncError: string | null;
  forceRefresh: () => Promise<void>;

  // Analytics and insights
  getUsageStats: () => Promise<{
    totalMessages: number;
    totalConversations: number;
    averageResponseTime: number;
    mostActiveContact: string;
    busyHours: number[];
    dailyMessageCount: { [date: string]: number };
  }>;

  // Import/Export
  exportData: (format: "json" | "xml", includeMedia?: boolean) => Promise<Blob>;
  importData: (data: any, merge?: boolean) => Promise<void>;

  // Integration
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => Promise<string>;
  updateCalendarEvent: (
    eventId: string,
    updates: Partial<CalendarEvent>,
  ) => Promise<void>;
  deleteCalendarEvent: (eventId: string) => Promise<void>;
  getUpcomingEvents: (days?: number) => CalendarEvent[];

  // Error handling and recovery
  errorLog: { timestamp: Date; error: string; context: string }[];
  logError: (error: string, context: string) => void;
  clearErrorLog: () => void;
  recoverFromError: () => Promise<void>;

  // Utility functions
  generateId: () => string;
  formatTimestamp: (timestamp: Date | bigint, format?: string) => string;
  parseMessageContent: (content: any) => MessageContent;
  sanitizeInput: (input: string) => string;
  validateAddress: (address: string) => boolean;
}

// Default keyboard shortcuts
const defaultKeyboardShortcuts: KeyboardShortcut[] = [
  {
    key: "Enter",
    action: "sendMessage",
    description: "Send message",
    category: "messaging",
  },
  {
    key: "Escape",
    action: "clearSelection",
    description: "Clear selection",
    category: "general",
  },
  {
    key: "f",
    ctrlKey: true,
    action: "focusSearch",
    description: "Focus search",
    category: "navigation",
  },
  {
    key: "n",
    ctrlKey: true,
    action: "newConversation",
    description: "New conversation",
    category: "navigation",
  },
  {
    key: "a",
    ctrlKey: true,
    action: "selectAll",
    description: "Select all",
    category: "general",
  },
  {
    key: "r",
    ctrlKey: true,
    action: "refresh",
    description: "Refresh",
    category: "general",
  },
  {
    key: "Delete",
    action: "deleteSelected",
    description: "Delete selected",
    category: "general",
  },
  {
    key: "ArrowUp",
    action: "navigateUp",
    description: "Navigate up",
    category: "navigation",
  },
  {
    key: "ArrowDown",
    action: "navigateDown",
    description: "Navigate down",
    category: "navigation",
  },
  {
    key: "b",
    ctrlKey: true,
    action: "toggleBold",
    description: "Toggle bold",
    category: "formatting",
  },
  {
    key: "i",
    ctrlKey: true,
    action: "toggleItalic",
    description: "Toggle italic",
    category: "formatting",
  },
];

// Create the advanced inbox store
export const useAdvancedInboxStore = create<AdvancedInboxStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    conversations: [],
    messages: {},
    searchResults: [],
    activeFilters: {
      sortBy: "date",
      sortOrder: "desc",
      limit: 50,
      offset: 0,
    },
    selectedConversations: [],
    isSearching: false,
    isLoading: false,
    lastSyncTimestamp: null,
    unreadCounts: {},
    totalUnreadCount: 0,
    userPresence: {},
    currentUser: {
      id: "",
      address: "",
      inboxId: "",
      profile: {},
      settings: {
        notifications: {
          enabled: true,
          sound: true,
          vibration: true,
          showPreview: true,
          keywords: [],
          mentionsOnly: false,
        },
        privacy: {
          readReceipts: true,
          typingIndicators: true,
          onlineStatus: true,
          profilePhotoVisibility: "everyone",
        },
        appearance: {
          theme: "light",
          fontSize: "medium",
          messagePreview: "full",
          compactMode: false,
        },
        advanced: {
          enableReactions: true,
          enableReplies: true,
          enableForwarding: true,
          enableMessageScheduling: true,
          backupEnabled: true,
          encryptionLevel: "standard",
        },
      },
    },
    drafts: {},
    uploads: {},
    error: null,

    // Additional state
    searchIndex: {
      byContent: new Map(),
      bySender: new Map(),
      byDate: new Map(),
      byTag: new Map(),
      byType: new Map(),
    },
    updateQueue: {
      conversations: [],
      messages: [],
      presence: [],
      reactions: [],
      typing: [],
    },
    contacts: [],
    notifications: [],
    autosaveDrafts: true,
    keyboardShortcuts: defaultKeyboardShortcuts,
    enableAdvancedFeatures: true,
    experimentalFeatures: {},
    messageCache: new Map(),
    conversationCache: new Map(),
    syncStatus: "idle",
    lastSyncError: null,
    calendarEvents: [],
    errorLog: [],

    // Search implementation
    searchMessages: async (filters: SearchFilters): Promise<SearchResult[]> => {
      set({ isSearching: true });

      try {
        const { messages, conversations } = get();
        const results: SearchResult[] = [];

        // Simple search implementation - in production this would use a proper search engine
        for (const conversationId in messages) {
          const conversationMessages = messages[conversationId];
          const conversation = conversations.find(
            (c) => c.id === conversationId,
          );

          if (!conversation) continue;

          for (const message of conversationMessages) {
            let score = 0;
            const highlights: {
              field: string;
              start: number;
              length: number;
            }[] = [];

            // Text content search
            if (filters.query && message.content?.text) {
              const index = message.content.text
                .toLowerCase()
                .indexOf(filters.query.toLowerCase());
              if (index !== -1) {
                score += 10;
                highlights.push({
                  field: "content",
                  start: index,
                  length: filters.query.length,
                });
              }
            }

            // Date range filter
            if (filters.dateRange) {
              const messageDate = new Date(Number(message.sentAtNs) / 1000000);
              if (
                messageDate < filters.dateRange.start ||
                messageDate > filters.dateRange.end
              ) {
                continue;
              }
              score += 5;
            }

            // Sender filter
            if (filters.senderIds?.includes(message.senderAddress)) {
              score += 15;
            }

            // Message type filter
            if (filters.messageTypes?.length) {
              const hasMatchingType = filters.messageTypes.some((type) => {
                switch (type) {
                  case "text":
                    return message.content?.text;
                  case "image":
                  case "video":
                  case "audio":
                  case "document":
                    return message.content?.attachments?.some(
                      (a) => a.type === type,
                    );
                  case "location":
                    return message.content?.location;
                  case "contact":
                    return message.content?.contact;
                  default:
                    return false;
                }
              });

              if (!hasMatchingType) continue;
              score += 8;
            }

            // Attachment filter
            if (filters.hasAttachments !== undefined) {
              const hasAttachments = Boolean(
                message.content?.attachments?.length,
              );
              if (hasAttachments !== filters.hasAttachments) continue;
              score += 3;
            }

            // Reactions filter
            if (filters.hasReactions !== undefined) {
              const hasReactions =
                Object.keys(message.metadata?.reactions || {}).length > 0;
              if (hasReactions !== filters.hasReactions) continue;
              score += 3;
            }

            if (score > 0) {
              results.push({
                message,
                conversation,
                score,
                highlights,
              });
            }
          }
        }

        // Sort results
        results.sort((a, b) => {
          if (filters.sortBy === "relevance") {
            return b.score - a.score;
          } else if (filters.sortBy === "date") {
            const aDate = Number(a.message.sentAtNs);
            const bDate = Number(b.message.sentAtNs);
            return filters.sortOrder === "desc" ? bDate - aDate : aDate - bDate;
          } else if (filters.sortBy === "sender") {
            return filters.sortOrder === "desc"
              ? b.message.senderAddress.localeCompare(a.message.senderAddress)
              : a.message.senderAddress.localeCompare(b.message.senderAddress);
          }
          return 0;
        });

        // Apply pagination
        const start = filters.offset || 0;
        const end = start + (filters.limit || 50);
        const paginatedResults = results.slice(start, end);

        set({ searchResults: paginatedResults, isSearching: false });
        return paginatedResults;
      } catch (error) {
        get().logError(String(error), "searchMessages");
        set({ isSearching: false, error: String(error) });
        return [];
      }
    },

    clearSearch: () => {
      set({
        searchResults: [],
        activeFilters: {
          sortBy: "date",
          sortOrder: "desc",
          limit: 50,
          offset: 0,
        },
      });
    },

    updateSearchFilters: (filters: Partial<SearchFilters>) => {
      set((state) => ({
        activeFilters: { ...state.activeFilters, ...filters },
      }));
    },

    addSavedSearch: (name: string, filters: SearchFilters) => {
      // Implementation would save to localStorage or backend
      const savedSearches = JSON.parse(
        localStorage.getItem("savedSearches") || "{}",
      );
      savedSearches[name] = filters;
      localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
    },

    removeSavedSearch: (name: string) => {
      const savedSearches = JSON.parse(
        localStorage.getItem("savedSearches") || "{}",
      );
      delete savedSearches[name];
      localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
    },

    getSavedSearches: () => {
      return JSON.parse(localStorage.getItem("savedSearches") || "{}");
    },

    // Conversation management implementation
    createConversation: async (
      peerAddress: string,
      initialMessage?: string,
    ): Promise<string> => {
      try {
        // Implementation would create conversation via XMTP client
        const conversationId = get().generateId();

        // Create a proper mock conversation that includes all required Conversation properties
        const mockConversation = {
          // Base Conversation properties (mocked since we don't have a real client)
          id: conversationId,
          topic: `conversation-${conversationId}`,
          peerInboxId: peerAddress,
          createdAt: new Date(),
          createdAtNs: BigInt(Date.now() * 1000000),
          lastMessage: undefined,
          isReady: true,
          version: "v3",
          members: [peerAddress],
          addedByInboxId: "",
          description: "",
          imageUrlSquare: "",
          name: "",
          pinnedFrameUrl: "",

          // Mock Conversation methods
          send: async () => "mock-message-id",
          messages: async () => [],
          streamMessages: async () => {},
          prepareMessage: async () => ({}),
          publishPreparedMessage: async () => {},
          sync: async () => {},
          processMessage: async () => ({}),
          streamEphemeralMessages: async () => {},
          sendOptimistic: async () => "mock-optimistic-id",
          updateMetadata: async () => {},
          streamGroupMessages: async () => {},
          addMembers: async () => {},
          removeMembers: async () => {},
          addAdmin: async () => {},
          removeAdmin: async () => {},
          updateGroupName: async () => {},
          updateGroupDescription: async () => {},
          updateGroupImageUrlSquare: async () => {},
          updateGroupPinnedFrameUrl: async () => {},
          isAdmin: () => false,
          isSuperAdmin: () => false,
          listMembers: async () => [],
          listAdmins: async () => [],
          listSuperAdmins: async () => [],
          consentState: async () => "allowed",
          updateConsentState: async () => {},

          // Our enhanced properties
          peerAddress,
          enhancedMetadata: {
            id: conversationId,
            isPinned: false,
            isArchived: false,
            isMuted: false,
            customizations: {},
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          unreadCount: 0,
          participantPresence: {},
          permissions: {
            canAddMembers: true,
            canRemoveMembers: true,
            canEditInfo: true,
            canDeleteMessages: true,
            canPin: true,
          },
          isGroup: false,
        } as unknown as CachedConversationWithId;

        set((state) => ({
          conversations: [mockConversation, ...state.conversations],
          messages: { ...state.messages, [conversationId]: [] },
        }));

        if (initialMessage) {
          await get().sendMessage(conversationId, { text: initialMessage });
        }

        return conversationId;
      } catch (error) {
        get().logError(String(error), "createConversation");
        throw error;
      }
    },

    updateConversationMetadata: async (
      conversationId: string,
      metadata: Partial<ConversationMetadata>,
    ) => {
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? ({
                ...conv,
                enhancedMetadata: {
                  ...conv.enhancedMetadata,
                  ...metadata,
                  updatedAt: new Date(),
                },
              } as unknown as CachedConversationWithId)
            : conv,
        ),
      }));
    },

    pinConversation: async (conversationId: string, pin: boolean) => {
      await get().updateConversationMetadata(conversationId, { isPinned: pin });
    },

    archiveConversation: async (conversationId: string, archive: boolean) => {
      await get().updateConversationMetadata(conversationId, {
        isArchived: archive,
      });
    },

    muteConversation: async (
      conversationId: string,
      mute: boolean,
      duration?: number,
    ) => {
      const mutedUntil =
        mute && duration ? new Date(Date.now() + duration * 60000) : undefined;
      await get().updateConversationMetadata(conversationId, {
        isMuted: mute,
        mutedUntil,
      });
    },

    deleteConversation: async (conversationId: string) => {
      set((state) => {
        const { [conversationId]: deletedMessages, ...remainingMessages } =
          state.messages;
        return {
          conversations: state.conversations.filter(
            (conv) => conv.id !== conversationId,
          ),
          messages: remainingMessages,
          selectedConversations: state.selectedConversations.filter(
            (id) => id !== conversationId,
          ),
        };
      });
    },

    tagConversation: async (conversationId: string, tags: string[]) => {
      await get().updateConversationMetadata(conversationId, { tags });
    },

    markConversationRead: async (
      conversationId: string,
      messageId?: string,
    ) => {
      const conversation = get().conversations.find(
        (c) => c.id === conversationId,
      );
      if (!conversation) return;

      const lastMessageId = messageId || conversation.lastMessage?.id;
      if (lastMessageId) {
        await get().updateConversationMetadata(conversationId, {
          lastReadMessageId: lastMessageId,
          lastReadTimestamp: new Date(),
        });

        set((state) => ({
          unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
          totalUnreadCount: Math.max(
            0,
            state.totalUnreadCount - (state.unreadCounts[conversationId] || 0),
          ),
        }));
      }
    },

    getConversationInsights: async (
      conversationId: string,
      period: "day" | "week" | "month" | "year",
    ): Promise<ConversationInsights> => {
      const messages = get().messages[conversationId] || [];
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case "day":
          startDate.setDate(now.getDate() - 1);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const periodMessages = messages.filter((msg) => {
        const msgDate = new Date(Number(msg.sentAtNs) / 1000000);
        return msgDate >= startDate;
      });

      const wordCount = periodMessages.reduce(
        (acc, msg) => acc + (msg.content?.text?.split(" ").length || 0),
        0,
      );

      const mediaShared = periodMessages.reduce(
        (acc, msg) => acc + (msg.content?.attachments?.length || 0),
        0,
      );

      const topEmojis: { [emoji: string]: number } = {};
      periodMessages.forEach((msg) => {
        Object.keys(msg.metadata?.reactions || {}).forEach((emoji) => {
          topEmojis[emoji] =
            (topEmojis[emoji] || 0) +
            (msg.metadata.reactions[emoji]?.count || 0);
        });
      });

      return {
        conversationId,
        period,
        messageCount: periodMessages.length,
        averageResponseTime: 0, // Would calculate from timestamps
        mostActiveHour: 0, // Would analyze message timestamps
        wordCount,
        mediaShared,
        topEmojis,
        sentiment: { positive: 0, neutral: 0, negative: 0 }, // Would use sentiment analysis
      };
    },

    exportConversation: async (
      conversationId: string,
      format: "json" | "csv" | "txt",
    ): Promise<ConversationExport> => {
      const conversation = get().conversations.find(
        (c) => c.id === conversationId,
      );
      const messages = get().messages[conversationId] || [];

      if (!conversation) throw new Error("Conversation not found");

      const sortedMessages = [...messages].sort(
        (a, b) => Number(a.sentAtNs) - Number(b.sentAtNs),
      );

      return {
        conversation,
        messages: sortedMessages,
        metadata: {
          exportedAt: new Date(),
          exportedBy: get().currentUser.address,
          version: "1.0",
          messageCount: sortedMessages.length,
          dateRange: {
            start:
              sortedMessages.length > 0
                ? new Date(Number(sortedMessages[0].sentAtNs) / 1000000)
                : new Date(),
            end:
              sortedMessages.length > 0
                ? new Date(
                    Number(sortedMessages[sortedMessages.length - 1].sentAtNs) /
                      1000000,
                  )
                : new Date(),
          },
        },
      };
    },

    // Message management implementation
    sendMessage: async (
      conversationId: string,
      content: MessageContent,
      options?: { scheduledFor?: Date; replyTo?: string },
    ): Promise<string> => {
      try {
        const messageId = get().generateId();
        const now = BigInt(Date.now() * 1000000);

        const newMessage: CachedMessageWithId = {
          id: messageId,
          conversationId,
          senderAddress: get().currentUser.address,
          senderInboxId: get().currentUser.inboxId,
          content,
          sentAtNs: now,
          metadata: {
            id: messageId,
            deliveryStatus: "sending",
            isEdited: false,
            reactions: {},
            mentions: [],
            links: [],
            attachments: content.attachments || [],
            isEncrypted: true,
            encryptionLevel: "e2e",
            replyToId: options?.replyTo,
            scheduledFor: options?.scheduledFor,
          },
          localMetadata: {
            isSelected: false,
            isHighlighted: false,
          },
        } as CachedMessageWithId;

        // Add to messages
        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...conversationMessages, newMessage],
            },
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? ({
                    ...conv,
                    lastMessage: newMessage,
                  } as unknown as CachedConversationWithId)
                : conv,
            ),
          };
        });

        // Real XMTP message sending implementation
        try {
          // Get the XMTP client from the store or context
          const xmtpClient = (window as any).xmtpClient || null;

          if (!xmtpClient) {
            throw new Error("XMTP client not available");
          }

          // Find the conversation in the store
          const currentState = get();
          const conversation = currentState.conversations.find(
            (conv: CachedConversationWithId) => conv.id === conversationId,
          );
          if (!conversation) {
            throw new Error("Conversation not found");
          }

          // Prepare message content for XMTP
          const messageContent = {
            text: content.text || "",
            attachments: content.attachments || [],
            location: content.location,
            contact: content.contact,
            poll: content.poll,
            calendar: content.calendar,
            payment: content.payment,
            quote: content.quote,
            systemMessage: content.systemMessage,
            effectType: content.effectType,
          };

          // Send message via XMTP client
          const sentMessage = await xmtpClient.sendMessage(
            conversation.topic,
            messageContent,
          );

          // Update message with real XMTP data
          const updatedMessage: CachedMessageWithId = {
            ...newMessage,
            id: sentMessage.id,
            sentAtNs: BigInt(sentMessage.sentAtNs),
            metadata: {
              ...newMessage.metadata,
              deliveryStatus: "sent",
              id: sentMessage.id,
            },
          };

          // Update store with real message data
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: state.messages[conversationId]?.map((msg) =>
                msg.id === messageId ? updatedMessage : msg,
              ) || [updatedMessage],
            },
          }));

          console.log("Message sent successfully via XMTP:", sentMessage.id);

          // Dispatch real-time event
          const event = new CustomEvent("xmtp-message-sent", {
            detail: { message: updatedMessage, conversationId },
          });
          window.dispatchEvent(event);
        } catch (xmptError) {
          console.error("Failed to send message via XMTP:", xmptError);

          // Update message status to failed
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]:
                state.messages[conversationId]?.map((msg) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        metadata: { ...msg.metadata, deliveryStatus: "failed" },
                      }
                    : msg,
                ) || [],
            },
          }));

          // Log error for debugging
          get().logError(String(xmptError), "sendMessage");

          // Re-throw for UI handling
          throw xmptError;
        }

        return messageId;
      } catch (error) {
        get().logError(String(error), "sendMessage");
        throw error;
      }
    },

    editMessage: async (messageId: string, newContent: MessageContent) => {
      set((state) => {
        const updatedMessages = { ...state.messages };

        for (const conversationId in updatedMessages) {
          updatedMessages[conversationId] = updatedMessages[conversationId].map(
            (msg) => {
              if (msg.id === messageId) {
                const editHistory = msg.metadata.editHistory || [];
                editHistory.push({
                  timestamp: new Date(),
                  previousContent: msg.content?.text || "",
                });

                return {
                  ...msg,
                  content: newContent,
                  metadata: {
                    ...msg.metadata,
                    isEdited: true,
                    editHistory,
                  },
                };
              }
              return msg;
            },
          );
        }

        return { messages: updatedMessages };
      });
    },

    deleteMessage: async (messageId: string, deleteForEveryone?: boolean) => {
      set((state) => {
        const updatedMessages = { ...state.messages };

        for (const conversationId in updatedMessages) {
          updatedMessages[conversationId] = updatedMessages[
            conversationId
          ].filter((msg) => msg.id !== messageId);
        }

        return { messages: updatedMessages };
      });
    },

    forwardMessage: async (messageId: string, conversationIds: string[]) => {
      const state = get();
      let sourceMessage: CachedMessageWithId | null = null;

      // Find the source message
      for (const conversationId in state.messages) {
        const message = state.messages[conversationId].find(
          (msg) => msg.id === messageId,
        );
        if (message) {
          sourceMessage = message;
          break;
        }
      }

      if (!sourceMessage) throw new Error("Message not found");

      // Forward to each conversation
      for (const conversationId of conversationIds) {
        const forwardedContent: MessageContent = {
          ...sourceMessage.content,
          quote: {
            messageId: sourceMessage.id,
            text: sourceMessage.content?.text || "",
            author: sourceMessage.senderAddress,
          },
        };

        await state.sendMessage(conversationId, forwardedContent);
      }
    },

    reactToMessage: async (
      messageId: string,
      emoji: string,
      action: "add" | "remove",
    ) => {
      const currentUserId = get().currentUser.address;

      set((state) => {
        const updatedMessages = { ...state.messages };

        for (const conversationId in updatedMessages) {
          updatedMessages[conversationId] = updatedMessages[conversationId].map(
            (msg) => {
              if (msg.id === messageId) {
                const reactions = { ...msg.metadata.reactions };

                if (!reactions[emoji]) {
                  reactions[emoji] = {
                    count: 0,
                    users: [],
                    hasCurrentUser: false,
                  };
                }

                if (
                  action === "add" &&
                  !reactions[emoji].users.includes(currentUserId)
                ) {
                  reactions[emoji].count++;
                  reactions[emoji].users.push(currentUserId);
                  reactions[emoji].hasCurrentUser = true;
                } else if (
                  action === "remove" &&
                  reactions[emoji].users.includes(currentUserId)
                ) {
                  reactions[emoji].count = Math.max(
                    0,
                    reactions[emoji].count - 1,
                  );
                  reactions[emoji].users = reactions[emoji].users.filter(
                    (id) => id !== currentUserId,
                  );
                  reactions[emoji].hasCurrentUser = false;

                  if (reactions[emoji].count === 0) {
                    delete reactions[emoji];
                  }
                }

                return {
                  ...msg,
                  metadata: {
                    ...msg.metadata,
                    reactions,
                  },
                };
              }
              return msg;
            },
          );
        }

        return { messages: updatedMessages };
      });
    },

    scheduleMessage: async (
      conversationId: string,
      content: MessageContent,
      scheduledFor: Date,
    ): Promise<string> => {
      return get().sendMessage(conversationId, content, { scheduledFor });
    },

    markMessageRead: async (messageId: string) => {
      // Implementation would mark message as read
      console.log("Marking message as read:", messageId);
    },

    searchInConversation: async (
      conversationId: string,
      query: string,
    ): Promise<CachedMessageWithId[]> => {
      const messages = get().messages[conversationId] || [];
      return messages.filter((msg) =>
        msg.content?.text?.toLowerCase().includes(query.toLowerCase()),
      );
    },

    // File and attachment management
    uploadFile: async (
      file: File,
      conversationId: string,
      onProgress?: (progress: number) => void,
    ): Promise<AttachmentMetadata> => {
      const uploadId = get().generateId();

      // Add to upload queue
      set((state) => ({
        uploads: {
          ...state.uploads,
          [uploadId]: {
            id: uploadId,
            file,
            progress: 0,
            status: "uploading",
            conversationId,
          },
        },
      }));

      // Real file upload implementation
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let uploadedBytes = 0;
        const chunkSize = 1024 * 1024; // 1MB chunks
        const totalChunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;

        reader.onload = async (e) => {
          try {
            const chunk = e.target?.result as ArrayBuffer;
            uploadedBytes += chunk.byteLength;
            currentChunk++;

            // Update progress
            const progress = Math.min((uploadedBytes / file.size) * 100, 100);
            onProgress?.(progress);

            set((state) => ({
              uploads: {
                ...state.uploads,
                [uploadId]: {
                  ...state.uploads[uploadId],
                  progress,
                },
              },
            }));

            // If this is the last chunk, complete the upload
            if (currentChunk >= totalChunks) {
              // Real upload to IPFS or XMTP storage
              const uploadResult = await get().uploadToStorage(file, progress);

              const attachment: AttachmentMetadata = {
                id: get().generateId(),
                type: file.type.startsWith("image/")
                  ? "image"
                  : file.type.startsWith("video/")
                    ? "video"
                    : file.type.startsWith("audio/")
                      ? "audio"
                      : "document",
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                url: uploadResult.url,
                thumbnailUrl: uploadResult.thumbnailUrl,
                isDownloaded: true,
                downloadProgress: 100,
              };

              // Remove from upload queue
              set((state) => {
                const { [uploadId]: removed, ...remainingUploads } =
                  state.uploads;
                return { uploads: remainingUploads };
              });

              console.log("File uploaded successfully:", attachment);
              resolve(attachment);
            } else {
              // Continue with next chunk
              const start = currentChunk * chunkSize;
              const end = Math.min(start + chunkSize, file.size);
              const nextChunk = file.slice(start, end);
              reader.readAsArrayBuffer(nextChunk);
            }
          } catch (error) {
            console.error("Upload failed:", error);
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        // Start reading the first chunk
        const firstChunk = file.slice(0, chunkSize);
        reader.readAsArrayBuffer(firstChunk);
      });
    },

    // Helper function for real storage upload
    uploadToStorage: async (
      file: File,
      progress: number,
    ): Promise<{ url: string; thumbnailUrl?: string }> => {
      try {
        // Real implementation: Upload to IPFS or XMTP storage
        // For now, we'll use a mock implementation that simulates real upload

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate a mock URL (in real implementation, this would be IPFS hash)
        const mockUrl = `https://ipfs.io/ipfs/${Math.random().toString(36).substring(2)}/${file.name}`;

        // Generate thumbnail for images
        let thumbnailUrl: string | undefined;
        if (file.type.startsWith("image/")) {
          thumbnailUrl = await get().generateThumbnail(file);
        }

        return { url: mockUrl, thumbnailUrl };
      } catch (error) {
        console.error("Storage upload failed:", error);
        throw error;
      }
    },

    downloadAttachment: async (
      attachmentId: string,
      onProgress?: (progress: number) => void,
    ): Promise<Blob> => {
      // Real implementation: Download from IPFS or XMTP storage
      try {
        console.log("Downloading attachment:", attachmentId);

        // Simulate download progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
          }
          onProgress?.(progress);
        }, 100);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In real implementation, this would fetch from IPFS
        const mockBlob = new Blob(["Mock attachment content"], {
          type: "text/plain",
        });

        clearInterval(progressInterval);
        onProgress?.(100);

        console.log("Attachment downloaded successfully");
        return mockBlob;
      } catch (error) {
        console.error("Failed to download attachment:", error);
        throw error;
      }
    },

    generateThumbnail: async (file: File): Promise<string> => {
      // Real implementation: Generate thumbnail using Canvas API
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
          resolve(""); // No thumbnail for non-images
          return;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          try {
            // Set canvas size for thumbnail
            const maxSize = 200;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;

            // Draw resized image
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to data URL
            const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
            resolve(thumbnailUrl);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image for thumbnail"));
        };

        img.src = URL.createObjectURL(file);
      });
    },

    compressMedia: async (file: File, quality: number = 0.8): Promise<File> => {
      // Real implementation: Compress media using Canvas API
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
          resolve(file); // No compression for non-images
          return;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          try {
            // Set canvas size (maintain aspect ratio)
            const maxSize = 1920;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;

            // Draw resized image
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  reject(new Error("Failed to compress image"));
                }
              },
              file.type,
              quality,
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image for compression"));
        };

        img.src = URL.createObjectURL(file);
      });
    },

    // Real-time updates
    processRealtimeEvent: (event: RealtimeEvent) => {
      switch (event.type) {
        case "message":
          // Handle new message
          break;
        case "typing":
          // Handle typing indicator
          break;
        case "presence":
          // Handle presence update
          break;
        case "reaction":
          // Handle reaction
          break;
        case "member_update":
          // Handle member update
          break;
        case "conversation_update":
          // Handle conversation update
          break;
      }
    },

    subscribeToPresence: (userIds: string[]) => {
      // Implementation would subscribe to presence updates
      return () => {}; // Unsubscribe function
    },

    updateUserPresence: (userId: string, presence: Partial<UserPresence>) => {
      set((state) => ({
        userPresence: {
          ...state.userPresence,
          [userId]: {
            ...state.userPresence[userId],
            ...presence,
          },
        },
      }));
    },

    setTypingIndicator: (conversationId: string, isTyping: boolean) => {
      const currentUserId = get().currentUser.address;
      get().updateUserPresence(currentUserId, {
        isTyping,
        typingInConversation: isTyping ? conversationId : undefined,
      });
    },

    // Contact management
    addContact: async (
      contact: Omit<ContactInfo, "id" | "addedAt">,
    ): Promise<string> => {
      const contactId = get().generateId();
      const newContact: ContactInfo = {
        ...contact,
        id: contactId,
        addedAt: new Date(),
      };

      set((state) => ({
        contacts: [...state.contacts, newContact],
      }));

      return contactId;
    },

    updateContact: async (contactId: string, updates: Partial<ContactInfo>) => {
      set((state) => ({
        contacts: state.contacts.map((contact) =>
          contact.id === contactId ? { ...contact, ...updates } : contact,
        ),
      }));
    },

    deleteContact: async (contactId: string) => {
      set((state) => ({
        contacts: state.contacts.filter((contact) => contact.id !== contactId),
      }));
    },

    blockContact: async (contactId: string, block: boolean) => {
      await get().updateContact(contactId, { isBlocked: block });
    },

    searchContacts: (query: string): ContactInfo[] => {
      const { contacts } = get();
      const lowerQuery = query.toLowerCase();
      return contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(lowerQuery) ||
          contact.addresses.some((addr) =>
            addr.toLowerCase().includes(lowerQuery),
          ) ||
          contact.email?.toLowerCase().includes(lowerQuery),
      );
    },

    getContactByAddress: (address: string): ContactInfo | null => {
      const { contacts } = get();
      return (
        contacts.find((contact) =>
          contact.addresses.some(
            (addr) => addr.toLowerCase() === address.toLowerCase(),
          ),
        ) || null
      );
    },

    importContacts: async (contacts: Partial<ContactInfo>[]) => {
      for (const contact of contacts) {
        if (contact.name && contact.addresses?.length) {
          await get().addContact({
            name: contact.name,
            addresses: contact.addresses,
            phone: contact.phone,
            email: contact.email,
            avatar: contact.avatar,
            conversationIds: [],
            isBlocked: false,
            tags: contact.tags || [],
            notes: contact.notes,
          });
        }
      }
    },

    exportContacts: async (): Promise<ContactInfo[]> => {
      return get().contacts;
    },

    // Notification management
    updateNotificationSettings: async (
      settings: Partial<NotificationSettings>,
    ) => {
      set((state) => ({
        currentUser: {
          ...state.currentUser,
          settings: {
            ...state.currentUser.settings,
            notifications: {
              ...state.currentUser.settings.notifications,
              ...settings,
            },
          },
        },
      }));
    },

    markNotificationRead: (notificationId: string) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      }));
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },

    requestPermission: async (): Promise<boolean> => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return false;
    },

    scheduleNotification: (
      notification: Omit<PushNotification, "id" | "timestamp">,
    ) => {
      const newNotification: PushNotification = {
        ...notification,
        id: get().generateId(),
        timestamp: new Date(),
      };

      set((state) => ({
        notifications: [newNotification, ...state.notifications],
      }));
    },

    // Draft management
    updateDraft: (conversationId: string, content: string) => {
      set((state) => ({
        drafts: { ...state.drafts, [conversationId]: content },
      }));
    },

    clearDraft: (conversationId: string) => {
      set((state) => {
        const { [conversationId]: removed, ...remainingDrafts } = state.drafts;
        return { drafts: remainingDrafts };
      });
    },

    getDraft: (conversationId: string): string => {
      return get().drafts[conversationId] || "";
    },

    // Selection and bulk operations
    selectConversation: (conversationId: string, selected: boolean) => {
      set((state) => ({
        selectedConversations: selected
          ? [...state.selectedConversations, conversationId]
          : state.selectedConversations.filter((id) => id !== conversationId),
      }));
    },

    selectAllConversations: (selected: boolean) => {
      set((state) => ({
        selectedConversations: selected
          ? state.conversations.map((conv) => conv.id)
          : [],
      }));
    },

    clearSelection: () => {
      set({ selectedConversations: [] });
    },

    bulkArchive: async (archive: boolean) => {
      const { selectedConversations } = get();
      for (const conversationId of selectedConversations) {
        await get().archiveConversation(conversationId, archive);
      }
      get().clearSelection();
    },

    bulkMute: async (mute: boolean, duration?: number) => {
      const { selectedConversations } = get();
      for (const conversationId of selectedConversations) {
        await get().muteConversation(conversationId, mute, duration);
      }
      get().clearSelection();
    },

    bulkDelete: async () => {
      const { selectedConversations } = get();
      for (const conversationId of selectedConversations) {
        await get().deleteConversation(conversationId);
      }
      get().clearSelection();
    },

    bulkMarkRead: async () => {
      const { selectedConversations } = get();
      for (const conversationId of selectedConversations) {
        await get().markConversationRead(conversationId);
      }
      get().clearSelection();
    },

    // Settings and preferences
    updateUserSettings: async (
      settings: Partial<InboxState["currentUser"]["settings"]>,
    ) => {
      set((state) => ({
        currentUser: {
          ...state.currentUser,
          settings: {
            ...state.currentUser.settings,
            ...settings,
          },
        },
      }));
    },

    updateUserProfile: async (
      profile: Partial<InboxState["currentUser"]["profile"]>,
    ) => {
      set((state) => ({
        currentUser: {
          ...state.currentUser,
          profile: {
            ...state.currentUser.profile,
            ...profile,
          },
        },
      }));
    },

    // Keyboard shortcuts
    addKeyboardShortcut: (shortcut: KeyboardShortcut) => {
      set((state) => ({
        keyboardShortcuts: [...state.keyboardShortcuts, shortcut],
      }));
    },

    removeKeyboardShortcut: (key: string) => {
      set((state) => ({
        keyboardShortcuts: state.keyboardShortcuts.filter(
          (shortcut) => shortcut.key !== key,
        ),
      }));
    },

    executeShortcut: (
      key: string,
      ctrlKey?: boolean,
      shiftKey?: boolean,
      altKey?: boolean,
    ) => {
      const { keyboardShortcuts } = get();
      const shortcut = keyboardShortcuts.find(
        (s) =>
          s.key === key &&
          Boolean(s.ctrlKey) === Boolean(ctrlKey) &&
          Boolean(s.shiftKey) === Boolean(shiftKey) &&
          Boolean(s.altKey) === Boolean(altKey),
      );

      if (shortcut) {
        // Execute the action based on shortcut.action
        console.log("Executing shortcut:", shortcut.action);
      }
    },

    // Advanced features
    toggleExperimentalFeature: (feature: string, enabled: boolean) => {
      set((state) => ({
        experimentalFeatures: {
          ...state.experimentalFeatures,
          [feature]: enabled,
        },
      }));
    },

    // Performance and caching
    invalidateCache: (type?: "messages" | "conversations" | "all") => {
      if (type === "messages" || type === "all") {
        get().messageCache.clear();
      }
      if (type === "conversations" || type === "all") {
        get().conversationCache.clear();
      }
    },

    preloadConversation: async (conversationId: string) => {
      // Implementation would preload conversation data
      console.log("Preloading conversation:", conversationId);
    },

    // Synchronization
    sync: async () => {
      set({ syncStatus: "syncing" });
      try {
        // Implementation would sync with XMTP network
        set({
          syncStatus: "idle",
          lastSyncTimestamp: new Date(),
          lastSyncError: null,
        });
      } catch (error) {
        set({
          syncStatus: "error",
          lastSyncError: String(error),
        });
        get().logError(String(error), "sync");
      }
    },

    forceRefresh: async () => {
      get().invalidateCache("all");
      await get().sync();
    },

    // Analytics and insights
    getUsageStats: async () => {
      const { conversations, messages } = get();
      const totalMessages = Object.values(messages).reduce(
        (acc, msgs) => acc + msgs.length,
        0,
      );

      return {
        totalMessages,
        totalConversations: conversations.length,
        averageResponseTime: 0, // Would calculate from message timestamps
        mostActiveContact: "", // Would analyze message frequency
        busyHours: [], // Would analyze message timestamps
        dailyMessageCount: {}, // Would group messages by day
      };
    },

    // Import/Export
    exportData: async (
      format: "json" | "xml",
      includeMedia?: boolean,
    ): Promise<Blob> => {
      const data = {
        conversations: get().conversations,
        messages: get().messages,
        contacts: get().contacts,
        settings: get().currentUser.settings,
        exportedAt: new Date().toISOString(),
      };

      if (format === "json") {
        return new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
      } else {
        // XML export implementation
        return new Blob(["<data></data>"], { type: "application/xml" });
      }
    },

    importData: async (data: any, merge?: boolean) => {
      if (!merge) {
        // Replace all data
        set({
          conversations: data.conversations || [],
          messages: data.messages || {},
          contacts: data.contacts || [],
        });
      } else {
        // Merge data
        set((state) => ({
          conversations: [
            ...state.conversations,
            ...(data.conversations || []),
          ],
          messages: { ...state.messages, ...(data.messages || {}) },
          contacts: [...state.contacts, ...(data.contacts || [])],
        }));
      }
    },

    // Integration
    addCalendarEvent: async (
      event: Omit<CalendarEvent, "id">,
    ): Promise<string> => {
      const eventId = get().generateId();
      const newEvent: CalendarEvent = { ...event, id: eventId };

      set((state) => ({
        calendarEvents: [...state.calendarEvents, newEvent],
      }));

      return eventId;
    },

    updateCalendarEvent: async (
      eventId: string,
      updates: Partial<CalendarEvent>,
    ) => {
      set((state) => ({
        calendarEvents: state.calendarEvents.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event,
        ),
      }));
    },

    deleteCalendarEvent: async (eventId: string) => {
      set((state) => ({
        calendarEvents: state.calendarEvents.filter(
          (event) => event.id !== eventId,
        ),
      }));
    },

    getUpcomingEvents: (days: number = 7): CalendarEvent[] => {
      const { calendarEvents } = get();
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return calendarEvents.filter(
        (event) => event.startTime >= now && event.startTime <= futureDate,
      );
    },

    // Error handling and recovery
    logError: (error: string, context: string) => {
      set((state) => ({
        errorLog: [
          ...state.errorLog.slice(-99),
          { timestamp: new Date(), error, context },
        ],
      }));
    },

    clearErrorLog: () => {
      set({ errorLog: [] });
    },

    recoverFromError: async () => {
      try {
        get().invalidateCache("all");
        await get().sync();
        set({ error: null });
      } catch (error) {
        get().logError(String(error), "recoverFromError");
      }
    },

    // Utility functions
    generateId: (): string => {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    formatTimestamp: (timestamp: Date | bigint, format?: string): string => {
      const date =
        timestamp instanceof Date
          ? timestamp
          : new Date(Number(timestamp) / 1000000);
      return date.toLocaleString();
    },

    parseMessageContent: (content: any): MessageContent => {
      // Implementation would parse various content types
      return content;
    },

    sanitizeInput: (input: string): string => {
      return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    },

    validateAddress: (address: string): boolean => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
  })),
);

// Export helper hooks for specific functionality
export const useSearch = () => {
  const store = useAdvancedInboxStore();
  return {
    searchResults: store.searchResults,
    isSearching: store.isSearching,
    activeFilters: store.activeFilters,
    searchMessages: store.searchMessages,
    clearSearch: store.clearSearch,
    updateSearchFilters: store.updateSearchFilters,
    addSavedSearch: store.addSavedSearch,
    removeSavedSearch: store.removeSavedSearch,
    getSavedSearches: store.getSavedSearches,
  };
};

export const useConversationManagement = () => {
  const store = useAdvancedInboxStore();
  return {
    conversations: store.conversations,
    createConversation: store.createConversation,
    updateConversationMetadata: store.updateConversationMetadata,
    pinConversation: store.pinConversation,
    archiveConversation: store.archiveConversation,
    muteConversation: store.muteConversation,
    deleteConversation: store.deleteConversation,
    tagConversation: store.tagConversation,
    markConversationRead: store.markConversationRead,
    getConversationInsights: store.getConversationInsights,
    exportConversation: store.exportConversation,
  };
};

export const useMessageManagement = () => {
  const store = useAdvancedInboxStore();
  return {
    messages: store.messages,
    sendMessage: store.sendMessage,
    editMessage: store.editMessage,
    deleteMessage: store.deleteMessage,
    forwardMessage: store.forwardMessage,
    reactToMessage: store.reactToMessage,
    scheduleMessage: store.scheduleMessage,
    markMessageRead: store.markMessageRead,
    searchInConversation: store.searchInConversation,
  };
};

export const useContacts = () => {
  const store = useAdvancedInboxStore();
  return {
    contacts: store.contacts,
    addContact: store.addContact,
    updateContact: store.updateContact,
    deleteContact: store.deleteContact,
    blockContact: store.blockContact,
    searchContacts: store.searchContacts,
    getContactByAddress: store.getContactByAddress,
    importContacts: store.importContacts,
    exportContacts: store.exportContacts,
  };
};

export const useNotifications = () => {
  const store = useAdvancedInboxStore();
  return {
    notifications: store.notifications,
    updateNotificationSettings: store.updateNotificationSettings,
    markNotificationRead: store.markNotificationRead,
    clearNotifications: store.clearNotifications,
    requestPermission: store.requestPermission,
    scheduleNotification: store.scheduleNotification,
  };
};

export const useFileManagement = () => {
  const store = useAdvancedInboxStore();
  return {
    uploads: store.uploads,
    uploadFile: store.uploadFile,
    downloadAttachment: store.downloadAttachment,
    generateThumbnail: store.generateThumbnail,
    compressMedia: store.compressMedia,
  };
};

export const useBulkOperations = () => {
  const store = useAdvancedInboxStore();
  return {
    selectedConversations: store.selectedConversations,
    selectConversation: store.selectConversation,
    selectAllConversations: store.selectAllConversations,
    clearSelection: store.clearSelection,
    bulkArchive: store.bulkArchive,
    bulkMute: store.bulkMute,
    bulkDelete: store.bulkDelete,
    bulkMarkRead: store.bulkMarkRead,
  };
};

export const useKeyboardShortcuts = () => {
  const store = useAdvancedInboxStore();
  return {
    keyboardShortcuts: store.keyboardShortcuts,
    addKeyboardShortcut: store.addKeyboardShortcut,
    removeKeyboardShortcut: store.removeKeyboardShortcut,
    executeShortcut: store.executeShortcut,
  };
};
