import { useState, useCallback, memo, useMemo, useEffect } from "react";
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
    const { sendMessage, sendingMessages, messageQueue } = useSendMessage();
    const recipientAddress = useXmtpStore((s) => s.recipientAddress);
    const conversationTopic = useXmtpStore((s) => s.conversationTopic);
    const { conversation } = useSelectedConversation();

    // **PERFORMANCE**: Enhanced state management with optimistic updates
    const [inboxNotFoundError, setInboxNotFoundError] = useState<string | null>(
      null,
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSentMessage, setLastSentMessage] = useState<string>("");
    const [optimisticMessages, setOptimisticMessages] = useState<
      Map<
        string,
        {
          id: string;
          content: string;
          timestamp: number;
          status: "sending" | "sent" | "failed";
        }
      >
    >(new Map());

    // **PERFORMANCE**: Computed sending state
    const isSending = sendingMessages.length > 0 || isProcessing;
    const queuedCount = messageQueue.length;

    // **PERFORMANCE**: Debounced validation
    const hasValidConversation = useMemo(() => {
      return Boolean(conversation || conversationTopic || recipientAddress);
    }, [conversation, conversationTopic, recipientAddress]);

    // **PERFORMANCE**: Memoized error clearing
    const clearError = useCallback(() => {
      setInboxNotFoundError(null);
    }, []);

    // **PERFORMANCE**: Memoized attachment clearing
    const clearAttachment = useCallback(() => {
      if (attachment) {
        setAttachment(undefined);
        setAttachmentPreview(undefined);
      }
    }, [attachment, setAttachment, setAttachmentPreview]);

    // **PERFORMANCE**: Enhanced message sending with optimistic UI updates
    const handleSendMessage = useCallback(
      async (message: string) => {
        if (!message.trim()) {
          console.warn("⚠️ Cannot send empty message");
          return;
        }

        if (isProcessing) {
          console.warn("⚠️ Message already being processed");
          return;
        }

        // **PERFORMANCE**: Immediate optimistic UI update
        const optimisticId = `optimistic_${Date.now()}_${Math.random()}`;
        const optimisticMessage = {
          id: optimisticId,
          content: message.trim(),
          timestamp: Date.now(),
          status: "sending" as const,
        };

        setOptimisticMessages((prev) =>
          new Map(prev).set(optimisticId, optimisticMessage),
        );
        setIsProcessing(true);
        setLastSentMessage(message);

        // **PERFORMANCE**: Clear input immediately for better UX
        // This would be handled by the parent component

        try {
          console.log("🚀 Enhanced message send process:", {
            message: message.slice(0, 50) + "...",
            hasConversation: !!conversation,
            hasConversationTopic: !!conversationTopic,
            recipientAddress,
          });

          // **PERFORMANCE**: Parallel conversation setup and validation
          let targetConversation: CachedConversationWithId | any = conversation;
          let targetConversationId = conversationTopic;

          // **PERFORMANCE**: Fast conversation creation if needed
          if (
            !targetConversation &&
            !targetConversationId &&
            recipientAddress
          ) {
            console.log(
              "🚀 Enhanced conversation creation with:",
              recipientAddress,
            );

            try {
              const result = await startConversation(recipientAddress);
              targetConversation = result.conversation;
              targetConversationId = result.conversation.id;

              // **PERFORMANCE**: Immediate store update
              useXmtpStore
                .getState()
                .setConversationTopic(targetConversationId);
              console.log(
                "✅ Enhanced conversation created:",
                targetConversationId,
              );
            } catch (startConversationError) {
              console.error(
                "❌ Enhanced conversation creation failed:",
                startConversationError,
              );

              // **PERFORMANCE**: Update optimistic message status
              setOptimisticMessages((prev) => {
                const newMap = new Map(prev);
                const msg = newMap.get(optimisticId);
                if (msg) {
                  newMap.set(optimisticId, { ...msg, status: "failed" });
                }
                return newMap;
              });

              if (
                startConversationError instanceof Error &&
                startConversationError.message.includes("No inbox found")
              ) {
                setInboxNotFoundError(recipientAddress || "Unknown address");
                return;
              }

              throw startConversationError;
            }
          }

          const conversationId = targetConversationId || targetConversation?.id;

          if (conversationId) {
            console.log("🚀 Enhanced message send to:", conversationId);

            // **PERFORMANCE**: Send with optimistic ID for tracking
            const result = await sendMessage(
              conversationId,
              message.trim(),
              0,
              optimisticId,
            );

            if (result) {
              // **PERFORMANCE**: Update optimistic message with real data
              setOptimisticMessages((prev) => {
                const newMap = new Map(prev);
                const msg = newMap.get(optimisticId);
                if (msg) {
                  newMap.set(optimisticId, {
                    ...msg,
                    id: String(result.id || optimisticId),
                    status: "sent",
                  });
                }
                return newMap;
              });

              // **PERFORMANCE**: Auto-remove optimistic message after delay
              setTimeout(() => {
                setOptimisticMessages((prev) => {
                  const newMap = new Map(prev);
                  newMap.delete(optimisticId);
                  return newMap;
                });
              }, 5000); // Remove after 5 seconds to let real message appear
            }
          } else {
            console.error("❌ No conversation ID available for sending");
            throw new Error("No conversation available");
          }
        } catch (error) {
          console.error("❌ Enhanced message send failed:", error);

          // **PERFORMANCE**: Update optimistic message status to failed
          setOptimisticMessages((prev) => {
            const newMap = new Map(prev);
            const msg = newMap.get(optimisticId);
            if (msg) {
              newMap.set(optimisticId, { ...msg, status: "failed" });
            }
            return newMap;
          });

          // **PERFORMANCE**: Auto-remove failed optimistic message after delay
          setTimeout(() => {
            setOptimisticMessages((prev) => {
              const newMap = new Map(prev);
              newMap.delete(optimisticId);
              return newMap;
            });
          }, 10000); // Remove after 10 seconds
        } finally {
          setIsProcessing(false);
        }
      },
      [
        conversation,
        conversationTopic,
        recipientAddress,
        startConversation,
        sendMessage,
        isProcessing,
      ],
    );

    // **PERFORMANCE**: Auto-cleanup failed optimistic messages
    useEffect(() => {
      const cleanup = setInterval(() => {
        setOptimisticMessages((prev) => {
          const now = Date.now();
          const newMap = new Map();

          prev.forEach((msg, id) => {
            // Keep messages that are less than 30 seconds old or still sending
            if (now - msg.timestamp < 30000 || msg.status === "sending") {
              newMap.set(id, msg);
            }
          });

          return newMap;
        });
      }, 5000);

      return () => clearInterval(cleanup);
    }, []);

    // **PERFORMANCE**: Memoized retry handler
    const handleRetryMessage = useCallback(() => {
      clearError();
      if (lastSentMessage) {
        console.log("🔄 Retrying message send:", lastSentMessage);
        handleSendMessage(lastSentMessage);
      }
    }, [clearError, lastSentMessage, handleSendMessage]);

    // **PERFORMANCE**: Memoized error close handler
    const handleErrorClose = useCallback(() => {
      clearError();
      setLastSentMessage("");
    }, [clearError]);

    // **PERFORMANCE**: Enhanced component props with loading states
    const messageInputProps = useMemo(
      () => ({
        attachment,
        attachmentPreview,
        setAttachment,
        setAttachmentPreview,
        setIsDragActive,
        onSendMessage: handleSendMessage,
        disabled: isProcessing || !hasValidConversation,
        placeholder: isProcessing
          ? "Sending..."
          : isSending
            ? `Sending ${queuedCount > 0 ? `(${queuedCount} queued)` : ""}...`
            : "Type a message...",
        optimisticMessages: Array.from(optimisticMessages.values()),
      }),
      [
        attachment,
        attachmentPreview,
        setAttachment,
        setAttachmentPreview,
        setIsDragActive,
        handleSendMessage,
        isProcessing,
        isSending,
        queuedCount,
        hasValidConversation,
        optimisticMessages,
      ],
    );

    console.log("🚀 Fast MessageInputController render:", {
      hasConversation: !!conversation,
      hasConversationTopic: !!conversationTopic,
      recipientAddress,
      hasError: !!inboxNotFoundError,
      isProcessing,
      isSending,
      queuedCount,
      optimisticCount: optimisticMessages.size,
      hasValidConversation,
      conversationDetails: conversation
        ? {
            id: conversation.id,
            peerAddress: conversation.peerAddress,
            topic: conversation.topic,
          }
        : null,
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
