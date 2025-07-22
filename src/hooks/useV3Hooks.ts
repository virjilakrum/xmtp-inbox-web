import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { Client } from "@xmtp/browser-sdk";
import { useXmtpStore } from "../store/xmtp";
import { type EnhancedConversation } from "../types/xmtpV3Types";
import useXmtpV3Client from "./useXmtpV3Client";

// XMTP V3 Context
interface XmtpV3ContextType {
  client: any;
  isLoading: boolean;
  error: string | null;
}

const XmtpV3Context = createContext<XmtpV3ContextType | null>(null);

export const useXmtpV3Context = () => {
  const context = useContext(XmtpV3Context);
  if (!context) {
    throw new Error("useXmtpV3Context must be used within XmtpV3Provider");
  }
  return context;
};

// **XMTP V3 CORE HOOKS**

export const useClient = () => {
  const clientState = useXmtpV3Client();
  return clientState.client;
};

export const useConversations = () => {
  const client = useClient();
  const [conversations, setConversations] = useState<EnhancedConversation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const conversationsCache = useRef<Map<string, EnhancedConversation[]>>(
    new Map(),
  );

  const loadConversations = useCallback(
    async (forceRefresh = false) => {
      if (!client) {
        setConversations([]);
        return;
      }

      const cacheKey = `${client.inboxId || "unknown"}_conversations`;

      // Check cache first
      if (!forceRefresh && conversationsCache.current.has(cacheKey)) {
        const cached = conversationsCache.current.get(cacheKey)!;
        setConversations(cached);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 XMTP V3 - Loading conversations...");
        const startTime = Date.now();

        // Get conversations from XMTP V3
        const convos = await client.conversations.list();

        // **XMTP V3**: Process conversations with async peerAddress
        const enhancedConvos: EnhancedConversation[] = [];

        for (const convo of convos) {
          try {
            // **XMTP V3**: Handle both Group and Dm types
            let peerAddress = "unknown";
            let peerInboxId = undefined;
            let topic = undefined;
            let isGroup = false;
            let lastMessage = undefined;
            let unreadCount = 0;

            // **XMTP V3**: Check if it's a DM (Direct Message)
            if ((convo as any).isDm || (convo as any).kind === "dm") {
              // For DM conversations
              if (typeof (convo as any).peerAddress === "function") {
                peerAddress = await (convo as any).peerAddress();
              } else if ((convo as any).peerInboxId) {
                peerAddress = (convo as any).peerInboxId;
              }
              peerInboxId = (convo as any).peerInboxId;
              topic = (convo as any).topic;
              isGroup = false;
              lastMessage = (convo as any).lastMessage;
              unreadCount = (convo as any).unreadCount || 0;
            } else {
              // For Group conversations
              isGroup = true;
              // Groups don't have a single peer address
              peerAddress = "group";
              peerInboxId = undefined;
              topic = (convo as any).topic;
              lastMessage = (convo as any).lastMessage;
              unreadCount = (convo as any).unreadCount || 0;
            }

            const enhanced: EnhancedConversation = {
              id: convo.id || "unknown",
              peerAddress,
              peerInboxId,
              topic,
              createdAtNs: (convo as any).createdAtNs,
              isGroup,
              lastMessage,
              unreadCount,
              enhancedMetadata: undefined,
              participantPresence: undefined,
              permissions: undefined,
              groupInfo: undefined,
            };

            enhancedConvos.push(enhanced);

            console.log("✅ XMTP V3 - Enhanced conversation:", {
              id: enhanced.id,
              peerAddress: enhanced.peerAddress,
            });
          } catch (error) {
            console.error("❌ Error processing conversation:", error, convo);
          }
        }

        const endTime = Date.now();
        console.log("✅ XMTP V3 - Conversations loaded successfully", {
          count: enhancedConvos.length,
          duration: endTime - startTime,
        });

        // Update cache and state
        conversationsCache.current.set(cacheKey, enhancedConvos);
        setConversations(enhancedConvos);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to load conversations");
        console.error("❌ XMTP V3 - Error loading conversations:", error);
        setError(error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    refresh: () => loadConversations(true),
  };
};

export const useSendMessage = () => {
  const client = useClient();
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(
    new Set(),
  );
  const [messageQueue, setMessageQueue] = useState<Map<string, any>>(new Map());

  const sendMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      retryCount = 0,
      messageKey?: string,
    ) => {
      if (!client) {
        throw new Error("Client not initialized");
      }

      const key =
        messageKey || `${conversationId}_${Date.now()}_${Math.random()}`;

      // Add to sending set
      setSendingMessages((prev) => new Set([...prev, key]));

      try {
        console.log("🚀 XMTP V3 - Sending message:", {
          conversationId,
          contentLength: content.length,
          retryCount,
        });

        // Get conversation by ID
        const conversation =
          await client.conversations.getConversationById(conversationId);
        if (!conversation) {
          throw new Error("Conversation not found");
        }

        // **XMTP V3**: Get peer address for validation
        let peerAddress = "unknown";
        if (typeof (conversation as any).peerAddress === "function") {
          peerAddress = await (conversation as any).peerAddress();
        } else if ((conversation as any).peerInboxId) {
          peerAddress = (conversation as any).peerInboxId;
        }

        console.log("✅ XMTP V3 - Conversation validated:", {
          conversationId,
          peerAddress,
        });

        // Send message
        const messageId = await conversation.send(content);

        console.log("✅ XMTP V3 - Message sent successfully:", {
          messageId,
          conversationId,
          peerAddress,
        });

        // Dispatch success event
        const successEvent = new CustomEvent("xmtp-message-sent-success", {
          detail: { messageId, conversationId, content, peerAddress },
        });
        window.dispatchEvent(successEvent);

        return { messageId, conversationId, content };
      } catch (error) {
        console.error("❌ XMTP V3 - Error sending message:", {
          error,
          conversationId,
          retryCount,
        });

        // Dispatch error event
        const errorEvent = new CustomEvent("xmtp-message-sent-error", {
          detail: {
            error: error instanceof Error ? error.message : "Unknown error",
            conversationId,
          },
        });
        window.dispatchEvent(errorEvent);

        throw error;
      } finally {
        // Remove from sending set
        setSendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    },
    [client],
  );

  return { sendMessage, sendingMessages, messageQueue };
};

export const useStartConversation = () => {
  const client = useClient();

  const startConversation = useCallback(
    async (peerAddress: string) => {
      if (!client) {
        throw new Error("Client not initialized");
      }

      if (!peerAddress || peerAddress.trim() === "") {
        throw new Error("Peer address is required");
      }

      console.log("🚀 XMTP V3 - Starting conversation with:", peerAddress);

      try {
        // Create new DM conversation
        const conversation = await client.conversations.newDm(peerAddress);

        console.log("✅ XMTP V3 - Conversation created:", {
          conversationId: conversation.id,
          peerInboxId: conversation.peerInboxId,
        });

        // **XMTP V3**: Get peer address using safe method
        let resolvedPeerAddress = peerAddress;
        try {
          if ((conversation as any).peerAddress) {
            if (typeof (conversation as any).peerAddress === "function") {
              resolvedPeerAddress = await (conversation as any).peerAddress();
            } else {
              resolvedPeerAddress = (conversation as any).peerAddress;
            }
          }
        } catch (error) {
          console.warn(
            "⚠️ Could not get peer address from conversation:",
            error,
          );
        }

        return {
          conversation,
          peerAddress: resolvedPeerAddress,
        };
      } catch (error) {
        console.error("❌ XMTP V3 - Error starting conversation:", {
          error,
          peerAddress,
        });
        throw error;
      }
    },
    [client],
  );

  return { startConversation };
};

export const useCanMessage = () => {
  const client = useClient();

  const canMessage = useCallback(
    async (addresses: string[]): Promise<Record<string, boolean>> => {
      if (!client) {
        console.warn("⚠️ Client not initialized for canMessage");
        return {};
      }

      try {
        console.log(
          "🔄 XMTP V3 - Checking canMessage for addresses:",
          addresses,
        );

        // **XMTP V3**: Convert strings to Identifier format
        const identifiers = addresses.map((address) => ({
          identifierKind: "Ethereum" as const,
          identifier: address,
        }));

        // **XMTP V3**: Use client's canMessage method
        const resultsMap = await (client as any).canMessage(identifiers);

        // Convert Map to Record
        const results: Record<string, boolean> = {};
        if (resultsMap instanceof Map) {
          for (const [key, value] of resultsMap.entries()) {
            results[key] = value;
          }
        }

        console.log("✅ XMTP V3 - CanMessage results:", results);
        return results;
      } catch (error) {
        console.error("❌ XMTP V3 - Error checking canMessage:", error);
        return {};
      }
    },
    [client],
  );

  return canMessage;
};

export const useStreamAllMessages = () => {
  const client = useClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (!client) return;

    const startStreaming = async () => {
      try {
        console.log("🔄 XMTP V3 - Starting message stream...");

        // **XMTP V3**: Simple streaming approach
        const stream = await (client as any).conversations.streamAllMessages();

        if (stream && typeof stream[Symbol.asyncIterator] === "function") {
          for await (const message of stream) {
            console.log("📩 XMTP V3 - New message received:", {
              messageId: message.id,
              conversationId: message.conversationId,
              content: message.content,
            });

            setMessages((prev) => [...prev, message]);
            setMessageCount((prev) => prev + 1);

            // Dispatch received event
            const receivedEvent = new CustomEvent("xmtp-message-received", {
              detail: { message },
            });
            window.dispatchEvent(receivedEvent);
          }
        } else {
          console.warn("⚠️ Stream does not support async iteration");
        }
      } catch (error) {
        console.error("❌ XMTP V3 - Error in message stream:", error);
      }
    };

    startStreaming();
  }, [client]);

  return { messages, messageCount };
};

// **XMTP V3**: Consent management hook
export const useConsent = () => {
  const client = useClient();
  const [consentStates, setConsentStates] = useState<Map<string, boolean>>(
    new Map(),
  );

  const allow = useCallback(
    async (addresses: string[]) => {
      if (!client) {
        console.warn("⚠️ Client not initialized for consent management");
        return;
      }

      try {
        console.log("🔄 XMTP V3 - Allowing conversations with:", addresses);

        for (const address of addresses) {
          try {
            // **XMTP V3**: Use consent management if available (safe casting)
            const clientAny = client as any;
            if (
              clientAny.contacts &&
              typeof clientAny.contacts.allow === "function"
            ) {
              await clientAny.contacts.allow(address);
            } else {
              console.log(
                "📝 XMTP V3 - Consent management not available for:",
                address,
              );
            }

            // Update local state
            setConsentStates((prev) => new Map([...prev, [address, true]]));
            console.log("✅ XMTP V3 - Consent allowed for:", address);
          } catch (error) {
            console.error(
              "❌ XMTP V3 - Error allowing consent for:",
              address,
              error,
            );
          }
        }
      } catch (error) {
        console.error("❌ XMTP V3 - Error in consent management:", error);
        throw error;
      }
    },
    [client],
  );

  const deny = useCallback(
    async (addresses: string[]) => {
      if (!client) {
        console.warn("⚠️ Client not initialized for consent management");
        return;
      }

      try {
        console.log("🔄 XMTP V3 - Denying conversations with:", addresses);

        for (const address of addresses) {
          try {
            // **XMTP V3**: Use consent management if available (safe casting)
            const clientAny = client as any;
            if (
              clientAny.contacts &&
              typeof clientAny.contacts.deny === "function"
            ) {
              await clientAny.contacts.deny(address);
            } else {
              console.log(
                "📝 XMTP V3 - Consent management not available for:",
                address,
              );
            }

            // Update local state
            setConsentStates((prev) => new Map([...prev, [address, false]]));
            console.log("✅ XMTP V3 - Consent denied for:", address);
          } catch (error) {
            console.error(
              "❌ XMTP V3 - Error denying consent for:",
              address,
              error,
            );
          }
        }
      } catch (error) {
        console.error("❌ XMTP V3 - Error in consent denial:", error);
        throw error;
      }
    },
    [client],
  );

  return { consent: consentStates, allow, deny };
};

// **XMTP V3**: Conversation hook for single conversation
export const useConversation = (conversationId: string) => {
  const client = useClient();
  const [conversation, setConversation] = useState<EnhancedConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!client || !conversationId) {
        setConversation(null);
        setMessages([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 XMTP V3 - Loading conversation:", conversationId);

        // Get conversation by ID
        const conv = await (client as any).conversations.getConversationById(
          conversationId,
        );
        if (!conv) {
          throw new Error("Conversation not found");
        }

        // Convert to enhanced conversation
        let peerAddress = "unknown";
        let peerInboxId = undefined;
        let topic = undefined;
        let isGroup = false;
        let lastMessage = undefined;
        let unreadCount = 0;

        // **XMTP V3**: Handle both Group and Dm types
        if ((conv as any).isDm || (conv as any).kind === "dm") {
          // For DM conversations
          if (typeof (conv as any).peerAddress === "function") {
            peerAddress = await (conv as any).peerAddress();
          } else if ((conv as any).peerInboxId) {
            peerAddress = (conv as any).peerInboxId;
          }
          peerInboxId = (conv as any).peerInboxId;
          topic = (conv as any).topic;
          isGroup = false;
          lastMessage = (conv as any).lastMessage;
          unreadCount = (conv as any).unreadCount || 0;
        } else {
          // For Group conversations
          isGroup = true;
          peerAddress = "group";
          peerInboxId = undefined;
          topic = (conv as any).topic;
          lastMessage = (conv as any).lastMessage;
          unreadCount = (conv as any).unreadCount || 0;
        }

        const enhanced: EnhancedConversation = {
          id: conv.id || "unknown",
          peerAddress,
          peerInboxId,
          topic,
          createdAtNs: (conv as any).createdAtNs,
          isGroup,
          lastMessage,
          unreadCount,
          enhancedMetadata: undefined,
          participantPresence: undefined,
          permissions: undefined,
          groupInfo: undefined,
        };

        setConversation(enhanced);

        // Load messages
        const conversationMessages = await (conv as any).messages();
        setMessages(conversationMessages || []);

        console.log("✅ XMTP V3 - Conversation loaded successfully:", {
          conversationId,
          peerAddress,
          messagesCount: conversationMessages?.length || 0,
        });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load conversation");
        console.error("❌ XMTP V3 - Error loading conversation:", error);
        setError(error);
        setConversation(null);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [client, conversationId]);

  return { conversation, messages, isLoading, error };
};

// **XMTP V3**: Replies hook placeholder
export const useReplies = () => {
  const client = useClient();

  const getReplies = useCallback(
    async (messageId: string) => {
      if (!client) return [];

      try {
        console.log("🔄 XMTP V3 - Getting replies for message:", messageId);

        // **XMTP V3**: Replies implementation would depend on content type system
        // This is a placeholder for now
        return [];
      } catch (error) {
        console.error("❌ XMTP V3 - Error getting replies:", error);
        return [];
      }
    },
    [client],
  );

  return { replies: [], getReplies };
};

// **XMTP V3**: Attachment hook placeholder
export const useAttachment = () => {
  const client = useClient();
  const [attachment, setAttachment] = useState<any>(null);
  const [status, setStatus] = useState<"init" | "loading" | "loaded" | "error">(
    "init",
  );

  const load = useCallback(
    async (attachmentData: any) => {
      if (!client) return null;

      try {
        setStatus("loading");
        console.log("🔄 XMTP V3 - Loading attachment:", attachmentData);

        // **XMTP V3**: Attachment handling would use ContentTypeRemoteAttachment
        // This is a placeholder for now
        if (attachmentData) {
          setAttachment(attachmentData);
          setStatus("loaded");
        } else {
          setStatus("error");
        }

        return attachmentData;
      } catch (error) {
        console.error("❌ XMTP V3 - Error loading attachment:", error);
        setStatus("error");
        return null;
      }
    },
    [client],
  );

  const clear = useCallback(() => {
    setAttachment(null);
    setStatus("init");
  }, []);

  return { attachment, load, clear, status };
};

// **XMTP V3**: Database hook placeholder
export const useDb = () => {
  const client = useClient();
  return {
    isReady: Boolean(client),
  };
};

// Export the original client hook
export { useXmtpV3Client };
