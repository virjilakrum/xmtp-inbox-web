import { useState, useCallback, memo, useMemo } from "react";
import { MessageInput } from "../component-library/components/MessageInput/MessageInput";
import { InboxNotFoundError } from "../component-library/components/ErrorBoundary/InboxNotFoundError";
import { useStartConversation, useSendMessage } from "../hooks/useV3Hooks";
import { useXmtpStore } from "../store/xmtp";
import useSelectedConversation from "../hooks/useSelectedConversation";
import type { Attachment } from "@xmtp/content-type-remote-attachment";
import type { CachedConversationWithId } from "../types/xmtpV3Types";

interface MessageInputControllerProps {
  attachment?: Attachment;
  attachmentPreview?: string;
  setAttachment: (attachment: Attachment | undefined) => void;
  setAttachmentPreview: (preview: string | undefined) => void;
  setIsDragActive: (active: boolean) => void;
}

export const MessageInputController = memo(
  ({
    attachment,
    attachmentPreview,
    setAttachment,
    setAttachmentPreview,
    setIsDragActive,
  }: MessageInputControllerProps) => {
    const { startConversation } = useStartConversation();
    const { sendMessage } = useSendMessage();
    const recipientAddress = useXmtpStore((s) => s.recipientAddress);
    const conversationTopic = useXmtpStore((s) => s.conversationTopic);
    const { conversation } = useSelectedConversation();

    // Performance optimization: Memoized error state
    const [inboxNotFoundError, setInboxNotFoundError] = useState<string | null>(
      null,
    );
    const [isSending, setIsSending] = useState(false);
    const [lastSentMessage, setLastSentMessage] = useState<string>("");

    // Performance optimization: Memoized conversation validation
    const hasValidConversation = useMemo(() => {
      return Boolean(conversation || conversationTopic || recipientAddress);
    }, [conversation, conversationTopic, recipientAddress]);

    // Performance optimization: Memoized error clearing
    const clearError = useCallback(() => {
      setInboxNotFoundError(null);
    }, []);

    // Performance optimization: Memoized attachment clearing
    const clearAttachment = useCallback(() => {
      if (attachment) {
        setAttachment(undefined);
        setAttachmentPreview(undefined);
      }
    }, [attachment, setAttachment, setAttachmentPreview]);

    // Performance optimization: Enhanced message sending with better error handling
    const handleSendMessage = useCallback(
      async (message: string) => {
        if (!message.trim()) {
          console.warn("⚠️ Cannot send empty message");
          return;
        }

        if (isSending) {
          console.warn("⚠️ Message already being sent");
          return;
        }

        // Clear any previous error when starting a new message send
        clearError();
        setIsSending(true);
        setLastSentMessage(message);

        try {
          console.log("🔄 Starting message send process:", {
            message: message.slice(0, 50) + "...",
            hasConversation: !!conversation,
            hasConversationTopic: !!conversationTopic,
            recipientAddress,
          });

          // Use type that can handle both CachedConversationWithId and raw XMTP conversation
          let targetConversation: CachedConversationWithId | any = conversation;
          let targetConversationId = conversationTopic;

          // If no conversation is selected but we have a recipient address, start new conversation
          if (
            !targetConversation &&
            !targetConversationId &&
            recipientAddress
          ) {
            console.log(
              "🔄 V3 message input - starting new conversation with:",
              recipientAddress,
            );

            try {
              const result = await startConversation(recipientAddress);
              targetConversation = result.conversation;
              targetConversationId = result.conversation.id;

              // Update the conversation topic in store
              useXmtpStore
                .getState()
                .setConversationTopic(targetConversationId);

              console.log("✅ New conversation started:", targetConversationId);
            } catch (startConversationError) {
              console.error(
                "❌ Error starting conversation:",
                startConversationError,
              );

              // Check if it's a "No inbox found" error
              if (
                startConversationError instanceof Error &&
                startConversationError.message.includes("No inbox found")
              ) {
                setInboxNotFoundError(recipientAddress || "Unknown address");
                return; // Exit early, don't attempt to send message
              }

              // Re-throw other errors
              throw startConversationError;
            }
          }

          // Use conversation from selected conversation or conversation ID
          const conversationId = targetConversationId || targetConversation?.id;

          if (conversationId) {
            console.log(
              "🔄 V3 message input - sending message to:",
              conversationId,
            );

            // Performance optimization: Send message with progress tracking
            const startTime = Date.now();
            await sendMessage(conversationId, message);
            const endTime = Date.now();

            console.log("✅ V3 message input - message sent successfully", {
              duration: endTime - startTime,
              conversationId,
              messageLength: message.length,
            });

            // Clear attachment after successful send
            clearAttachment();

            // **FIX**: Message sent successfully - clear any previous errors
            clearError();
            setLastSentMessage("");
          } else {
            throw new Error("No conversation available to send message");
          }
        } catch (error) {
          console.error("❌ Error sending message:", error);

          // Enhanced error handling with specific error types
          if (error instanceof Error) {
            if (error.message.includes("No inbox found")) {
              setInboxNotFoundError(recipientAddress || "Unknown address");
            } else if (error.message.includes("No conversation available")) {
              // This is a different type of error - don't show inbox not found
              console.error("❌ Conversation setup failed:", error);
            } else if (error.message.includes("network")) {
              // Network errors - could show different UI feedback
              console.error("❌ Network error during message send:", error);
            } else {
              // For other errors, log but don't show modal (avoid false positives)
              console.error("❌ Message send failed:", error);
            }
          }
        } finally {
          setIsSending(false);
        }
      },
      [
        isSending,
        conversation,
        conversationTopic,
        recipientAddress,
        startConversation,
        sendMessage,
        clearError,
        clearAttachment,
      ],
    );

    // Performance optimization: Memoized retry handler
    const handleRetryMessage = useCallback(() => {
      clearError();
      if (lastSentMessage) {
        console.log("🔄 Retrying message send:", lastSentMessage);
        handleSendMessage(lastSentMessage);
      }
    }, [clearError, lastSentMessage, handleSendMessage]);

    // Performance optimization: Memoized error close handler
    const handleErrorClose = useCallback(() => {
      clearError();
      setLastSentMessage("");
    }, [clearError]);

    // Performance optimization: Memoized component props
    const messageInputProps = useMemo(
      () => ({
        attachment,
        attachmentPreview,
        setAttachment,
        setAttachmentPreview,
        setIsDragActive,
        onSendMessage: handleSendMessage,
        disabled: isSending || !hasValidConversation,
        placeholder: isSending ? "Sending..." : "Type a message...",
      }),
      [
        attachment,
        attachmentPreview,
        setAttachment,
        setAttachmentPreview,
        setIsDragActive,
        handleSendMessage,
        isSending,
        hasValidConversation,
      ],
    );

    console.log("🔄 MessageInputController render:", {
      hasConversation: !!conversation,
      hasConversationTopic: !!conversationTopic,
      recipientAddress,
      hasError: !!inboxNotFoundError,
      isSending,
      hasValidConversation,
    });

    return (
      <>
        <MessageInput {...messageInputProps} />

        {inboxNotFoundError && (
          <InboxNotFoundError
            recipientAddress={inboxNotFoundError}
            onRetry={handleRetryMessage}
            onClose={handleErrorClose}
          />
        )}
      </>
    );
  },
);

// Performance optimization: Display name for debugging
MessageInputController.displayName = "MessageInputController";

export default MessageInputController;
