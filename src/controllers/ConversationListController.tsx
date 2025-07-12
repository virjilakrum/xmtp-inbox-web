import { useConversations } from "../hooks/useV3Hooks";
import { CachedConversationWithId } from "../types/xmtpV3Types";
import { ConversationList } from "../component-library/components/ConversationList/ConversationList";
import { MessagePreviewCard } from "../component-library/components/MessagePreviewCard/MessagePreviewCard";
import { useXmtpStore } from "../store/xmtp";
import { useMemo, useCallback } from "react";
import { shortAddress } from "../helpers";

export const ConversationListController = () => {
  const { conversations, isLoading } = useConversations();
  const activeTab = useXmtpStore((s) => s.activeTab);
  const setActiveTab = useXmtpStore((s) => s.setActiveTab);
  const setConversationTopic = useXmtpStore((s) => s.setConversationTopic);

  // Filter conversations based on active tab
  const filteredConversations = useMemo(() => {
    if (!conversations.length) return [];

    return conversations.filter((conversation: any) => {
      // For now, V3 doesn't have built-in request/blocked filtering
      // We'll show all conversations under "messages" tab
      // In a full implementation, this would check consent states
      switch (activeTab) {
        case "messages":
          return true; // Show all conversations for now
        case "requests":
          // V3 implementation would check if conversation.isAllowed() === false
          // For now, return empty array as V3 auto-accepts conversations
          return false;
        case "blocked":
          // V3 implementation would check blocked conversations
          // For now, return empty array
          return false;
        default:
          return true;
      }
    });
  }, [conversations, activeTab]);

  // Handle conversation click
  const handleConversationClick = useCallback(
    (conversationId: string) => {
      setConversationTopic(conversationId);
    },
    [setConversationTopic],
  );

  // Convert filtered conversations to MessagePreviewCard components
  const conversationMessages = useMemo(() => {
    return filteredConversations.map((conversation: any) => {
      // Extract conversation data for V3
      const conversationId = conversation.id || "";
      const peerInboxId = conversation.peerInboxId || "";
      const lastMessage = conversation.lastMessage;

      // Get display text - last message content or placeholder
      const messageText = lastMessage?.content
        ? String(lastMessage.content).slice(0, 100) // Truncate long messages
        : "Start a conversation...";

      // Get timestamp - last message time or conversation created time
      const messageTime = lastMessage?.sentAtNs
        ? new Date(Number(lastMessage.sentAtNs) / 1000000) // Convert nanoseconds to milliseconds
        : conversation.createdAtNs
          ? new Date(Number(conversation.createdAtNs) / 1000000)
          : new Date();

      // Get display address - safely handle peerInboxId and ensure it's a string
      const safeAddress =
        peerInboxId && typeof peerInboxId === "string"
          ? peerInboxId
          : conversationId;
      const displayAddress =
        safeAddress && typeof safeAddress === "string"
          ? shortAddress(safeAddress)
          : "Unknown";

      // Get conversation topic for selection state
      const conversationTopic = useXmtpStore.getState().conversationTopic;
      const isSelected = conversationTopic === conversationId;

      return (
        <MessagePreviewCard
          key={conversationId}
          address={safeAddress || conversationId}
          displayAddress={displayAddress}
          text={messageText}
          datetime={messageTime}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allow={() => Promise.resolve()}
          isLoading={false}
          isSelected={isSelected}
          onClick={() => handleConversationClick(conversationId)}
          avatarUrl="" // Could be enhanced with avatar lookup
          conversationDomain="" // Could show app domain if available
          pinned={false} // Could implement pinning feature
        />
      );
    });
  }, [filteredConversations, activeTab, setActiveTab, handleConversationClick]);

  return (
    <ConversationList
      messages={conversationMessages}
      isLoading={isLoading}
      activeTab={activeTab}
      hasRecipientEnteredValue={false}
      setStartedFirstMessage={() => {
        // Set the started first message state to show the message input
        const setStartedFirstMessage =
          useXmtpStore.getState().setStartedFirstMessage;
        setStartedFirstMessage(true);
      }}
    />
  );
};

export default ConversationListController;
