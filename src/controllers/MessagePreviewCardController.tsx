import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ContentTypeReply, type Reply } from "@xmtp/content-type-reply";
import type { Attachment } from "@xmtp/content-type-remote-attachment";
import {
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
} from "@xmtp/content-type-remote-attachment";
import type { Reaction } from "@xmtp/content-type-reaction";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";
import { ContentTypeScreenEffect } from "@xmtp/experimental-content-type-screen-effect";
import { ContentTypeText } from "@xmtp/content-type-text";
import { MessagePreviewCard } from "../component-library/components/MessagePreviewCard/MessagePreviewCard";
import type { ETHAddress } from "../helpers";
import { shortAddress } from "../helpers";
import { useXmtpStore } from "../store/xmtp";
import {
  getCachedPeerAddressAvatar,
  getCachedPeerAddressName,
} from "../helpers/conversation";
// V3 imports
import { CachedConversationWithId } from "../types/xmtpV3Types";
import { useConsent } from "../hooks/useV3Hooks";

interface MessagePreviewCardControllerProps {
  convo: CachedConversationWithId;
}

export const MessagePreviewCardController = ({
  convo,
}: MessagePreviewCardControllerProps) => {
  const { t } = useTranslation();
  const { allow } = useConsent();
  // V3 useLastMessage equivalent - get last message from conversation
  const lastMessage = useMemo(() => {
    // V3 implementation would load the last message from the conversation
    // For now, return a placeholder structure
    return {
      content: "Latest message...",
      sentAt: new Date(),
    };
  }, [convo]);

  // XMTP State
  const recipientAddress = useXmtpStore((s) => s.recipientAddress);
  const activeTab = useXmtpStore((s) => s.activeTab);

  const setRecipientInput = useXmtpStore((s) => s.setRecipientInput);
  const setRecipientAddress = useXmtpStore((s) => s.setRecipientAddress);
  const setRecipientName = useXmtpStore((s) => s.setRecipientName);
  const setRecipientAvatar = useXmtpStore((s) => s.setRecipientAvatar);
  const setRecipientState = useXmtpStore((s) => s.setRecipientState);
  const setRecipientOnNetwork = useXmtpStore((s) => s.setRecipientOnNetwork);
  const setConversationTopic = useXmtpStore((s) => s.setConversationTopic);
  const setActiveMessage = useXmtpStore((s) => s.setActiveMessage);
  const setActiveTab = useXmtpStore((s) => s.setActiveTab);

  const conversationTopic = useXmtpStore((state) => state.conversationTopic);

  // Helpers
  const isSelected = conversationTopic === convo.id; // V3 uses id instead of topic

  const onConvoClick = useCallback(
    async (conversation: CachedConversationWithId) => {
      // **XMTP V3**: Safely get peer address (could be async function despite typing)
      let peerAddress: string;
      const rawPeerAddress = (conversation as any).peerAddress;

      if (typeof rawPeerAddress === "function") {
        try {
          peerAddress = await rawPeerAddress();
        } catch (error) {
          console.error("❌ Error getting peer address:", error);
          peerAddress = conversation.peerInboxId || "unknown";
        }
      } else {
        peerAddress = rawPeerAddress || conversation.peerInboxId || "unknown";
      }

      if (recipientAddress !== peerAddress) {
        const avatar = getCachedPeerAddressAvatar(conversation);
        setRecipientAvatar(avatar || "");
        const name = getCachedPeerAddressName(conversation);
        setRecipientName(name || "");
        setRecipientAddress(peerAddress); // Now guaranteed to be string
        setRecipientOnNetwork(true);
        setRecipientState("valid");
        setRecipientInput(peerAddress);
      }
      if (conversationTopic !== conversation.id) {
        setConversationTopic(conversation.id);
        setActiveMessage(null);
      }
    },
    [
      conversationTopic,
      recipientAddress,
      setConversationTopic,
      setRecipientAddress,
      setRecipientAvatar,
      setRecipientInput,
      setRecipientName,
      setRecipientOnNetwork,
      setRecipientState,
      setActiveMessage,
    ],
  );

  const conversationDomain = convo?.id.split("/")[0] ?? ""; // V3 uses id

  const messagePreview = useMemo(() => {
    if (lastMessage) {
      // V3 message preview logic
      const content = String(lastMessage.content);
      return content.length > 50 ? `${content.substring(0, 50)}...` : content;
    }
    return t("messages.no_preview");
  }, [lastMessage, t]);

  return (
    <MessagePreviewCard
      isSelected={isSelected}
      key={convo.id}
      text={messagePreview}
      datetime={lastMessage ? lastMessage.sentAt : new Date()} // V3 conversation timestamp
      displayAddress={
        getCachedPeerAddressName(convo) ?? shortAddress(convo?.id || "")
      }
      onClick={() => {
        if (convo) {
          void onConvoClick?.(convo);
        }
      }}
      avatarUrl={getCachedPeerAddressAvatar(convo) || ""}
      conversationDomain={shortAddress(conversationDomain)}
      address={convo?.id}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      allow={allow}
    />
  );
};
