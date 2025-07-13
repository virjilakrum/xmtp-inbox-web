import { useConversation, useConversations } from "./useV3Hooks";
import { useXmtpStore } from "../store/xmtp";
import { useMemo } from "react";
import { CachedConversationWithId } from "../types/xmtpV3Types";

export const useSelectedConversation = () => {
  const { conversations } = useConversations();
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);

  // **FIX**: Find the selected conversation from the conversations list
  const selectedConversation = useMemo(() => {
    if (!conversationTopic || !conversations.length) {
      console.log(
        "🔄 No conversation selected or no conversations available:",
        {
          conversationTopic,
          conversationsCount: conversations.length,
        },
      );
      return null;
    }

    // Find the conversation by ID
    const found = conversations.find((conv) => conv.id === conversationTopic);

    if (found) {
      console.log("✅ Selected conversation found:", {
        id: found.id,
        peerInboxId: found.peerInboxId,
        hasLastMessage: !!found.lastMessage,
      });

      // **FIX**: Return the found conversation directly since it should already be compatible
      // The conversations from useConversations should already be in the correct format
      return found as CachedConversationWithId;
    } else {
      console.warn("⚠️ Selected conversation not found in list:", {
        conversationTopic,
        availableConversations: conversations.map((c) => c.id),
      });
      return null;
    }
  }, [conversationTopic, conversations]);

  return {
    conversation: selectedConversation,
    isLoading: false,
    error: null,
  };
};

export default useSelectedConversation;
