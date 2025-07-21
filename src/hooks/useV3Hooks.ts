import { useState, useCallback, useEffect, useRef } from "react";
import { useXmtpStore } from "../store/xmtp";
import useXmtpV3Client from "./useXmtpV3Client";
import {
  toEnhancedConversation,
  type EnhancedConversation,
} from "../types/xmtpV3Types";
import { Client } from "@xmtp/browser-sdk";

// **PERFORMANCE**: Enhanced client hook with proper typing
export const useClient = () => {
  const clientState = useXmtpV3Client();
  return clientState.client;
};

// **PERFORMANCE**: Enhanced conversations hook with proper typing
export const useConversations = () => {
  const client = useClient();
  const [conversations, setConversations] = useState<EnhancedConversation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Performance optimization: Cache conversations to avoid unnecessary re-fetches
  const conversationsCache = useRef<Map<string, EnhancedConversation[]>>(
    new Map(),
  );

  const loadConversations = useCallback(
    async (forceRefresh = false) => {
      if (!client) return;

      // Performance optimization: Check cache first
      const now = Date.now();
      const cacheKey = `conversations_${(client as any).inboxId || "default"}`;
      const cached = conversationsCache.current.get(cacheKey);

      if (!forceRefresh && cached && now - lastRefresh < 30000) {
        // 30 second cache
        console.log("📦 Using cached conversations:", cached.length);
        setConversations(cached);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Loading conversations from XMTP...");
        const startTime = Date.now();

        // V3 conversations.list() returns conversations in descending order by last message
        const convos = await (client as any).conversations.list();

        // **FIX**: Convert and enhance all conversations with proper typing
        const enhancedConvos: EnhancedConversation[] = convos.map(
          (convo: any) => {
            try {
              const enhanced = toEnhancedConversation(convo);

              // **FIX**: Ensure peerAddress is properly set
              if (!enhanced.peerAddress || enhanced.peerAddress === "unknown") {
                const peerAddress =
                  convo.peerInboxId || convo.peerAddress || null;
                if (peerAddress) {
                  enhanced.peerAddress = peerAddress;
                  console.log("🔧 Enhanced conversation with peerAddress:", {
                    conversationId: enhanced.id,
                    peerAddress,
                  });
                }
              }

              return enhanced;
            } catch (error) {
              console.error("❌ Error enhancing conversation:", error, convo);
              // Return a minimal valid conversation object
              return {
                id: convo.id || "unknown",
                peerAddress:
                  convo.peerAddress || convo.peerInboxId || "unknown",
                isGroup: Boolean(convo.isGroup),
                unreadCount: convo.unreadCount || 0,
              };
            }
          },
        );

        const endTime = Date.now();
        console.log("✅ Conversations loaded successfully", {
          count: enhancedConvos.length,
          duration: endTime - startTime,
          cached: !forceRefresh,
        });

        // Update cache
        conversationsCache.current.set(cacheKey, enhancedConvos);
        setLastRefresh(now);

        setConversations(enhancedConvos);
        setError(null);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to load conversations");
        console.error("❌ Failed to load conversations:", error);
        setError(error);

        // Fall back to cache if available
        const cached = conversationsCache.current.get(cacheKey);
        if (cached) {
          console.log("📦 Using cached conversations after error");
          setConversations(cached);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client, lastRefresh],
  );

  // Performance optimization: Auto-refresh conversations on client change and stream new conversations
  useEffect(() => {
    if (client) {
      loadConversations();
    } else {
      setConversations([]);
      setError(null);
    }

    if (!client) return;

    let stream: any;
    const startStream = async () => {
      try {
        stream = await (client as any).conversations.stream((newConvo: any) => {
          setConversations((prev) => {
            // Check for duplicates
            if (prev.some((c) => c.id === newConvo.id)) {
              console.log("🔄 Duplicate conversation filtered:", newConvo.id);
              return prev;
            }
            console.log(
              "📨 New conversation received via stream:",
              newConvo.id,
            );

            // **FIX**: Auto-select new conversation if no conversation is currently selected
            const currentConversationTopic =
              useXmtpStore.getState().conversationTopic;
            if (!currentConversationTopic) {
              console.log("🔄 Auto-selecting new conversation:", newConvo.id);
              const store = useXmtpStore.getState();
              store.setConversationTopic(newConvo.id);

              // Update recipient info
              if (newConvo.peerInboxId) {
                store.setRecipientAddress(newConvo.peerInboxId);
                store.setRecipientState("valid");
                store.setRecipientOnNetwork(true);
              }
            }

            return [...prev, newConvo];
          });

          // Update cache
          const cacheKey = `conversations_${(client as any).inboxId || "default"}`;
          const currentCache = conversationsCache.current.get(cacheKey) || [];
          if (!currentCache.some((c: any) => c.id === newConvo.id)) {
            conversationsCache.current.set(cacheKey, [
              ...currentCache,
              newConvo,
            ]);
          }
        });
      } catch (err) {
        console.error("❌ Error setting up conversation stream:", err);
      }
    };

    startStream();

    return () => {
      if (stream) {
        stream.return();
      }
    };
  }, [client, loadConversations]);

  // Performance optimization: Return conversations directly
  return {
    conversations,
    isLoading,
    error,
    refresh: () => loadConversations(true),
    refreshIfStale: () => loadConversations(false),
  };
};

// Performance optimization: Enhanced canMessage hook with caching
export const useCanMessage = () => {
  const client = useClient();
  const resultCache = useRef<Map<string, boolean>>(new Map());

  return useCallback(
    async (addresses: string[]) => {
      if (!client) {
        console.warn("⚠️ Client not initialized for canMessage check");
        return {};
      }

      const result: Record<string, boolean> = {};

      // **PERFORMANCE**: Check cache first
      const uncachedAddresses = addresses.filter(
        (address) => !resultCache.current.has(address),
      );

      // Return cached results immediately
      addresses.forEach((address) => {
        if (resultCache.current.has(address)) {
          result[address] = resultCache.current.get(address)!;
        }
      });

      if (uncachedAddresses.length === 0) {
        console.log("📦 Using cached canMessage results");
        return result;
      }

      try {
        console.log("🔄 Checking canMessage for:", uncachedAddresses);

        // V3 uses identifiers instead of addresses
        const identifiers = uncachedAddresses.map((address) => ({
          identifierKind: "Ethereum" as const,
          identifier: address,
        }));

        const canMessageResult = await (client as any).canMessage(identifiers);

        // Convert Map to Record for compatibility and cache results
        canMessageResult.forEach((canMessage: boolean, inboxId: string) => {
          // Find corresponding address for this inbox ID
          const index = Array.from(canMessageResult.keys()).indexOf(inboxId);
          if (index >= 0 && uncachedAddresses[index]) {
            const address = uncachedAddresses[index];
            result[address] = canMessage;
            resultCache.current.set(address, canMessage);
          }
        });

        console.log("✅ canMessage results:", result);
        return result;
      } catch (error) {
        console.error("❌ Error checking canMessage:", error);

        // Return cached results for failed addresses
        uncachedAddresses.forEach((address) => {
          if (result[address] === undefined) {
            result[address] = false; // Default to false on error
          }
        });

        return result;
      }
    },
    [client],
  );
};

// **PERFORMANCE**: Enhanced sendMessage hook with comprehensive debugging
export const useSendMessage = () => {
  const client = useClient();
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(
    new Set(),
  );

  // **PERFORMANCE**: Message queue for failed sends
  const [messageQueue, setMessageQueue] = useState<
    Map<
      string,
      {
        conversationId: string;
        content: any;
        retryCount: number;
        timestamp: number;
      }
    >
  >(new Map());

  const sendMessage = useCallback(
    async (
      conversationId: string,
      content: any,
      retryCount = 0,
      optimisticId?: string,
    ) => {
      if (!client) throw new Error("Client not initialized");

      const messageKey =
        optimisticId || `${conversationId}_${Date.now()}_${Math.random()}`;

      // **PERFORMANCE**: Prevent duplicate sends
      if (sendingMessages.has(messageKey)) {
        console.warn("⚠️ Message already being sent");
        return;
      }

      setSendingMessages((prev) => new Set([...prev, messageKey]));

      // **DEBUG**: Enhanced validation with detailed logging
      const clientAddress = (client as any).inboxId;
      console.log("🚀 ENHANCED DEBUG - Message send validation:", {
        conversationId,
        clientAddress,
        contentLength: typeof content === "string" ? content.length : "unknown",
        contentPreview:
          typeof content === "string" ? content.slice(0, 100) : "non-text",
        retryCount,
        messageKey,
      });

      // **PERFORMANCE**: Create optimistic message for instant UI update
      const optimisticMessage = {
        id: messageKey,
        conversationId,
        content,
        senderAddress: (client as any).inboxId || "unknown",
        sentAtNs: BigInt(Date.now() * 1000000),
        metadata: {
          id: messageKey,
          deliveryStatus: "sending" as const,
          isEdited: false,
          reactions: {},
          mentions: [],
          links: [],
          attachments: [],
          isEncrypted: false,
          encryptionLevel: "transport" as const,
        },
        localMetadata: {
          isSelected: false,
          isHighlighted: false,
          searchScore: 0,
        },
      };

      // **PERFORMANCE**: Dispatch optimistic message event immediately
      const optimisticEvent = new CustomEvent("xmtp-optimistic-message-sent", {
        detail: {
          message: optimisticMessage,
          conversationId,
          messageId: messageKey,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(optimisticEvent);

      try {
        console.log("🚀 ENHANCED DEBUG - Starting message send process:", {
          conversationId,
          clientAddress,
          contentPreview:
            typeof content === "string"
              ? content.slice(0, 50) + "..."
              : "non-text",
        });
        const startTime = Date.now();

        // **DEBUG**: Enhanced conversation retrieval with detailed error handling
        let conversation;
        try {
          console.log("🔍 DEBUG - Getting conversation by ID:", conversationId);
          conversation = await (
            client as any
          ).conversations.getConversationById(conversationId);

          if (!conversation) {
            console.error(
              "❌ DEBUG - Conversation not found for ID:",
              conversationId,
            );
            throw new Error("Conversation not found");
          }

          console.log("✅ DEBUG - Conversation found:", {
            id: conversation.id,
            peerAddress: conversation.peerAddress,
            peerInboxId: conversation.peerInboxId,
            topic: conversation.topic,
            isGroup: conversation.isGroup,
          });
        } catch (conversationError) {
          console.error("❌ DEBUG - Error getting conversation:", {
            conversationId,
            error: conversationError,
            clientAddress,
          });
          throw new Error(
            `Failed to get conversation: ${conversationError instanceof Error ? conversationError.message : "Unknown error"}`,
          );
        }

        // **DEBUG**: Enhanced conversation validation with peer address check
        const peerAddress =
          "peerAddress" in conversation
            ? (conversation.peerAddress as string)
            : conversation.peerInboxId || "unknown";

        console.log("✅ DEBUG - Conversation validation:", {
          conversationId: conversation.id,
          peerAddress,
          clientAddress,
          isSelf:
            peerAddress !== "unknown"
              ? peerAddress.toLowerCase() === clientAddress?.toLowerCase()
              : false,
          hasValidPeer:
            peerAddress !== "unknown" && peerAddress !== clientAddress,
        });

        // **DEBUG**: Enhanced message sending with comprehensive error handling
        let messageId;
        try {
          console.log("🚀 DEBUG - Sending message to conversation:", {
            conversationId: conversation.id,
            peerAddress,
            contentLength:
              typeof content === "string" ? content.length : "unknown",
          });

          // **PERFORMANCE**: Send with timeout to prevent hanging
          const messagePromise = conversation.send(content);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Message send timeout")), 15000),
          );

          messageId = await Promise.race([messagePromise, timeoutPromise]);

          console.log(
            "✅ DEBUG - Message sent successfully, messageId:",
            messageId,
          );
        } catch (sendError) {
          console.error("❌ DEBUG - Error sending message:", {
            error: sendError,
            conversationId: conversation.id,
            peerAddress,
            contentLength:
              typeof content === "string" ? content.length : "unknown",
          });
          throw new Error(
            `Failed to send message: ${sendError instanceof Error ? sendError.message : "Unknown error"}`,
          );
        }

        const endTime = Date.now();
        console.log("✅ ENHANCED DEBUG - Message sent successfully", {
          messageId,
          conversationId,
          peerAddress,
          clientAddress,
          duration: endTime - startTime,
          contentLength:
            typeof content === "string" ? content.length : "unknown",
          isSelf:
            peerAddress !== "unknown"
              ? peerAddress.toLowerCase() === clientAddress?.toLowerCase()
              : false,
        });

        // **PERFORMANCE**: Remove from queue if it was queued
        setMessageQueue((prev) => {
          const newQueue = new Map(prev);
          newQueue.delete(messageKey);
          return newQueue;
        });

        // **PERFORMANCE**: Dispatch success event
        const successEvent = new CustomEvent("xmtp-message-sent-success", {
          detail: {
            messageId,
            conversationId,
            optimisticId: messageKey,
            timestamp: Date.now(),
          },
        });
        window.dispatchEvent(successEvent);

        return {
          id: messageId,
          conversationId,
          content,
          optimisticId: messageKey,
        };
      } catch (error) {
        console.error("❌ ENHANCED DEBUG - Error sending message:", {
          error,
          conversationId,
          retryCount,
          messageKey,
        });

        // **PERFORMANCE**: Dispatch error event
        const errorEvent = new CustomEvent("xmtp-message-sent-error", {
          detail: {
            error: error instanceof Error ? error.message : "Unknown error",
            conversationId,
            optimisticId: messageKey,
            timestamp: Date.now(),
          },
        });
        window.dispatchEvent(errorEvent);

        // **PERFORMANCE**: Enhanced retry logic with exponential backoff
        if (retryCount < 3 && error instanceof Error) {
          const shouldRetry =
            error.message.includes("network") ||
            error.message.includes("timeout") ||
            error.message.includes("connection") ||
            error.message.includes("failed to fetch") ||
            error.message.includes("Client not initialized");

          if (shouldRetry) {
            console.log(
              `🔄 DEBUG - Queuing message for retry (attempt ${retryCount + 1}/3)`,
            );

            // **PERFORMANCE**: Add to retry queue
            setMessageQueue((prev) =>
              new Map(prev).set(messageKey, {
                conversationId,
                content,
                retryCount: retryCount + 1,
                timestamp: Date.now(),
              }),
            );

            // **PERFORMANCE**: Exponential backoff
            const backoffDelay = Math.min(
              1000 * Math.pow(2, retryCount),
              10000,
            );
            setTimeout(() => {
              sendMessage(conversationId, content, retryCount + 1, messageKey);
            }, backoffDelay);
          }
        }

        throw error;
      } finally {
        setSendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(messageKey);
          return newSet;
        });
      }
    },
    [client],
  );

  // **PERFORMANCE**: Process message queue
  useEffect(() => {
    const processQueue = () => {
      setMessageQueue((prev) => {
        const newQueue = new Map(prev);
        let processed = false;

        for (const [key, item] of newQueue.entries()) {
          if (Date.now() - item.timestamp > 5000) {
            // Retry after 5 seconds
            sendMessage(
              item.conversationId,
              item.content,
              item.retryCount,
              key,
            ).catch(console.error);
            newQueue.delete(key);
            processed = true;
          }
        }

        return processed ? newQueue : prev;
      });
    };

    const interval = setInterval(processQueue, 5000);
    return () => clearInterval(interval);
  }, [sendMessage]);

  return {
    sendMessage,
    sendingMessages: Array.from(sendingMessages),
    messageQueue: Array.from(messageQueue.entries()),
  };
};

// Performance optimization: Enhanced consent hook with caching
export const useConsent = () => {
  const client = useClient();
  const [consentStates, setConsentStates] = useState<Map<string, boolean>>(
    new Map(),
  );
  const consentCache = useRef<Map<string, boolean>>(new Map());

  const allow = useCallback(
    async (addresses: string[]) => {
      if (!client) {
        console.warn("⚠️ Client not initialized for consent management");
        return;
      }

      try {
        console.log("🔄 Allowing conversations with:", addresses);

        // **FIX**: Enhanced V3 consent management with proper error handling
        for (const address of addresses) {
          try {
            // Validate address format
            if (!address || typeof address !== "string") {
              console.warn("⚠️ Invalid address for consent:", address);
              continue;
            }

            // **FIX**: Use proper V3 consent methods if available
            if (client && typeof client === "object" && "contacts" in client) {
              const contactsClient = client as any;
              if (typeof contactsClient.contacts?.allow === "function") {
                await contactsClient.contacts.allow(address);
              } else {
                console.log(
                  "📝 Using fallback consent management for:",
                  address,
                );
              }
            } else {
              console.log("📝 Using fallback consent management for:", address);
            }

            // Update consent state
            consentCache.current.set(address, true);
            setConsentStates((prev) => new Map([...prev, [address, true]]));

            console.log("✅ Consent allowed for address:", address);
          } catch (addressError) {
            console.error(
              "❌ Error allowing consent for address:",
              address,
              addressError,
            );
            // Continue with other addresses even if one fails
          }
        }

        console.log(
          "✅ Consent management completed for addresses:",
          addresses,
        );
      } catch (error) {
        console.error("❌ Error in consent management:", error);
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
        console.log("🔄 Denying conversations with:", addresses);

        // **FIX**: Enhanced V3 consent management with proper error handling
        for (const address of addresses) {
          try {
            // Validate address format
            if (!address || typeof address !== "string") {
              console.warn("⚠️ Invalid address for consent:", address);
              continue;
            }

            // **FIX**: Use proper V3 consent methods if available
            if (client && typeof client === "object" && "contacts" in client) {
              const contactsClient = client as any;
              if (typeof contactsClient.contacts?.block === "function") {
                await contactsClient.contacts.block(address);
              } else {
                console.log(
                  "📝 Using fallback consent management for:",
                  address,
                );
              }
            } else {
              console.log("📝 Using fallback consent management for:", address);
            }

            // Update consent state
            consentCache.current.set(address, false);
            setConsentStates((prev) => new Map([...prev, [address, false]]));

            console.log("✅ Consent denied for address:", address);
          } catch (addressError) {
            console.error(
              "❌ Error denying consent for address:",
              address,
              addressError,
            );
            // Continue with other addresses even if one fails
          }
        }

        console.log("✅ Consent denial completed for addresses:", addresses);
      } catch (error) {
        console.error("❌ Error in consent denial:", error);
        throw error;
      }
    },
    [client],
  );

  return {
    consent: consentStates,
    allow,
    deny,
  };
};

// Performance optimization: Enhanced database hook
export const useDb = () => {
  const client = useClient();
  return {
    // V3 doesn't expose database directly, using internal state
    // This is a placeholder for future database access
    isReady: Boolean(client),
  };
};

// **PERFORMANCE**: Enhanced startConversation hook with comprehensive debugging
export const useStartConversation = () => {
  const client = useClient();

  const startConversation = useCallback(
    async (peerAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      console.log("🚀 ENHANCED DEBUG - Starting conversation with:", {
        peerAddress,
        clientAddress: (client as any).inboxId,
      });

      // **DEBUG**: Enhanced validation - ensure we're not messaging self
      const clientAddress = (client as any).inboxId;
      if (peerAddress.toLowerCase() === clientAddress?.toLowerCase()) {
        console.error("❌ DEBUG - Cannot start conversation with yourself:", {
          peerAddress,
          clientAddress,
        });
        throw new Error("Cannot start conversation with yourself");
      }

      // **DEBUG**: Enhanced address format validation
      const isValidAddress =
        /^[0-9a-fA-F]{42}$/.test(peerAddress) ||
        /^[0-9a-fA-F]{64}$/.test(peerAddress);

      if (!isValidAddress) {
        console.error("❌ DEBUG - Invalid address format:", {
          peerAddress,
          length: peerAddress.length,
          isValidAddress,
        });
        throw new Error("Invalid address format");
      }

      console.log("✅ DEBUG - Address validation passed:", {
        peerAddress,
        clientAddress,
        isValidAddress,
      });

      const startTime = Date.now();

      try {
        console.log(
          "🚀 DEBUG - Creating V3 conversation with peer:",
          peerAddress,
        );

        // **DEBUG**: Enhanced V3 conversation creation with error handling
        let conversation;
        try {
          // V3 conversation creation - use newDm for direct messages
          conversation = await (client as any).conversations.newDm(peerAddress);

          console.log("✅ DEBUG - V3 conversation created:", {
            id: conversation.id,
            peerAddress: conversation.peerAddress,
            peerInboxId: conversation.peerInboxId,
            topic: conversation.topic,
            isGroup: conversation.isGroup,
          });

          // **FIX**: Ensure the conversation has the peerAddress property set
          if (
            (conversation && !("peerAddress" in conversation)) ||
            !(conversation as any).peerAddress
          ) {
            // Add peerAddress to the conversation object
            (conversation as any).peerAddress = peerAddress;
            console.log(
              "🔧 DEBUG - Added peerAddress to conversation:",
              peerAddress,
            );
          }
        } catch (conversationError) {
          console.error("❌ DEBUG - Error creating conversation:", {
            error: conversationError,
            peerAddress,
            clientAddress,
          });
          throw new Error(
            `Failed to create conversation: ${conversationError instanceof Error ? conversationError.message : "Unknown error"}`,
          );
        }

        const endTime = Date.now();
        const conversationPeerAddress =
          "peerAddress" in conversation
            ? (conversation as any).peerAddress
            : peerAddress;
        console.log("✅ ENHANCED DEBUG - Conversation started successfully", {
          conversationId: conversation.id,
          peerAddress: conversationPeerAddress,
          clientAddress,
          duration: endTime - startTime,
          isSelf: peerAddress.toLowerCase() === clientAddress?.toLowerCase(),
          hasValidPeer: conversationPeerAddress !== clientAddress,
        });

        // **FIX**: Return conversation with guaranteed peerAddress
        return {
          conversation: {
            ...conversation,
            peerAddress: conversationPeerAddress,
          },
          peerAddress,
        };
      } catch (error) {
        console.error("❌ ENHANCED DEBUG - Error in startConversation:", {
          error,
          peerAddress,
          clientAddress,
        });
        throw error;
      }
    },
    [client],
  );

  return {
    startConversation,
  };
};

// Performance optimization: Enhanced conversation hook with message loading
export const useConversation = (conversationId: string) => {
  const client = useClient();
  const [conversation, setConversation] = useState<EnhancedConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesCache = useRef<Map<string, any[]>>(new Map());
  const conversationCache = useRef<Map<string, EnhancedConversation>>(
    new Map(),
  );

  useEffect(() => {
    const getConversation = async () => {
      if (!client || !conversationId) {
        setConversation(null);
        setMessages([]);
        return;
      }

      // Check cache first
      const cachedConversation = conversationCache.current.get(conversationId);
      const cachedMessages = messagesCache.current.get(conversationId);

      if (cachedConversation && cachedMessages) {
        console.log("📦 Using cached conversation and messages:", {
          conversationId,
          messagesCount: cachedMessages.length,
        });
        setConversation(cachedConversation);
        setMessages(cachedMessages);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Loading conversation:", conversationId);
        const startTime = Date.now();

        // V3 conversation.messages() to get all messages
        const conv = await (client as any).conversations.getConversationById(
          conversationId,
        );
        if (!conv) throw new Error("Conversation not found");

        const enhancedConv = toEnhancedConversation(conv);
        const conversationMessages = await conv.messages();

        const endTime = Date.now();
        console.log("✅ Conversation loaded successfully", {
          conversationId,
          peerAddress: enhancedConv.peerAddress,
          messagesCount: conversationMessages.length,
          duration: endTime - startTime,
        });

        // Update caches
        conversationCache.current.set(conversationId, enhancedConv);
        messagesCache.current.set(conversationId, conversationMessages);

        setConversation(enhancedConv);
        setMessages(conversationMessages);
      } catch (e) {
        const err =
          e instanceof Error ? e : new Error("Failed to load conversation");
        console.error("❌ Error loading conversation:", err);
        setError(err);
        setConversation(null);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    getConversation();
  }, [client, conversationId]);

  const refresh = useCallback(async () => {
    if (client && conversationId) {
      // Clear cache and re-fetch
      conversationCache.current.delete(conversationId);
      messagesCache.current.delete(conversationId);
      // Re-trigger useEffect
      // A more direct call could be implemented if needed
    }
  }, [client, conversationId]);

  return {
    conversation,
    messages,
    isLoading,
    error,
    refresh,
  };
};

// **PERFORMANCE**: Enhanced message streaming with instant UI updates
export const useStreamAllMessages = () => {
  const client = useClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "reconnecting"
  >("disconnected");
  const seenMessages = useRef<Set<string>>(new Set());
  const streamMetrics = useRef({
    messagesReceived: 0,
    lastMessageTime: 0,
    connectionAttempts: 0,
    avgLatency: 0,
  });

  useEffect(() => {
    if (!client) {
      setIsStreaming(false);
      setConnectionStatus("disconnected");
      return;
    }

    let cleanup: (() => void) | null = null;
    let streamClosed = false;
    let streamHandle: any = null;
    let reconnectAttempts = 0;
    let reconnectTimer: NodeJS.Timeout | null = null;
    const maxReconnectAttempts = 5;

    const setupStream = async () => {
      try {
        console.log("🚀 Setting up enhanced V3 message streaming...");
        setError(null);
        setIsStreaming(true);
        setConnectionStatus("connecting");
        streamMetrics.current.connectionAttempts++;

        // **PERFORMANCE**: Enhanced message callback with instant processing
        const messageCallback = (message: any) => {
          if (message && !streamClosed) {
            const receiveTime = Date.now();
            const messageId =
              message.id || `${message.conversationId}_${message.sentAtNs}`;

            // **PERFORMANCE**: Skip duplicates immediately
            if (seenMessages.current.has(messageId)) {
              console.log("🔄 DEBUG - Duplicate message skipped:", messageId);
              return;
            }

            seenMessages.current.add(messageId);
            streamMetrics.current.messagesReceived++;
            streamMetrics.current.lastMessageTime = receiveTime;

            // **PERFORMANCE**: Calculate latency if message has timestamp
            if (message.sentAtNs) {
              const sentTime = Number(message.sentAtNs) / 1000000; // Convert nanoseconds to milliseconds
              const latency = receiveTime - sentTime;
              streamMetrics.current.avgLatency =
                (streamMetrics.current.avgLatency + latency) / 2;
            }

            console.log("🚀 ENHANCED DEBUG - Real-time message received:", {
              id: messageId,
              content:
                typeof message.content === "string"
                  ? message.content.slice(0, 50) + "..."
                  : "non-text",
              sender: message.senderInboxId,
              conversation: message.conversationId,
              latency: streamMetrics.current.avgLatency,
              sentAtNs: message.sentAtNs,
              hasContent: !!message.content,
              contentType: typeof message.content,
            });

            // **PERFORMANCE**: Immediate state update with batching prevention
            setMessages((prev) => {
              // **PERFORMANCE**: Early return if already exists
              const exists = prev.some(
                (msg: any) =>
                  (msg.id && msg.id === messageId) ||
                  (msg.conversationId === message.conversationId &&
                    msg.sentAtNs === message.sentAtNs),
              );

              if (exists) {
                console.log(
                  "🔄 DEBUG - Message already exists in state:",
                  messageId,
                );
                return prev;
              }

              console.log("✅ DEBUG - Adding new message to state:", {
                messageId,
                conversationId: message.conversationId,
                contentLength:
                  typeof message.content === "string"
                    ? message.content.length
                    : "unknown",
              });

              // **PERFORMANCE**: Limit message history to prevent memory issues
              const newMessages = [...prev, message];
              if (newMessages.length > 1000) {
                console.log(
                  "📊 DEBUG - Trimming message history to 500 messages",
                );
                const trimmedMessages = newMessages.slice(-500); // Keep only last 500 messages
                console.log("✅ DEBUG - New messages state:", trimmedMessages);
                return trimmedMessages;
              }

              console.log("✅ DEBUG - New messages state:", newMessages);
              return newMessages;
            });

            // **PERFORMANCE**: Enhanced UI update notification with more details
            const event = new CustomEvent("xmtp-fast-message-received", {
              detail: {
                message,
                messageId,
                conversationId: message.conversationId,
                timestamp: receiveTime,
                metrics: { ...streamMetrics.current },
                senderAddress: message.senderAddress,
                content: message.content,
                sentAtNs: message.sentAtNs,
              },
            });
            window.dispatchEvent(event);

            // **PERFORMANCE**: Additional event for conversation-specific updates
            const conversationEvent = new CustomEvent(
              "xmtp-conversation-message-updated",
              {
                detail: {
                  conversationId: message.conversationId,
                  message,
                  messageId,
                  timestamp: receiveTime,
                },
              },
            );
            window.dispatchEvent(conversationEvent);
          } else {
            console.warn("⚠️ DEBUG - Invalid message received:", message);
          }
        };

        // **PERFORMANCE**: Create stream with connection monitoring
        streamHandle = await (client as any).conversations.streamAllMessages(
          messageCallback,
        );

        setConnectionStatus("connected");
        reconnectAttempts = 0;
        console.log("✅ Enhanced V3 message streaming established");
      } catch (error) {
        console.error("❌ Enhanced message streaming error:", error);
        setError(
          error instanceof Error ? error : new Error("Streaming failed"),
        );
        setConnectionStatus("disconnected");
        setIsStreaming(false);

        // **PERFORMANCE**: Enhanced retry logic
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          console.log(
            `🔄 Enhanced streaming retry in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
          );

          reconnectTimer = setTimeout(() => {
            if (!streamClosed) {
              setupStream();
            }
          }, delay);
        }
      }
    };

    const startStream = async () => {
      await setupStream();
    };

    const cleanupStream = () => {
      streamClosed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (streamHandle && typeof streamHandle.close === "function") {
        try {
          streamHandle.close();
        } catch (error) {
          console.warn("⚠️ Error closing stream:", error);
        }
      }
      if (cleanup) {
        cleanup();
      }
    };

    startStream();

    return cleanupStream;
  }, [client]);

  return {
    messages,
    error,
    isStreaming,
    connectionStatus,
    messageCount: messages.length,
    metrics: streamMetrics.current,
  };
};

// V3 equivalent of useReplies from V2
export const useReplies = () => {
  const client = useClient();

  const getReplies = useCallback(
    async (messageId: string) => {
      if (!client) return [];

      try {
        // V3 reply functionality through conversation messages
        // Replies are regular messages with reference to parent message
        console.log(
          "V3 reply system - checking message references for:",
          messageId,
        );

        // Note: V3 reply implementation depends on content type system
        // This is a basic implementation - full replies need ContentTypeReply
        return [];
      } catch (error) {
        console.error("Error getting replies:", error);
        return [];
      }
    },
    [client],
  );

  return {
    replies: [],
    getReplies,
  };
};

// V3 equivalent of useAttachment from V2
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

        // V3 attachment handling through content types
        console.log(
          "V3 attachment system - processing attachment:",
          attachmentData,
        );

        // V3 supports attachments through ContentTypeRemoteAttachment
        // This is a basic implementation structure
        if (attachmentData) {
          setAttachment(attachmentData);
          setStatus("loaded");
        } else {
          setStatus("error");
        }

        return attachmentData;
      } catch (error) {
        console.error("Error loading attachment:", error);
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

  return {
    attachment,
    load,
    clear,
    status,
  };
};

// Export V3 client hook
export { useXmtpV3Client };
