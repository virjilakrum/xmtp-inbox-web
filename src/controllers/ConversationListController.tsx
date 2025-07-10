import { useConversations } from "../hooks/useV3Hooks";
import { CachedConversationWithId } from "../types/xmtpV3Types";

export const ConversationListController = () => {
  const conversations = useConversations();

  // TODO: Implement proper V3 conversation list logic
  return null;
};

export default ConversationListController;
