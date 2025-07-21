import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Attachment } from "@xmtp/content-type-remote-attachment";
import { classNames } from "../../../helpers";

interface OptimisticMessage {
  id: string;
  content: string;
  timestamp: number;
  status: "sending" | "sent" | "failed";
}

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  attachment?: Attachment;
  attachmentPreview?: string;
  setAttachment?: (attachment: Attachment | undefined) => void;
  setAttachmentPreview?: (preview: string | undefined) => void;
  setIsDragActive?: (active: boolean) => void;
  optimisticMessages?: OptimisticMessage[];
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  attachment,
  attachmentPreview,
  setAttachment,
  setAttachmentPreview,
  setIsDragActive,
  optimisticMessages = [],
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // **PERFORMANCE**: Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Max height for 5 lines
      const newHeight = Math.min(scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Calculate rows for styling
      const lineHeight = 20;
      const newRows = Math.min(
        Math.max(1, Math.ceil(newHeight / lineHeight)),
        6,
      );
      setRows(newRows);
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [message, adjustHeight]);

  // **PERFORMANCE**: Enhanced send handler with optimistic UI
  const handleSend = useCallback(async () => {
    if (!message.trim() || disabled || isSending) return;

    const messageToSend = message.trim();
    setIsSending(true);

    // **PERFORMANCE**: Clear input immediately for better UX
    setMessage("");
    setRows(1);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
      // **PERFORMANCE**: Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  }, [message, disabled, isSending, onSendMessage]);

  // **PERFORMANCE**: Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // **PERFORMANCE**: Handle file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && setAttachment && setAttachmentPreview) {
        // Basic file validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert("File too large. Please select a file under 10MB.");
          return;
        }

        // Create attachment object (simplified)
        const attachment: Attachment = {
          filename: file.name,
          mimeType: file.type,
          data: new Uint8Array(), // Would be populated in real implementation
        };

        setAttachment(attachment);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setAttachmentPreview(previewUrl);
      }
    },
    [setAttachment, setAttachmentPreview],
  );

  // **PERFORMANCE**: Remove attachment
  const removeAttachment = useCallback(() => {
    if (setAttachment && setAttachmentPreview) {
      setAttachment(undefined);
      setAttachmentPreview(undefined);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setAttachment, setAttachmentPreview]);

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* **PERFORMANCE**: Optimistic messages display */}
      {optimisticMessages.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <div className="text-sm text-blue-600 font-medium mb-2">
            Sending messages...
          </div>
          <div className="space-y-1">
            {optimisticMessages.map((msg) => (
              <div
                key={msg.id}
                className={classNames(
                  "flex items-center text-sm transition-all duration-200",
                  msg.status === "sending" ? "text-blue-600" : null,
                  msg.status === "sent" ? "text-green-600" : null,
                  msg.status === "failed" ? "text-red-600" : null,
                )}>
                <div
                  className={classNames(
                    "w-2 h-2 rounded-full mr-2 transition-all duration-200",
                    msg.status === "sending"
                      ? "bg-blue-500 animate-pulse"
                      : null,
                    msg.status === "sent" ? "bg-green-500" : null,
                    msg.status === "failed" ? "bg-red-500" : null,
                  )}
                />
                <span className="truncate flex-1">
                  {msg.content.length > 50
                    ? msg.content.slice(0, 50) + "..."
                    : msg.content}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {msg.status === "sending" && "Sending..."}
                  {msg.status === "sent" && "Sent"}
                  {msg.status === "failed" && "Failed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* **PERFORMANCE**: File attachment preview */}
      {attachment && attachmentPreview && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {attachment.mimeType?.startsWith("image/") ? (
                <img
                  src={attachmentPreview}
                  alt="Preview"
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {attachment.filename}
                </p>
                <p className="text-xs text-gray-500">{attachment.mimeType}</p>
              </div>
            </div>
            <button
              onClick={removeAttachment}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* **PERFORMANCE**: Main input area */}
      <div className="px-4 py-3">
        <div className="flex items-end space-x-3">
          {/* **PERFORMANCE**: File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={classNames(
              "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:text-blue-500 hover:bg-blue-50",
            )}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          {/* **PERFORMANCE**: Message input with smooth animations */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={classNames(
                "w-full resize-none border rounded-lg px-3 py-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder-gray-400 text-gray-900",
                disabled
                  ? "bg-gray-50 border-gray-200 cursor-not-allowed"
                  : "bg-white border-gray-300 hover:border-gray-400",
                rows > 1 ? "py-3" : null,
              )}
              style={{
                minHeight: "40px",
                maxHeight: "120px",
                overflow: "auto",
              }}
            />

            {/* **PERFORMANCE**: Character count (for long messages) */}
            {message.length > 500 && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                {message.length}/4000
              </div>
            )}
          </div>

          {/* **PERFORMANCE**: Send button with loading state */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || disabled || isSending}
            className={classNames(
              "flex-shrink-0 p-2 rounded-lg transition-all duration-200 transform",
              !message.trim() || disabled || isSending
                ? "text-gray-300 cursor-not-allowed scale-95"
                : "text-white bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg",
            )}>
            {isSending ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* **PERFORMANCE**: Input hints */}
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* **PERFORMANCE**: Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};
