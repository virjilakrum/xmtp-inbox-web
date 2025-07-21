import { useConversation, useConversations } from "./useV3Hooks";
import { useXmtpStore } from "../store/xmtp";
import { useMemo } from "react";
import { EnhancedConversation } from "../types/xmtpV3Types";

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
    const found = conversations.find(
      (conv: EnhancedConversation) => conv.id === conversationTopic,
    );

    if (found) {
      console.log("✅ Selected conversation found:", {
        id: found.id,
        peerAddress: found.peerAddress,
        hasLastMessage: !!found.lastMessage,
      });

      // Return the found conversation directly since it's already EnhancedConversation
      return found;
    } else {
      console.warn("⚠️ Selected conversation not found in list:", {
        conversationTopic,
        availableConversations: conversations.map(
          (c: EnhancedConversation) => c.id,
        ),
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
