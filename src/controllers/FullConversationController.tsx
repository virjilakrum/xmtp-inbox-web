/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { isSameDay } from "date-fns";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import type { EffectType } from "@xmtp/experimental-content-type-screen-effect";
import { DateDivider } from "../component-library/components/DateDivider/DateDivider";
import { FullConversation } from "../component-library/components/FullConversation/FullConversation";
import { FullMessageController } from "./FullMessageController";
import { isMessageSupported } from "../helpers/isMessagerSupported";
import { updateConversationIdentity } from "../helpers/conversation";
import SnowEffect from "../component-library/components/ScreenEffects/SnowEffect";
import RainEffect from "../component-library/components/ScreenEffects/RainEffect";
import { useXmtpStore } from "../store/xmtp";
import { AcceptOrDeny } from "../component-library/components/FullConversation/AcceptOrDeny";
// V3 imports
import { useDb, useClient } from "../hooks/useV3Hooks";
import type { ContentTypeId } from "@xmtp/content-type-primitives";

// V3 conversation type
type CachedConversation = {
  peerAddress: string;
  topic?: string;
  conversationId?: string;
  // Add other properties as needed
};

// V3 message type
type V3Message = {
  id: string;
  uuid: string;
  xmtpID: string;
  content: any;
  contentFallback?: string;
  contentType: string;
  conversationTopic: string;
  senderAddress: string;
  sentAt: Date;
  effectType?: EffectType;
};

// Real V3 useMessages hook implementation
const useMessages = (
  conversation: CachedConversation,
): { messages: V3Message[]; isLoading: boolean } => {
  const client = useClient();
  const [messages, setMessages] = useState<V3Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!client || !conversation.conversationId) return;

    setIsLoading(true);
    try {
      // Get V3 conversation by ID
      const v3Conversation = await client.conversations.getConversationById(
        conversation.conversationId,
      );
      if (!v3Conversation) {
        setMessages([]);
        return;
      }

      // Load messages from V3 conversation
      const v3Messages = await v3Conversation.messages();

      // Convert V3 messages to our format
      const convertedMessages: V3Message[] = v3Messages.map((msg: any) => ({
        id: msg.id,
        uuid: msg.id, // V3 uses id
        xmtpID: msg.id, // V3 uses id
        content: msg.content,
        contentFallback: msg.fallback,
        contentType: msg.contentType?.toString() || "",
        conversationTopic: conversation.topic || "",
        senderAddress: msg.senderInboxId || "", // V3 uses inboxId
        sentAt: new Date(Number(msg.sentAtNs) / 1000000), // Convert nanoseconds to milliseconds
        effectType: msg.content?.effectType,
      }));

      setMessages(convertedMessages);
    } catch (error) {
      console.error("Error loading V3 messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [client, conversation.conversationId, conversation.topic]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return { messages, isLoading };
};

type FullConversationControllerProps = {
  conversation: CachedConversation;
};

export const FullConversationController: React.FC<
  FullConversationControllerProps
> = ({ conversation }) => {
  const lastMessageDateRef = useRef<Date>();
  const renderedDatesRef = useRef<Date[]>([]);
  const [effect, setEffect] = useState<EffectType | undefined>(undefined);

  const { db } = useDb();
  const [messageId, setMessageId] = useState<string>("");
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);

  useEffect(() => {
    // TODO: Update for V3 - db type is different
    // void updateConversationIdentity(conversation, db);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.peerAddress]);

  // XMTP Hooks
  const { messages, isLoading } = useMessages(conversation);

  const messagesWithDates = useMemo(
    () =>
      messages?.map((msg, index) => {
        // TODO: Update for V3 ContentTypeId handling
        // const contentType = ContentTypeId.fromString(msg.contentType);
        // if the message content type is not support and has no fallback,
        // disregard it

        // In this component so it takes up the entirety of the conversation view
        if (
          msg.content?.effectType === "SNOW" &&
          msg.conversationTopic === conversationTopic
        ) {
          if (!localStorage.getItem(String(msg.id))) {
            setEffect("SNOW");
            setMessageId(String(msg.id));
          }
        }
        if (
          msg.content?.effectType === "RAIN" &&
          msg.conversationTopic === conversationTopic
        ) {
          if (!localStorage.getItem(String(msg.id))) {
            setEffect("RAIN");
            setMessageId(String(msg.id));
          }
        }

        if (
          !isMessageSupported(msg) &&
          !msg.contentFallback // TODO: Update ContentTypeReply check for V3
        ) {
          return null;
        }
        if (renderedDatesRef.current.length === 0) {
          renderedDatesRef.current.push(msg.sentAt);
        }
        const lastRenderedDate = renderedDatesRef.current.at(-1) as Date;
        const isFirstMessage = index === 0;
        const isSameDate = isSameDay(lastRenderedDate, msg.sentAt);
        const shouldDisplayDate = isFirstMessage || !isSameDate;

        if (shouldDisplayDate) {
          renderedDatesRef.current.push(msg.sentAt);
        }

        const messageDiv = (
          <div key={msg.uuid}>
            {shouldDisplayDate && (
              <DateDivider date={renderedDatesRef.current.at(-1) as Date} />
            )}
            <FullMessageController message={msg} conversation={conversation} />
          </div>
        );
        lastMessageDateRef.current = msg.sentAt;
        return msg?.content?.effectType || !msg.content ? null : messageDiv;
      }),
    [messages, conversation, conversationTopic],
  );

  return (
    <div
      id="scrollableDiv"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className="w-full h-full flex flex-col overflow-auto relative pb-4">
      {effect === "SNOW" ? (
        <SnowEffect messageId={messageId} key={messageId} />
      ) : effect === "RAIN" ? (
        <RainEffect messageId={messageId} key={messageId} />
      ) : null}
      <FullConversation isLoading={isLoading} messages={messagesWithDates} />
      <AcceptOrDeny peerAddress={conversation.peerAddress} />
    </div>
  );
};
