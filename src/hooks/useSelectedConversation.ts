import { useConversation } from "./useV3Hooks";
import { useXmtpStore } from "../store/xmtp";

export const useSelectedConversation = () => {
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);

  // Use the useConversation hook to get the selected conversation directly by its topic
  // This is more reliable than searching through the list, especially for new conversations
  const { conversation, isLoading, error } = useConversation(
    conversationTopic || "",
  );

  return {
    conversation,
    isLoading,
    error,
  };
};

export default useSelectedConversation;
