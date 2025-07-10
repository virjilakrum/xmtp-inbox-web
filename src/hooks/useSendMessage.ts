import { useSendMessage } from "./useV3Hooks";
import { CachedConversation, CachedMessageWithId } from "../types/xmtpV3Types";

export const useSendMessageHook = () => {
  const { sendMessage } = useSendMessage();

  return {
    sendMessage: async (conversation: CachedConversation, content: any) => {
      try {
        const result = await sendMessage(conversation.id, content);
        return result as CachedMessageWithId | null;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
  };
};

export default useSendMessageHook;
