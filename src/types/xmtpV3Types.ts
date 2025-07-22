import type { Client, Conversation } from "@xmtp/browser-sdk";

// **XMTP V3 COMPATIBILITY**: Enhanced type definitions for XMTP V3
export interface XmtpV3Conversation extends Omit<Conversation, "createdAtNs"> {
  id: string;
  peerAddress?: string;
  peerInboxId?: string;
  topic?: string;
  createdAtNs?: bigint;
  isGroup?: boolean;
  lastMessage?: any;
  unreadCount?: number;
}

// **COMPATIBILITY**: Enhanced conversation type that works with both V2 and V3
export interface EnhancedConversation {
  id: string;
  peerAddress: string;
  peerInboxId?: string;
  topic?: string;
  createdAtNs?: bigint;
  isGroup: boolean;
  lastMessage?: any;
  unreadCount: number;
  // Additional V3 properties
  enhancedMetadata?: ConversationMetadata;
  participantPresence?: { [userId: string]: UserPresence };
  permissions?: {
    canAddMembers: boolean;
    canRemoveMembers: boolean;
    canEditInfo: boolean;
    canDeleteMessages: boolean;
    canPin: boolean;
  };
  groupInfo?: {
    name: string;
    description?: string;
    avatarUrl?: string;
    adminIds: string[];
    memberIds: string[];
    inviteLink?: string;
    settings: {
      whoCanAddMembers: "admins" | "members";
      whoCanEditInfo: "admins" | "members";
      messagingEnabled: boolean;
    };
  };
}

// **UTILITY**: Type guard to check if object is a valid conversation
export function isEnhancedConversation(obj: any): obj is EnhancedConversation {
  return obj && typeof obj === "object" && typeof obj.id === "string";
}

// **UTILITY**: Convert any conversation object to EnhancedConversation (XMTP V3)
export async function toEnhancedConversation(
  convo: any,
): Promise<EnhancedConversation> {
  if (!convo || typeof convo !== "object") {
    throw new Error("Invalid conversation object");
  }

  // **XMTP V3**: peerAddress() is an async method
  let peerAddress = "unknown";
  try {
    if (typeof convo.peerAddress === "function") {
      peerAddress = await convo.peerAddress();
    } else if (convo.peerInboxId) {
      peerAddress = convo.peerInboxId;
    } else if (typeof convo.peerAddress === "string") {
      // Fallback for cases where it's already a string
      peerAddress = convo.peerAddress;
    }
  } catch (error) {
    console.warn(
      "⚠️ Error getting peer address in toEnhancedConversation:",
      error,
    );
    peerAddress = convo.peerInboxId || "unknown";
  }

  return {
    id: convo.id || "unknown",
    peerAddress,
    peerInboxId: convo.peerInboxId,
    topic: convo.topic,
    createdAtNs: convo.createdAtNs,
    isGroup: Boolean(convo.isGroup),
    lastMessage: convo.lastMessage,
    unreadCount: convo.unreadCount || 0,
    enhancedMetadata: convo.enhancedMetadata,
    participantPresence: convo.participantPresence,
    permissions: convo.permissions,
    groupInfo: convo.groupInfo,
  };
}

// Base cached message interface
export interface CachedMessage {
  id: string;
  content: any;
  senderAddress: string;
  senderInboxId: string;
  sentAtNs: bigint;
}

// Enhanced conversation metadata
export interface ConversationMetadata {
  id: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  mutedUntil?: Date;
  customizations: {
    color?: string;
    emoji?: string;
    nickname?: string;
  };
  tags: string[];
  lastReadMessageId?: string;
  lastReadTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced message status and metadata
export interface MessageMetadata {
  id: string;
  deliveryStatus: "sending" | "sent" | "delivered" | "read" | "failed";
  isEdited: boolean;
  editHistory?: {
    timestamp: Date;
    previousContent: string;
  }[];
  reactions: {
    [emoji: string]: {
      count: number;
      users: string[];
      hasCurrentUser: boolean;
    };
  };
  replyToId?: string;
  forwardedFrom?: {
    conversationId: string;
    messageId: string;
    originalSender: string;
  };
  mentions: {
    userId: string;
    displayName: string;
    start: number;
    length: number;
  }[];
  links: {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    start: number;
    length: number;
  }[];
  attachments: AttachmentMetadata[];
  scheduledFor?: Date;
  expiresAt?: Date;
  isEncrypted: boolean;
  encryptionLevel: "none" | "transport" | "e2e";
}

// Enhanced attachment metadata
export interface AttachmentMetadata {
  id: string;
  type:
    | "image"
    | "video"
    | "audio"
    | "document"
    | "location"
    | "contact"
    | "other";
  filename: string;
  size: number;
  mimeType: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number; // for video/audio
  dimensions?: {
    width: number;
    height: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  };
  contact?: {
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
  preview?: string; // base64 thumbnail
  downloadProgress?: number;
  isDownloaded: boolean;
}

// User presence and status
export interface UserPresence {
  userId: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeen?: Date;
  isTyping: boolean;
  typingInConversation?: string;
  customStatus?: {
    emoji: string;
    text: string;
    expiresAt?: Date;
  };
  device: {
    type: "web" | "mobile" | "desktop";
    name: string;
  };
}

// Enhanced conversation with all metadata
export interface CachedConversationWithId extends EnhancedConversation {
  enhancedMetadata: ConversationMetadata;
  lastMessage?: CachedMessageWithId;
  participantPresence: { [userId: string]: UserPresence };
  permissions: {
    canAddMembers: boolean;
    canRemoveMembers: boolean;
    canEditInfo: boolean;
    canDeleteMessages: boolean;
    canPin: boolean;
  };
  isGroup: boolean;
  groupInfo?: {
    name: string;
    description?: string;
    avatarUrl?: string;
    adminIds: string[];
    memberIds: string[];
    inviteLink?: string;
    settings: {
      whoCanAddMembers: "admins" | "members";
      whoCanEditInfo: "admins" | "members";
      messagingEnabled: boolean;
    };
  };
}

// **COMPATIBILITY**: Type alias for backward compatibility
export type CachedConversation = CachedConversationWithId;

// Enhanced message with metadata
export interface CachedMessageWithId extends CachedMessage {
  id: string;
  conversationId: string;
  senderAddress: string;
  senderInboxId: string;
  content: MessageContent;
  sentAtNs: bigint;
  metadata: MessageMetadata;
  localMetadata: {
    isSelected: boolean;
    isHighlighted: boolean;
    searchScore?: number;
  };
}

// Enhanced message content types
export interface MessageContent {
  text?: string;
  attachments?: AttachmentMetadata[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  };
  contact?: {
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
  poll?: {
    question: string;
    options: {
      id: string;
      text: string;
      votes: number;
      voters: string[];
    }[];
    allowMultiple: boolean;
    expiresAt?: Date;
  };
  calendar?: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    attendees?: string[];
  };
  payment?: {
    amount: number;
    currency: string;
    recipient: string;
    memo?: string;
    transactionId?: string;
    status: "pending" | "completed" | "failed";
  };
  quote?: {
    messageId: string;
    text: string;
    author: string;
  };
  systemMessage?: {
    type:
      | "member_added"
      | "member_removed"
      | "name_changed"
      | "avatar_changed"
      | "admin_added"
      | "admin_removed";
    data: any;
  };
  effectType?: "SNOW" | "RAIN" | "FIREWORKS" | "CONFETTI";
}

// Search and filtering types
export interface SearchFilters {
  query?: string;
  conversationIds?: string[];
  senderIds?: string[];
  messageTypes?: (
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "location"
    | "contact"
  )[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasAttachments?: boolean;
  hasReactions?: boolean;
  isUnread?: boolean;
  tags?: string[];
  sortBy: "relevance" | "date" | "sender";
  sortOrder: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  message: CachedMessageWithId;
  conversation: CachedConversationWithId;
  score: number;
  highlights: {
    field: string;
    start: number;
    length: number;
  }[];
}

// Notification types
export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
  muteUntil?: Date;
  keywords: string[];
  mentionsOnly: boolean;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
}

export interface PushNotification {
  id: string;
  type: "message" | "mention" | "reaction" | "member_added" | "member_removed";
  title: string;
  body: string;
  avatar?: string;
  conversationId: string;
  messageId?: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
  actions?: {
    id: string;
    title: string;
    type: "reply" | "mark_read" | "mute" | "custom";
  }[];
}

// Advanced inbox state
export interface InboxState {
  conversations: CachedConversationWithId[];
  messages: { [conversationId: string]: CachedMessageWithId[] };
  searchResults: SearchResult[];
  activeFilters: SearchFilters;
  selectedConversations: string[];
  isSearching: boolean;
  isLoading: boolean;
  lastSyncTimestamp: Date | null;
  unreadCounts: { [conversationId: string]: number };
  totalUnreadCount: number;
  userPresence: { [userId: string]: UserPresence };
  currentUser: {
    id: string;
    address: string;
    inboxId: string;
    profile: {
      displayName?: string;
      avatar?: string;
      status?: string;
      customStatus?: {
        emoji: string;
        text: string;
        expiresAt?: Date;
      };
    };
    settings: {
      notifications: NotificationSettings;
      privacy: {
        readReceipts: boolean;
        typingIndicators: boolean;
        onlineStatus: boolean;
        profilePhotoVisibility: "everyone" | "contacts" | "none";
      };
      appearance: {
        theme: "light" | "dark" | "auto";
        fontSize: "small" | "medium" | "large";
        messagePreview: "full" | "truncated" | "none";
        compactMode: boolean;
      };
      advanced: {
        enableReactions: boolean;
        enableReplies: boolean;
        enableForwarding: boolean;
        enableMessageScheduling: boolean;
        autoDeleteAfter?: number; // days
        backupEnabled: boolean;
        encryptionLevel: "standard" | "enhanced";
      };
    };
  };
  drafts: { [conversationId: string]: string };
  uploads: { [uploadId: string]: UploadProgress };
  error: string | null;
}

// Upload progress tracking
export interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  url?: string;
  error?: string;
  conversationId: string;
  thumbnailUrl?: string;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
  description: string;
  category: "navigation" | "messaging" | "formatting" | "general";
}

// Export/Import types
export interface ConversationExport {
  conversation: CachedConversationWithId;
  messages: CachedMessageWithId[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    version: string;
    messageCount: number;
    dateRange: {
      start: Date;
      end: Date;
    };
  };
}

// Integration types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: string[];
  conversationId?: string;
  messageId?: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  avatar?: string;
  addresses: string[];
  phone?: string;
  email?: string;
  lastSeen?: Date;
  conversationIds: string[];
  isBlocked: boolean;
  tags: string[];
  notes?: string;
  addedAt: Date;
}

// Analytics and insights
export interface ConversationInsights {
  conversationId: string;
  period: "day" | "week" | "month" | "year";
  messageCount: number;
  averageResponseTime: number;
  mostActiveHour: number;
  wordCount: number;
  mediaShared: number;
  topEmojis: { [emoji: string]: number };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Real-time events
export interface RealtimeEvent {
  type:
    | "message"
    | "typing"
    | "presence"
    | "reaction"
    | "member_update"
    | "conversation_update";
  conversationId: string;
  userId?: string;
  data: any;
  timestamp: Date;
}
