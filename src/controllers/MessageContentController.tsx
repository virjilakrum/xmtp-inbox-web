import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { EmojiMatcher, useEmojiData } from "interweave-emoji";
import type { MouseEvent } from "react";
import { ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";
import type { Reply } from "@xmtp/content-type-reply";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import { ContentTypeText } from "@xmtp/content-type-text";
import type { ContentTypeId } from "@xmtp/content-type-primitives";
import RemoteAttachmentMessageTile from "../component-library/components/RemoteAttachmentMessageTile/RemoteAttachmentMessageTile";
// V3 imports
import type { CachedMessageWithId } from "../types/xmtpV3Types";
import { DecodedMessage } from "@xmtp/browser-sdk";

interface MessageContentControllerProps {
  message: CachedMessageWithId;
  isSelf: boolean;
}

const MessageContentController = ({
  message,
  isSelf,
}: MessageContentControllerProps) => {
  const [, source] = useEmojiData({
    compact: false,
    shortcodes: ["emojibase"],
  });

  // V3 DecodedMessage has content, contentType, and fallback properties directly
  const messageContent = message.message?.content;
  const contentType = message.message?.contentType;
  const fallback = message.message?.fallback;

  // Check content type using the V3 ContentTypeId structure
  const isTextType =
    contentType?.authorityId === "xmtp.org" &&
    contentType?.typeId === "text" &&
    contentType?.versionMajor === 1;

  const isRemoteAttachmentType =
    contentType?.authorityId === "xmtp.org" &&
    contentType?.typeId === "remoteStaticAttachment" &&
    contentType?.versionMajor === 1;

  const isReplyType =
    contentType?.authorityId === "xmtp.org" &&
    contentType?.typeId === "reply" &&
    contentType?.versionMajor === 1;

  if (isTextType) {
    const content = messageContent as string;
    return (
      <span className="interweave-content" data-testid="message-tile-text">
        <Interweave
          content={content}
          newWindow
          escapeHtml
          onClick={(event: MouseEvent<HTMLDivElement>) =>
            event.stopPropagation()
          }
          matchers={[
            new UrlMatcher("url"),
            new EmojiMatcher("emoji", {
              convertEmoticon: true,
              convertShortcode: true,
              renderUnicode: true,
            }),
            // Commenting out email matching until this issue is resolved: https://github.com/milesj/interweave/issues/201
            // In the meantime, the experience still properly displays emails, just doesn't link to the expected `mailto:` view.
            // new EmailMatcher("email"),
          ]}
          emojiSource={source}
        />
      </span>
    );
  }

  if (isRemoteAttachmentType) {
    return <RemoteAttachmentMessageTile message={message} />;
  }

  if (isReplyType) {
    const reply = messageContent as Reply;
    // Create a new message object with reply content for recursive rendering
    const newMessage: CachedMessageWithId = {
      ...message,
      message: {
        ...message.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        content: reply.content,
        contentType: reply.contentType,
      } as DecodedMessage, // Type assertion to avoid private property issues
    };

    return <MessageContentController message={newMessage} isSelf={isSelf} />;
  }

  // message content type not supported, display fallback
  return <span>{fallback}</span>;
};

export default MessageContentController;
