import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useAdvancedInboxStore,
  useFileManagement,
} from "../../../store/advancedInbox";
import type {
  CachedConversationWithId,
  MessageContent,
  AttachmentMetadata,
} from "../../../types/xmtpV3Types";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  MicrophoneIcon,
  CalendarIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeBracketIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
} from "@heroicons/react/24/outline";

// Emoji picker
const QuickEmojiPicker: React.FC<{
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ onEmojiSelect, isOpen, onClose }) => {
  const commonEmojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "👎",
    "😮",
    "😢",
    "😡",
    "🎉",
    "🔥",
    "💯",
    "✨",
    "👏",
    "🙏",
    "💪",
    "🤔",
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
      <div className="grid grid-cols-8 gap-2">
        {commonEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="text-xl hover:bg-gray-100 rounded p-1 transition-colors">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Voice recorder
const VoiceRecorder: React.FC<{
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}> = ({ onRecordingComplete, onCancel }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    audioChunksRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    startRecording();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      <span className="text-sm font-medium text-red-700">
        {formatDuration(duration)}
      </span>

      <div className="flex items-center space-x-2 ml-auto">
        {isRecording && !isPaused && (
          <button
            onClick={pauseRecording}
            className="p-2 rounded-full hover:bg-red-100 transition-colors"
            title={t("voice.pause")}>
            <PauseIcon className="w-4 h-4 text-red-600" />
          </button>
        )}

        {isPaused && (
          <button
            onClick={resumeRecording}
            className="p-2 rounded-full hover:bg-red-100 transition-colors"
            title={t("voice.resume")}>
            <PlayIcon className="w-4 h-4 text-red-600" />
          </button>
        )}

        <button
          onClick={stopRecording}
          className="p-2 rounded-full hover:bg-green-100 transition-colors"
          title={t("voice.send")}>
          <PaperAirplaneIcon className="w-4 h-4 text-green-600" />
        </button>

        <button
          onClick={cancelRecording}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title={t("voice.cancel")}>
          <XMarkIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

// File upload preview
const FileUploadPreview: React.FC<{
  files: File[];
  onRemove: (index: number) => void;
  onUpload: (files: File[]) => Promise<AttachmentMetadata[]>;
}> = ({ files, onRemove, onUpload }) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (files.length === 0) return null;

  return (
    <div className="border-t border-gray-200 p-3 bg-gray-50">
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-2 bg-white rounded-lg border">
            <div className="flex-shrink-0">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <PaperClipIcon className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>

            <button
              onClick={() => onRemove(index)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Formatting toolbar
const FormattingToolbar: React.FC<{
  onFormat: (format: string) => void;
  isVisible: boolean;
}> = ({ onFormat, isVisible }) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  const tools = [
    { id: "bold", icon: BoldIcon, title: t("format.bold"), shortcut: "Ctrl+B" },
    {
      id: "italic",
      icon: ItalicIcon,
      title: t("format.italic"),
      shortcut: "Ctrl+I",
    },
    {
      id: "underline",
      icon: UnderlineIcon,
      title: t("format.underline"),
      shortcut: "Ctrl+U",
    },
    {
      id: "strikethrough",
      icon: StrikethroughIcon,
      title: t("format.strikethrough"),
    },
    {
      id: "code",
      icon: CodeBracketIcon,
      title: t("format.code"),
      shortcut: "Ctrl+`",
    },
  ];

  return (
    <div className="flex items-center space-x-1 p-2 border-t border-gray-200 bg-gray-50">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onFormat(tool.id)}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          title={`${tool.title} ${tool.shortcut ? `(${tool.shortcut})` : ""}`}>
          <tool.icon className="w-4 h-4 text-gray-600" />
        </button>
      ))}
    </div>
  );
};

// Main component
export const AdvancedMessageInput: React.FC<{
  conversation: CachedConversationWithId;
  onSendMessage: (content: MessageContent) => Promise<void>;
  placeholder?: string;
  replyToMessage?: string;
  onCancelReply?: () => void;
}> = ({
  conversation,
  onSendMessage,
  placeholder = "Type a message...",
  replyToMessage,
  onCancelReply,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile } = useFileManagement();
  const { updateDraft, getDraft, clearDraft } = useAdvancedInboxStore();

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft(conversation.id);
    if (draft) {
      setMessage(draft);
    }
  }, [conversation.id, getDraft]);

  // Save draft on message change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (message.trim()) {
        updateDraft(conversation.id, message);
      } else {
        clearDraft(conversation.id);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [message, conversation.id, updateDraft, clearDraft]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if ((!message.trim() && attachedFiles.length === 0) || isSending) return;

    setIsSending(true);
    try {
      // Upload files first
      const attachments: AttachmentMetadata[] = [];
      for (const file of attachedFiles) {
        const attachment = await uploadFile(file, conversation.id);
        attachments.push(attachment);
      }

      // Prepare message content
      const content: MessageContent = {
        text: message.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      // Send message
      await onSendMessage(content);

      // Clear form
      setMessage("");
      setAttachedFiles([]);
      setScheduledFor(null);
      clearDraft(conversation.id);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Formatting shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          handleFormat("bold");
          break;
        case "i":
          e.preventDefault();
          handleFormat("italic");
          break;
        case "u":
          e.preventDefault();
          handleFormat("underline");
          break;
        case "`":
          e.preventDefault();
          handleFormat("code");
          break;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFormat = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `__${selectedText}__`;
        break;
      case "strikethrough":
        formattedText = `~~${selectedText}~~`;
        break;
      case "code":
        formattedText = `\`${selectedText}\``;
        break;
      default:
        return;
    }

    const newMessage =
      message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length,
      );
    }, 0);
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    setIsRecording(false);

    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], "voice_message.wav", {
        type: "audio/wav",
      });
      const attachment = await uploadFile(audioFile, conversation.id);

      await onSendMessage({
        attachments: [attachment],
      });
    } catch (error) {
      console.error("Failed to send voice message:", error);
    }
  };

  if (isRecording) {
    return (
      <div className="border-t border-gray-200 p-4">
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={() => setIsRecording(false)}
        />
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Reply indicator */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {t("message.replying_to")}
            </span>
            <button
              onClick={onCancelReply}
              className="p-1 rounded hover:bg-gray-200 transition-colors">
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* File upload preview */}
      <FileUploadPreview
        files={attachedFiles}
        onRemove={(index) => {
          setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
        }}
        onUpload={async (files) => {
          const attachments = [];
          for (const file of files) {
            const attachment = await uploadFile(file, conversation.id);
            attachments.push(attachment);
          }
          return attachments;
        }}
      />

      {/* Formatting toolbar */}
      <FormattingToolbar
        onFormat={handleFormat}
        isVisible={showFormattingToolbar}
      />

      {/* Main input area */}
      <div className="relative p-4">
        <div
          className="flex items-end space-x-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}>
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 modern-input min-h-[48px] max-h-32"
              rows={1}
            />

            {/* Format toggle */}
            <button
              onClick={() => setShowFormattingToolbar(!showFormattingToolbar)}
              className={`absolute right-3 top-3 p-1 rounded transition-colors ${
                showFormattingToolbar
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title={t("message.toggle_formatting")}>
              <span className="text-xs font-bold">A</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Emoji picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={t("message.add_emoji")}>
                <FaceSmileIcon className="w-5 h-5 text-gray-500" />
              </button>
              <QuickEmojiPicker
                onEmojiSelect={handleEmojiSelect}
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>

            {/* File upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t("message.attach_file")}>
              <PaperClipIcon className="w-5 h-5 text-gray-500" />
            </button>

            {/* Voice recording */}
            <button
              onClick={() => setIsRecording(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t("message.voice_message")}>
              <MicrophoneIcon className="w-5 h-5 text-gray-500" />
            </button>

            {/* Schedule message */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t("message.schedule")}>
              <CalendarIcon className="w-5 h-5 text-gray-500" />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={
                (!message.trim() && attachedFiles.length === 0) || isSending
              }
              className={`p-2 rounded-lg transition-all ${
                (message.trim() || attachedFiles.length > 0) && !isSending
                  ? "bg-gray-900 text-white hover:bg-gray-800 shadow-elegant"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title={t("message.send")}>
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Scheduled message indicator */}
        {scheduledFor && (
          <div className="mt-2 text-xs text-gray-500">
            {t("message.scheduled_for", {
              time: scheduledFor.toLocaleString(),
            })}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};
