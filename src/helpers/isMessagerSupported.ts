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
  // V3 ContentTypeId handling - check content type structure
  const contentType = message.contentType;

  // V3 content types can be string or object
  if (typeof contentType === "string") {
    return (
      contentType === ContentTypeText.toString() ||
      contentType === ContentTypeRemoteAttachment.toString() ||
      contentType === ContentTypeScreenEffect.toString()
    );
  }

  // V3 ContentTypeId object structure
  if (typeof contentType === "object" && contentType) {
    const typeId = contentType as ContentTypeId;
    return (
      (typeId.authorityId === "xmtp.org" && typeId.typeId === "text") ||
      (typeId.authorityId === "xmtp.org" &&
        typeId.typeId === "remoteStaticAttachment") ||
      (typeId.authorityId === "xmtp.org" && typeId.typeId === "screenEffect")
    );
  }

  return false;
};
