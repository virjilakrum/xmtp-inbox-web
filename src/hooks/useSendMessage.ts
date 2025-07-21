import { useSendMessage } from "./useV3Hooks";
import { CachedConversation, CachedMessageWithId } from "../types/xmtpV3Types";

export const useSendMessageHook = () => {
  const { sendMessage } = useSendMessage();

  return {
    sendMessage: async (
      conversation: CachedConversation,
      content: any,
    ): Promise<any> => {
      try {
        // Send message using the V3 hook - it returns a different structure
        const result = await sendMessage(conversation.id, content);

        // The result from useV3Hooks.sendMessage has structure:
        // { id: string, conversationId: string, content: any, optimisticId?: string, pending?: boolean }
        // We return it as-is since it's not exactly CachedMessageWithId
        return result;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
  };
};

export default useSendMessageHook;
