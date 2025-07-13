import { useConversations } from "../hooks/useV3Hooks";
import { CachedConversationWithId } from "../types/xmtpV3Types";
import { ConversationList } from "../component-library/components/ConversationList/ConversationList";
import { MessagePreviewCard } from "../component-library/components/MessagePreviewCard/MessagePreviewCard";
import { useXmtpStore } from "../store/xmtp";
import { useMemo, useCallback, memo } from "react";
import { shortAddress, safeConvertTimestamp } from "../helpers";

// Performance optimization: Memoized conversation item to prevent unnecessary re-renders
const MemoizedMessagePreviewCard = memo(MessagePreviewCard);

// Performance optimization: Memoized conversation processor
const processConversationData = (conversation: any) => {
  const conversationId = conversation.id || "";
  const peerInboxId = conversation.peerInboxId || "";
  const lastMessage = conversation.lastMessage;

  // Get display text - last message content or placeholder
  const messageText = lastMessage?.content
    ? String(lastMessage.content).slice(0, 100) // Truncate long messages
    : "Start a conversation...";

  // Get timestamp - last message time or conversation created time (safely)
  const messageTime = lastMessage?.sentAtNs
    ? safeConvertTimestamp(lastMessage.sentAtNs)
    : conversation.createdAtNs
      ? safeConvertTimestamp(conversation.createdAtNs)
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

  return {
    conversationId,
    peerInboxId,
    lastMessage,
    messageText,
    messageTime,
    safeAddress,
    displayAddress,
  };
};

export const ConversationListController = memo(() => {
  const { conversations, isLoading } = useConversations();
  const activeTab = useXmtpStore((s) => s.activeTab);
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);
  const setActiveTab = useXmtpStore((s) => s.setActiveTab);
  const setConversationTopic = useXmtpStore((s) => s.setConversationTopic);

  // Performance optimization: Memoized conversation filtering
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

  // Performance optimization: Memoized conversation click handler
  const handleConversationClick = useCallback(
    (conversationId: string) => {
      console.log("🔄 Conversation selected:", conversationId);

      // **FIX**: Update all necessary store state for proper conversation selection
      const store = useXmtpStore.getState();

      // Set the conversation topic for useConversation hook
      setConversationTopic(conversationId);

      // **FIX**: Find the conversation and update recipient info
      const selectedConversation = conversations.find(
        (conv) => conv.id === conversationId,
      );
      if (selectedConversation) {
        console.log("✅ Found conversation:", {
          id: selectedConversation.id,
          peerInboxId: selectedConversation.peerInboxId,
          lastMessage: selectedConversation.lastMessage?.content?.slice(0, 50),
        });

        // Update recipient address for message input
        if (selectedConversation.peerInboxId) {
          store.setRecipientAddress(selectedConversation.peerInboxId);
        }

        // Clear any previous recipient input
        store.setRecipientInput("");

        // Set recipient state to ready
        store.setRecipientState("valid");

        // Set recipient as on network
        store.setRecipientOnNetwork(true);

        // Clear any previous errors
        store.setAttachmentError(null);

        console.log("✅ Store state updated for conversation:", conversationId);
      } else {
        console.warn("⚠️ Conversation not found in list:", conversationId);
      }
    },
    [setConversationTopic, conversations],
  );

  // Performance optimization: Memoized allow handler
  const handleAllow = useCallback(() => {
    return Promise.resolve();
  }, []);

  // Performance optimization: Memoized first message handler
  const handleStartedFirstMessage = useCallback(() => {
    const setStartedFirstMessage =
      useXmtpStore.getState().setStartedFirstMessage;
    setStartedFirstMessage(true);
  }, []);

  // Performance optimization: Memoized conversation processing and rendering
  const conversationMessages = useMemo(() => {
    console.log("🔄 Processing", filteredConversations.length, "conversations");

    return filteredConversations.map((conversation: any) => {
      const processedData = processConversationData(conversation);
      const isSelected = conversationTopic === processedData.conversationId;

      return (
        <MemoizedMessagePreviewCard
          key={processedData.conversationId}
          address={processedData.safeAddress || processedData.conversationId}
          displayAddress={processedData.displayAddress}
          text={processedData.messageText}
          datetime={processedData.messageTime}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allow={handleAllow}
          isLoading={false}
          isSelected={isSelected}
          onClick={() => handleConversationClick(processedData.conversationId)}
          avatarUrl="" // Could be enhanced with avatar lookup
          conversationDomain="" // Could show app domain if available
          pinned={false} // Could implement pinning feature
        />
      );
    });
  }, [
    filteredConversations,
    activeTab,
    conversationTopic,
    setActiveTab,
    handleConversationClick,
    handleAllow,
  ]);

  // Performance optimization: Memoized loading state
  const isShowingLoading = useMemo(() => {
    return isLoading || conversationMessages.length === 0;
  }, [isLoading, conversationMessages.length]);

  console.log("🔄 ConversationListController render:", {
    conversationCount: conversations.length,
    filteredCount: filteredConversations.length,
    activeTab,
    isLoading,
  });

  return (
    <ConversationList
      messages={conversationMessages}
      isLoading={isShowingLoading}
      activeTab={activeTab}
      hasRecipientEnteredValue={false}
      setStartedFirstMessage={handleStartedFirstMessage}
    />
  );
});

// Performance optimization: Display name for debugging
ConversationListController.displayName = "ConversationListController";

export default ConversationListController;
