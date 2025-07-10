import { ContentTypeText } from "@xmtp/content-type-text";
import type {
  CachedConversation,
  CachedMessage,
  CachedMessageWithId,
} from "../types/xmtpV3Types";

export const getMockConversation = (
  values?: Partial<CachedConversation>,
): CachedConversation => ({
  id: window.crypto.randomUUID(),
  conversation: {} as any, // Mock conversation object
  peerAddress: "",
  topic: "",
  conversationId: "",
  metadata: {},
  walletAddress: values?.walletAddress ?? "",
  ...values,
});

export const getMockMessage = (
  id: number,
  content?: string,
): CachedMessageWithId => ({
  id: id.toString(),
  message: {
    id: window.crypto.randomUUID(),
    content: content || "Mock message content",
    contentType: {
      authorityId: "xmtp.org",
      typeId: "text",
      versionMajor: 1,
      versionMinor: 0,
    },
    conversationId: "",
    deliveryStatus: "published",
    fallback: "",
    compression: 0,
    kind: "application",
    parameters: new Map(),
    encodedContent: {} as any,
    senderInboxId: "",
    sentAtNs: BigInt(Date.now() * 1000000),
  } as any, // Mock DecodedMessage
  conversation: {} as any, // Mock Conversation
});
