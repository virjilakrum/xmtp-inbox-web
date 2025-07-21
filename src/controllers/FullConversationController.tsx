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
import { safeConvertTimestamp } from "../helpers";
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
  metadata?: {
    id: string;
    deliveryStatus: "sending" | "sent" | "delivered" | "read" | "failed";
    isEdited: boolean;
    reactions: Record<string, any>;
    mentions: string[];
    links: string[];
    attachments: any[];
    isEncrypted: boolean;
    encryptionLevel: "transport" | "conversation" | "message";
  };
};

// **PERFORMANCE**: Real V3 useMessages hook with fast updates and caching
const useMessages = (
  conversation: CachedConversation,
): { messages: V3Message[]; isLoading: boolean; error: string | null } => {
  const client = useClient();
  const [messages, setMessages] = useState<V3Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesCache = useRef<Map<string, V3Message[]>>(new Map());
  const lastLoadTime = useRef<number>(0);
  const retryCount = useRef<number>(0);
  const maxRetries = 3;

  const loadMessages = useCallback(
    async (forceRefresh = false) => {
      if (!client || !conversation.conversationId) {
        console.log("❌ No client or conversation ID available");
        setError("No client or conversation ID available");
        return;
      }

      // **PERFORMANCE**: Check cache first for instant loading
      const cacheKey = conversation.conversationId;
      const cached = messagesCache.current.get(cacheKey);
      const now = Date.now();

      // Use cache if available and less than 5 seconds old (unless forced refresh)
      if (!forceRefresh && cached && now - lastLoadTime.current < 5000) {
        console.log("🚀 Fast using cached messages:", cached.length);
        setMessages(cached);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(
          "🔄 Loading messages for conversation:",
          conversation.conversationId,
        );

        // **PERFORMANCE**: Get V3 conversation with timeout
        const conversationPromise = client.conversations.getConversationById(
          conversation.conversationId,
        );
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Conversation load timeout")),
            10000,
          ),
        );

        const v3Conversation = await Promise.race([
          conversationPromise,
          timeoutPromise,
        ]);

        if (!v3Conversation) {
          console.log("❌ No conversation found");
          setMessages([]);
          setError("Conversation not found");
          return;
        }

        console.log("✅ Conversation loaded, loading messages...");

        // **PERFORMANCE**: Load messages with timeout
        const messagesPromise = (v3Conversation as any).messages();
        const messagesTimeoutPromise = new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error("Messages load timeout")), 15000),
        );

        const v3Messages = await Promise.race([
          messagesPromise,
          messagesTimeoutPromise,
        ]);

        if (!v3Messages || !Array.isArray(v3Messages)) {
          console.log("❌ No messages or invalid messages array");
          setMessages([]);
          setError("No messages available");
          return;
        }

        // **PERFORMANCE**: Process messages efficiently
        const processedMessages = v3Messages
          .filter((msg: any) => msg && msg.id)
          .map((msg: any) => ({
            id: msg.id,
            uuid: msg.id,
            xmtpID: msg.id,
            content: msg.content || {},
            contentFallback: msg.contentFallback,
            contentType: msg.contentType || "text",
            conversationTopic: conversation.conversationId || "",
            senderAddress: msg.senderAddress || "",
            sentAt: new Date(msg.sentAt || Date.now()),
            effectType: msg.content?.effectType,
          }))
          .sort(
            (a: V3Message, b: V3Message) =>
              a.sentAt.getTime() - b.sentAt.getTime(),
          );

        console.log("✅ Messages processed:", processedMessages.length);

        // **PERFORMANCE**: Update cache and state
        messagesCache.current.set(cacheKey, processedMessages);
        lastLoadTime.current = now;
        setMessages(processedMessages);
        setError(null);
        retryCount.current = 0;
      } catch (loadError) {
        console.error("❌ Error loading messages:", loadError);

        // **PERFORMANCE**: Retry logic with exponential backoff
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          const delay = Math.pow(2, retryCount.current) * 1000;
          console.log(
            `🔄 Retrying in ${delay}ms (attempt ${retryCount.current}/${maxRetries})`,
          );

          setTimeout(() => {
            loadMessages(forceRefresh);
          }, delay);
        } else {
          setError(
            `Failed to load messages: ${loadError instanceof Error ? loadError.message : "Unknown error"}`,
          );
          setMessages([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client, conversation.conversationId],
  );

  // **PERFORMANCE**: Load messages on mount and conversation change
  useEffect(() => {
    if (conversation.conversationId) {
      console.log(
        "🔄 Conversation changed, loading messages:",
        conversation.conversationId,
      );
      loadMessages();
    }
  }, [conversation.conversationId, loadMessages]);

  // **PERFORMANCE**: Handle real-time message updates
  useEffect(() => {
    const handleFastMessageReceived = (event: CustomEvent) => {
      const { message, conversationId } = event.detail;

      if (conversationId === conversation.conversationId) {
        console.log("🚀 Fast message received:", message.id);

        setMessages((prev) => {
          const newMessages = [...prev];
          const existingIndex = newMessages.findIndex(
            (m) => m.id === message.id,
          );

          if (existingIndex >= 0) {
            newMessages[existingIndex] = message;
          } else {
            newMessages.push(message);
          }

          // Update cache
          messagesCache.current.set(conversation.conversationId!, newMessages);
          return newMessages.sort(
            (a, b) => a.sentAt.getTime() - b.sentAt.getTime(),
          );
        });
      }
    };

    const handleOptimisticMessageSent = (event: CustomEvent) => {
      const { message, conversationId } = event.detail;

      if (conversationId === conversation.conversationId) {
        console.log("🚀 Optimistic message sent:", message.id);

        setMessages((prev) => {
          const newMessages = [...prev];
          const existingIndex = newMessages.findIndex(
            (m) => m.id === message.id,
          );

          if (existingIndex >= 0) {
            newMessages[existingIndex] = message;
          } else {
            newMessages.push(message);
          }

          // Update cache
          messagesCache.current.set(conversation.conversationId!, newMessages);
          return newMessages.sort(
            (a, b) => a.sentAt.getTime() - b.sentAt.getTime(),
          );
        });
      }
    };

    const handleMessageSentSuccess = (event: CustomEvent) => {
      const { messageId, conversationId, optimisticId } = event.detail;

      if (conversationId === conversation.conversationId) {
        console.log("✅ Message sent successfully:", messageId);

        setMessages((prev) => {
          const newMessages = prev.map((msg) => {
            if (msg.id === optimisticId) {
              return {
                ...msg,
                id: messageId,
                metadata: {
                  ...msg.metadata,
                  id: messageId,
                  deliveryStatus: "sent" as const,
                },
              } as V3Message;
            }
            return msg;
          });

          // Update cache
          messagesCache.current.set(conversation.conversationId!, newMessages);
          return newMessages;
        });
      }
    };

    const handleMessageSentError = (event: CustomEvent) => {
      const { conversationId, optimisticId, error } = event.detail;

      if (conversationId === conversation.conversationId) {
        console.log("❌ Message sent error:", error);

        setMessages((prev) => {
          const newMessages = prev.map((msg) => {
            if (msg.id === optimisticId) {
              return {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  id: msg.id,
                  deliveryStatus: "failed" as const,
                },
              } as V3Message;
            }
            return msg;
          });

          // Update cache
          messagesCache.current.set(conversation.conversationId!, newMessages);
          return newMessages;
        });
      }
    };

    const handleConversationMessageUpdated = (event: CustomEvent) => {
      const { message, conversationId } = event.detail;

      if (conversationId === conversation.conversationId) {
        console.log("🔄 Conversation message updated:", message.id);

        setMessages((prev) => {
          const newMessages = [...prev];
          const existingIndex = newMessages.findIndex(
            (m) => m.id === message.id,
          );

          if (existingIndex >= 0) {
            newMessages[existingIndex] = message;
          } else {
            newMessages.push(message);
          }

          // Update cache
          messagesCache.current.set(conversation.conversationId!, newMessages);
          return newMessages.sort(
            (a, b) => a.sentAt.getTime() - b.sentAt.getTime(),
          );
        });
      }
    };

    const handleRefreshConversation = (event: CustomEvent) => {
      const { conversationId } = event.detail;

      if (conversationId === conversation.conversationId) {
        console.log("🔄 Refreshing conversation messages");
        loadMessages(true);
      }
    };

    window.addEventListener(
      "xmtp-fast-message-received",
      handleFastMessageReceived as EventListener,
    );
    window.addEventListener(
      "xmtp-optimistic-message-sent",
      handleOptimisticMessageSent as EventListener,
    );
    window.addEventListener(
      "xmtp-message-sent-success",
      handleMessageSentSuccess as EventListener,
    );
    window.addEventListener(
      "xmtp-message-sent-error",
      handleMessageSentError as EventListener,
    );
    window.addEventListener(
      "xmtp-conversation-message-updated",
      handleConversationMessageUpdated as EventListener,
    );
    window.addEventListener(
      "xmtp-conversation-refresh",
      handleRefreshConversation as EventListener,
    );

    return () => {
      window.removeEventListener(
        "xmtp-fast-message-received",
        handleFastMessageReceived as EventListener,
      );
      window.removeEventListener(
        "xmtp-optimistic-message-sent",
        handleOptimisticMessageSent as EventListener,
      );
      window.removeEventListener(
        "xmtp-message-sent-success",
        handleMessageSentSuccess as EventListener,
      );
      window.removeEventListener(
        "xmtp-message-sent-error",
        handleMessageSentError as EventListener,
      );
      window.removeEventListener(
        "xmtp-conversation-message-updated",
        handleConversationMessageUpdated as EventListener,
      );
      window.removeEventListener(
        "xmtp-conversation-refresh",
        handleRefreshConversation as EventListener,
      );
    };
  }, [conversation.conversationId, loadMessages]);

  return { messages, isLoading, error };
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

  const { isReady } = useDb();
  const [messageId, setMessageId] = useState<string>("");
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);

  useEffect(() => {
    // V3 conversation identity update
    // V3 handles conversation identity automatically through the client
    console.log(
      "V3 conversation identity managed by client for:",
      conversation.peerAddress,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.peerAddress]);

  // XMTP Hooks
  const { messages, isLoading, error } = useMessages(conversation);

  // **PERFORMANCE**: Enhanced debugging
  useEffect(() => {
    console.log("📊 FullConversationController state:", {
      conversationId: conversation.conversationId,
      messagesCount: messages.length,
      isLoading,
      error,
      isReady,
    });
  }, [conversation.conversationId, messages.length, isLoading, error, isReady]);

  const messagesWithDates = useMemo(
    () =>
      messages?.map((msg, index) => {
        // V3 ContentTypeId handling
        // V3 content types are handled differently, using string representation
        // Content type support is checked in isMessageSupported function
        console.log("V3 content type:", msg.contentType);

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
          !msg.contentFallback // V3 uses contentFallback for unsupported content types
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

  // **PERFORMANCE**: Show error state if loading failed
  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            Failed to load messages
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
