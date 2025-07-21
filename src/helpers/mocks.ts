import { ContentTypeText } from "@xmtp/content-type-text";
import type {
  CachedConversation,
  CachedMessage,
  CachedMessageWithId,
  ConversationMetadata,
} from "../types/xmtpV3Types";

export const getMockConversation = (
  values?: Partial<CachedConversation>,
): CachedConversation => ({
  // Required fields from CachedConversationWithId
  id: window.crypto.randomUUID(),
  peerAddress:
    values?.peerAddress || "0x1234567890123456789012345678901234567890",
  peerInboxId: values?.peerInboxId || "mock-inbox-id",
  topic: values?.topic || "mock-topic",
  createdAtNs: BigInt(Date.now() * 1000000),
  enhancedMetadata: {
    id: window.crypto.randomUUID(),
    title: values?.enhancedMetadata?.title,
    description: values?.enhancedMetadata?.description,
    avatarUrl: values?.enhancedMetadata?.avatarUrl,
    isPinned: false,
    isArchived: false,
    isMuted: false,
    customizations: {},
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ConversationMetadata,
  unreadCount: 0,
  participantPresence: {},
  permissions: {
    canAddMembers: false,
    canRemoveMembers: false,
    canEditInfo: false,
    canDeleteMessages: false,
    canPin: false,
  },
  isGroup: false,

  // Conversation base properties (from @xmtp/browser-sdk)
  // These would be filled by the actual Conversation object
  ...(values as any),
});

export const getMockMessage = (
  id: number,
  content?: string,
): CachedMessageWithId => ({
  // Required fields from CachedMessageWithId
  id: id.toString(),
  conversationId: "mock-conversation-id",
  content: {
    text: content || "Mock message content",
  },
  senderAddress: "0x1234567890123456789012345678901234567890",
  senderInboxId: "mock-sender-inbox-id",
  sentAtNs: BigInt(Date.now() * 1000000),
  metadata: {
    id: id.toString(),
    deliveryStatus: "sent" as const,
    isEdited: false,
    reactions: {},
    mentions: [],
    links: [],
    attachments: [],
    isEncrypted: false,
    encryptionLevel: "transport" as const,
  },
  localMetadata: {
    isSelected: false,
    isHighlighted: false,
    searchScore: 0,
  },
});
