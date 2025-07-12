import { useState } from "react";
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

export const MessageInputController = ({
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
  const [inboxNotFoundError, setInboxNotFoundError] = useState<string | null>(
    null,
  );

  // V3 message input logic - handles sending messages and attachments
  const handleSendMessage = async (message: string) => {
    try {
      // Use type that can handle both CachedConversationWithId and raw XMTP conversation
      let targetConversation: CachedConversationWithId | any = conversation;
      let targetConversationId = conversationTopic;

      // If no conversation is selected but we have a recipient address, start new conversation
      if (!targetConversation && !targetConversationId && recipientAddress) {
        console.log(
          "V3 message input - starting new conversation with:",
          recipientAddress,
        );
        const result = await startConversation(recipientAddress);
        targetConversation = result.conversation;
        targetConversationId = result.conversation.id;

        // Update the conversation topic in store
        useXmtpStore.getState().setConversationTopic(targetConversationId);
      }

      // Use conversation from selected conversation or conversation ID
      const conversationId = targetConversationId || targetConversation?.id;

      if (conversationId) {
        console.log("V3 message input - sending message:", message);
        await sendMessage(conversationId, message);

        // Clear attachment after sending
        if (attachment) {
          setAttachment(undefined);
          setAttachmentPreview(undefined);
        }

        console.log("V3 message input - message sent successfully");
      } else {
        throw new Error("No conversation available to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Check if it's a "No inbox found" error
      if (error instanceof Error && error.message.includes("No inbox found")) {
        setInboxNotFoundError(recipientAddress || "Unknown address");
      } else {
        // For other errors, you might want to show a general error message
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleRetryMessage = () => {
    setInboxNotFoundError(null);
    // Could implement retry logic here if needed
  };

  return (
    <>
      <MessageInput
        attachment={attachment}
        attachmentPreview={attachmentPreview}
        setAttachment={setAttachment}
        setAttachmentPreview={setAttachmentPreview}
        setIsDragActive={setIsDragActive}
        onSendMessage={handleSendMessage}
      />

      {inboxNotFoundError && (
        <InboxNotFoundError
          recipientAddress={inboxNotFoundError}
          onRetry={handleRetryMessage}
          onClose={() => setInboxNotFoundError(null)}
        />
      )}
    </>
  );
};

export default MessageInputController;
