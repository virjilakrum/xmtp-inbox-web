import { useConversation } from "./useV3Hooks";
import { CachedConversationWithId } from "../types/xmtpV3Types";

export const useSelectedConversation = () => {
  const { conversation } = useConversation();

  return {
    conversation: conversation as CachedConversationWithId | null,
    isLoading: false,
    error: null,
  };
};

export default useSelectedConversation;
