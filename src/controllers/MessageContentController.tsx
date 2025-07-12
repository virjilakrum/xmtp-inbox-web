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

  // V3 CachedMessageWithId has content of type MessageContent
  const messageContent = message.content;

  // Determine message type based on content structure
  const isTextType = typeof messageContent.text === "string";
  const isRemoteAttachmentType =
    Array.isArray(messageContent.attachments) &&
    messageContent.attachments.length > 0;
  const isReplyType =
    typeof messageContent.quote === "object" && messageContent.quote !== null;

  if (isTextType) {
    const content = messageContent.text || "";
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
    const quote = messageContent.quote!;
    return (
      <div className="reply-message">
        <div className="reply-quote">
          <span className="reply-author">{quote.author}:</span>
          <span className="reply-text">{quote.text}</span>
        </div>
        {/* Render the current message text if it exists */}
        {messageContent.text && (
          <div className="reply-content">
            <span
              className="interweave-content"
              data-testid="message-tile-text">
              <Interweave
                content={messageContent.text}
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
                ]}
                emojiSource={source}
              />
            </span>
          </div>
        )}
      </div>
    );
  }

  // message content type not supported, display generic message
  return <span>Unsupported message type</span>;
};

export default MessageContentController;
