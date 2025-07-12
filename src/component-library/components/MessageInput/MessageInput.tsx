import { useState } from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XIcon,
} from "@heroicons/react/outline";
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
  const [isFocused, setIsFocused] = useState(false);

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

  const handleSend = async () => {
    if (onSendMessage && message.trim()) {
      await onSendMessage(message);
      setMessage(""); // Clear input after sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-4 p-4 glass rounded-2xl animate-fade-in-scale">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PaperClipIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">
                  {attachment.filename}
                </p>
                <p className="text-sm text-gray-500">Attachment ready</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachment?.(undefined);
                setAttachmentPreview?.(undefined);
              }}
              className="p-2 hover:bg-red-50 rounded-xl transition-colors group">
              <XIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            </button>
          </div>
          {attachmentPreview && (
            <div className="mt-3">
              <img
                src={attachmentPreview}
                alt="Preview"
                className="max-w-xs rounded-xl shadow-elegant"
              />
            </div>
          )}
        </div>
      )}

      {/* Message Input Container */}
      <div
        className={`
          glass rounded-2xl border-2 transition-all duration-200 
          ${
            isFocused
              ? "border-blue-300 shadow-elegant"
              : "border-gray-200 hover:border-gray-300"
          }
        `}>
        <div className="flex items-end space-x-3 p-4">
          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your message..."
              disabled={isDisabled}
              rows={1}
              className="w-full resize-none bg-transparent border-0 outline-none placeholder-gray-500 text-gray-900 font-medium leading-relaxed"
              style={{ minHeight: "24px", maxHeight: "120px" }}
              onDragEnter={() => setIsDragActive?.(true)}
              onDragLeave={() => setIsDragActive?.(false)}
              onDrop={handleAttachmentDrop}
            />
          </div>

          {/* Attachment Button */}
          <button
            type="button"
            disabled={isDisabled}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
            title="Attach file">
            <PaperClipIcon className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="button"
            disabled={isDisabled || (!message.trim() && !attachment)}
            onClick={handleSend}
            className={`
              p-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center
              ${
                (message.trim() || attachment) && !isDisabled
                  ? "gradient-primary text-white shadow-elegant hover:shadow-modern hover:scale-105"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
            title="Send message">
            <PaperAirplaneIcon className="w-5 h-5 transform rotate-90" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="flex justify-between items-center mt-2 px-2">
        <div className="text-xs text-gray-400">
          {peerAddress && (
            <span>
              Chatting with {peerAddress.slice(0, 6)}...{peerAddress.slice(-4)}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">Press Enter to send</div>
      </div>
    </div>
  );
};

export { MessageInput };
export default MessageInput;
