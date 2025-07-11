import type { Attachment } from "@xmtp/content-type-remote-attachment";
import { useStartConversation } from "../hooks/useV3Hooks";
import { MessageInput } from "../component-library/components/MessageInput/MessageInput";
import useSendMessage from "../hooks/useSendMessage";
import useSelectedConversation from "../hooks/useSelectedConversation";
import { useXmtpStore } from "../store/xmtp";

interface MessageInputControllerProps {
  attachment?: Attachment;
  attachmentPreview?: string;
  setAttachment: (attachment: Attachment | undefined) => void;
  setAttachmentPreview: (url: string | undefined) => void;
  setIsDragActive: (status: boolean) => void;
}

export const MessageInputController = ({
  attachment,
  attachmentPreview,
  setAttachment,
  setAttachmentPreview,
  setIsDragActive,
}: MessageInputControllerProps) => {
  const { startConversation } = useStartConversation();
  const recipientAddress = useXmtpStore((s) => s.recipientAddress);
  const { sendMessage } = useSendMessage();
  const { conversation } = useSelectedConversation();

  // V3 message input logic - handles sending messages and attachments
  const handleSendMessage = async (message: string) => {
    try {
      let activeConversation = conversation;

      // If no conversation selected, start a new one
      if (!activeConversation && recipientAddress) {
        console.log(
          "V3 message input - starting new conversation with:",
          recipientAddress,
        );
        const result = await startConversation(recipientAddress);
        // Map V3 conversation to CachedConversationWithId format
        activeConversation = {
          conversation: result.conversation as any,
          peerAddress: recipientAddress,
          id: result.conversation.id || recipientAddress,
        };
      }

      if (activeConversation) {
        console.log("V3 message input - sending message:", message);
        await sendMessage(
          (activeConversation.conversation || activeConversation) as any,
          message,
        );

        // Clear attachment after sending
        if (attachment) {
          setAttachment(undefined);
          setAttachmentPreview(undefined);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <MessageInput
      attachment={attachment}
      attachmentPreview={attachmentPreview}
      setAttachment={setAttachment}
      setAttachmentPreview={setAttachmentPreview}
      setIsDragActive={setIsDragActive}
      onSendMessage={handleSendMessage}
    />
  );
};

export default MessageInputController;
