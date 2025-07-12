import { useState } from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XIcon,
  CloudUploadIcon,
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
  const [isDragActive, setIsDragActiveLocal] = useState(false);

  // V3 message input logic with attachment support
  const handleAttachmentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActiveLocal(false);
    setIsDragActive?.(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log("V3 attachment - file dropped:", files[0].name);
      // V3 attachment handling would process the file here
      // For now, we'll just log the file info
    }
  };

  const handleDragEnter = () => {
    setIsDragActiveLocal(true);
    setIsDragActive?.(true);
  };

  const handleDragLeave = () => {
    setIsDragActiveLocal(false);
    setIsDragActive?.(false);
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
    <div
      className={`
      border-t border-gray-200 bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm p-6 
      transition-all duration-300 
      ${isDragActive ? "bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-gray-300" : ""}
    `}>
      {/* Drag and Drop Overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 via-gray-600/10 to-gray-700/10 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in-scale">
          <div className="glass p-8 text-center animate-pulse">
            <CloudUploadIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">
              Drop your file here
            </p>
            <p className="text-sm text-gray-600">
              Release to attach to your message
            </p>
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-6 p-6 glass rounded-3xl animate-fade-in-scale shadow-elegant hover:shadow-modern transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl">
                <PaperClipIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {attachment.filename}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  Attachment ready to send
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachment?.(undefined);
                setAttachmentPreview?.(undefined);
              }}
              className="p-3 hover:bg-red-50 rounded-2xl transition-all duration-200 group transform hover:scale-105">
              <XIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
          {attachmentPreview && (
            <div className="mt-4">
              <img
                src={attachmentPreview}
                alt="Preview"
                className="max-w-xs rounded-2xl shadow-elegant hover:shadow-modern transition-all duration-300 transform hover:scale-105"
              />
            </div>
          )}
        </div>
      )}

      {/* Message Input Container */}
      <div
        className={`
          glass rounded-3xl border-2 transition-all duration-300 shadow-elegant hover:shadow-modern
          ${
            isFocused
              ? "border-gray-400 shadow-modern scale-[1.02]"
              : "border-gray-200 hover:border-gray-300"
          }
        `}>
        <div className="flex items-end space-x-4 p-6">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your message..."
              disabled={isDisabled}
              rows={1}
              className="w-full resize-none bg-transparent border-0 outline-none placeholder-gray-400 text-gray-900 font-medium leading-relaxed text-lg transition-all duration-200"
              style={{ minHeight: "28px", maxHeight: "120px" }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleAttachmentDrop}
            />
            {/* Focus indicator */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-300 ${isFocused ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
            />
          </div>

          {/* Attachment Button */}
          <button
            type="button"
            disabled={isDisabled}
            className="p-3 text-gray-400 hover:text-gray-700 rounded-2xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 group"
            title="Attach file">
            <PaperClipIcon className="w-6 h-6 transition-transform duration-200 group-hover:rotate-12" />
          </button>

          {/* Send Button */}
          <button
            type="button"
            disabled={isDisabled || (!message.trim() && !attachment)}
            onClick={handleSend}
            className={`
              p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center relative overflow-hidden group
              ${
                (message.trim() || attachment) && !isDisabled
                  ? "gradient-primary text-white shadow-elegant hover:shadow-modern hover:scale-105"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
            title="Send message">
            {/* Animated background overlay */}
            {(message.trim() || attachment) && !isDisabled && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12" />
            )}
            <PaperAirplaneIcon className="w-6 h-6 transform rotate-90 transition-transform duration-200 group-hover:translate-x-1 relative z-10" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="flex justify-between items-center mt-4 px-4">
        <div className="text-sm text-gray-500 font-medium">
          {peerAddress && (
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>
                Chatting with{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded-lg text-xs">
                  {peerAddress.slice(0, 6)}...{peerAddress.slice(-4)}
                </span>
              </span>
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 font-medium flex items-center space-x-2">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono shadow-sm">
            Enter
          </kbd>
          <span>to send</span>
        </div>
      </div>
    </div>
  );
};

export { MessageInput };
export default MessageInput;
