import {
  DecodedMessage,
  Conversation,
  DeliveryStatus,
} from "@xmtp/browser-sdk";

// V3 equivalent of CachedMessageWithId from V2
export interface CachedMessageWithId {
  id: string;
  message: DecodedMessage;
  conversation: Conversation;
  // TODO: Add proper V3 cached message properties
}

// V3 equivalent of CachedMessage from V2
export interface CachedMessage {
  id: string;
  message: DecodedMessage;
  // TODO: Add proper V3 cached message properties
}

// V3 equivalent of CachedConversation from V2
export interface CachedConversation {
  id: string;
  conversation: Conversation;
  // Backward compatibility for helper functions
  peerAddress: string;
  topic?: string;
  conversationId?: string;
  metadata?: {
    peerAddressName?: string;
    peerAddressAvatar?: string;
  };
  walletAddress?: string;
  // TODO: Add proper V3 cached conversation properties
}

// V3 equivalent of CachedConversationWithId from V2
export interface CachedConversationWithId {
  id: string;
  conversation: Conversation;
  peerAddress: string;
  // TODO: Add proper V3 cached conversation properties
}

// DecodedMessage is imported from @xmtp/browser-sdk

// V3 equivalent of ClientOptions from V2
export interface ClientOptions {
  env?: "dev" | "production" | "local";
  dbPath?: string;
  dbEncryptionKey?: Uint8Array;
  // TODO: Add proper V3 client options
}

// V3 equivalent of ContentTypeId from V2
export interface ContentTypeId {
  authorityId: string;
  typeId: string;
  versionMajor: number;
  versionMinor: number;
}

// V3 equivalent of ContentTypeText from V2
export const ContentTypeText = {
  authorityId: "xmtp.org",
  typeId: "text",
  versionMajor: 1,
  versionMinor: 0,
};

// V3 equivalent of ContentTypeReaction from V2
export const ContentTypeReaction = {
  authorityId: "xmtp.org",
  typeId: "reaction",
  versionMajor: 1,
  versionMinor: 0,
};

// V3 equivalent of ContentTypeReply from V2
export const ContentTypeReply = {
  authorityId: "xmtp.org",
  typeId: "reply",
  versionMajor: 1,
  versionMinor: 0,
};

// V3 equivalent of ContentTypeRemoteAttachment from V2
export const ContentTypeRemoteAttachment = {
  authorityId: "xmtp.org",
  typeId: "remoteStaticAttachment",
  versionMajor: 1,
  versionMinor: 0,
};

// V3 equivalent of ContentTypeAttachment from V2
export const ContentTypeAttachment = {
  authorityId: "xmtp.org",
  typeId: "attachment",
  versionMajor: 1,
  versionMinor: 0,
};

// V3 equivalent of ReplyContent from V2
export interface ReplyContent {
  reference: string;
  content: any;
  contentType: ContentTypeId;
}

// V3 equivalent of ReactionContent from V2
export interface ReactionContent {
  reference: string;
  action: "added" | "removed";
  schema: "unicode" | "shortcode" | "custom";
  content: string;
}

// V3 equivalent of AttachmentContent from V2
export interface AttachmentContent {
  filename: string;
  mimeType: string;
  data: Uint8Array;
}

// V3 equivalent of RemoteAttachmentContent from V2
export interface RemoteAttachmentContent {
  url: string;
  contentDigest: string;
  salt: Uint8Array;
  nonce: Uint8Array;
  secret: Uint8Array;
  scheme: string;
  filename?: string;
  contentLength?: number;
}
