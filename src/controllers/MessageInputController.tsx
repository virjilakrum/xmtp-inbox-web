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

  // TODO: Implement proper V3 message input logic
  return (
    <MessageInput
      attachment={attachment}
      attachmentPreview={attachmentPreview}
      setAttachment={setAttachment}
      setAttachmentPreview={setAttachmentPreview}
      setIsDragActive={setIsDragActive}
    />
  );
};

export default MessageInputController;
