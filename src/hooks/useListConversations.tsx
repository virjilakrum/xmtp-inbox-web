import { useConversations } from "./useV3Hooks";

export const useListConversations = () => {
  const conversations = useConversations();

  return {
    conversations,
    error: null,
    isLoading: false,
  };
};

export default useListConversations;
