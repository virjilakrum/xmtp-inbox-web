import { ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";
import { ContentTypeScreenEffect } from "@xmtp/experimental-content-type-screen-effect";
import { ContentTypeText } from "@xmtp/content-type-text";
import type { ContentTypeId } from "@xmtp/content-type-primitives";

// V3 message type
type CachedMessageWithId = {
  xmtpID: string;
  content: any;
  contentType: string;
  senderAddress: string;
  sentAt: Date;
  uuid: string;
  id: string;
  conversationTopic?: string;
  contentFallback?: string;
};

/**
 * Determines if a message is supported by the app
 */
export const isMessageSupported = (message: CachedMessageWithId) => {
  // TODO: Update for V3 ContentTypeId handling
  // For now, check the contentType string directly
  const contentTypeString = message.contentType;

  return (
    contentTypeString === ContentTypeText.toString() ||
    contentTypeString === ContentTypeRemoteAttachment.toString() ||
    contentTypeString === ContentTypeScreenEffect.toString()
  );
};
