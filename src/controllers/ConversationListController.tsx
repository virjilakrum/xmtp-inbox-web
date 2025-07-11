import { useConversations } from "../hooks/useV3Hooks";
import { CachedConversationWithId } from "../types/xmtpV3Types";
import { ConversationList } from "../component-library/components/ConversationList/ConversationList";
import { MessagePreviewCard } from "../component-library/components/MessagePreviewCard/MessagePreviewCard";
import { useXmtpStore } from "../store/xmtp";

export const ConversationListController = () => {
  const { conversations, isLoading } = useConversations();
  const activeTab = useXmtpStore((s) => s.activeTab);
  const setActiveTab = useXmtpStore((s) => s.setActiveTab);

  // V3 conversation list logic - convert conversations to MessagePreviewCard components
  const conversationMessages = conversations.map((conversation: any) => (
    <MessagePreviewCard
      key={conversation.id || conversation.peerAddress}
      address={conversation.peerAddress || conversation.id}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      allow={() => Promise.resolve()}
      isLoading={false}
    />
  ));

  return (
    <ConversationList
      messages={conversationMessages}
      isLoading={isLoading}
      activeTab={activeTab}
      hasRecipientEnteredValue={false}
    />
  );
};

export default ConversationListController;
