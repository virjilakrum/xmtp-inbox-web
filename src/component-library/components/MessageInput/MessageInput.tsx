import { useState } from "react";
import type { Attachment } from "@xmtp/content-type-remote-attachment";
import { CachedConversation } from "../../../types/xmtpV3Types";

interface MessageInputProps {
  peerAddress?: string;
  isDisabled?: boolean;
  conversation?: CachedConversation | null;
  attachment?: Attachment;
  attachmentPreview?: string;
  setAttachment?: (attachment: Attachment | undefined) => void;
  setAttachmentPreview?: (url: string | undefined) => void;
  setIsDragActive?: (status: boolean) => void;
  onSendMessage?: (message: string) => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  peerAddress,
  isDisabled = false,
  conversation,
  attachment,
  attachmentPreview,
  setAttachment,
  setAttachmentPreview,
  setIsDragActive,
  onSendMessage,
}) => {
  const [message, setMessage] = useState("");

  // V3 message input logic with attachment support
  const handleAttachmentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive?.(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log("V3 attachment - file dropped:", files[0].name);
      // V3 attachment handling would process the file here
      // For now, we'll just log the file info
    }
  };
  return (
    <div className="message-input-container">
      {attachment && (
        <div className="attachment-preview">
          <p>Attachment: {attachment.filename}</p>
          {attachmentPreview && (
            <img
              src={attachmentPreview}
              alt="Preview"
              className="attachment-preview-image"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setAttachment?.(undefined);
              setAttachmentPreview?.(undefined);
            }}
            className="remove-attachment-button">
            Remove
          </button>
        </div>
      )}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={isDisabled}
        className="message-input"
        onDragEnter={() => setIsDragActive?.(true)}
        onDragLeave={() => setIsDragActive?.(false)}
        onDrop={handleAttachmentDrop}
      />
      <button
        type="button"
        disabled={isDisabled || (!message.trim() && !attachment)}
        className="send-button"
        onClick={async () => {
          if (onSendMessage && message.trim()) {
            await onSendMessage(message);
            setMessage(""); // Clear input after sending
          }
        }}>
        Send
      </button>
    </div>
  );
};

export { MessageInput };
export default MessageInput;
