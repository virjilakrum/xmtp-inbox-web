import { useXmtpV3Context } from "../context/XmtpV3Provider";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useXmtpV3Client from "./useXmtpV3Client";
import { useXmtpStore } from "../store/xmtp";

// Performance optimization: Memoized client hook
export const useClient = () => {
  const context = useXmtpV3Context();
  return context.client;
};

// Performance optimization: Enhanced conversations hook with caching
export const useConversations = () => {
  const client = useClient();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Performance optimization: Cache conversations to avoid unnecessary re-fetches
  const conversationsCache = useRef<Map<string, any>>(new Map());

  const loadConversations = useCallback(
    async (forceRefresh = false) => {
      if (!client) return;

      // Performance optimization: Check cache first
      const now = Date.now();
      const cacheKey = `conversations_${client.inboxId || "default"}`;
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
        const convos = await client.conversations.list();

        const endTime = Date.now();
        console.log("✅ Conversations loaded successfully", {
          count: convos.length,
          duration: endTime - startTime,
          cached: !forceRefresh,
        });

        // Update cache
        conversationsCache.current.set(cacheKey, convos);
        setLastRefresh(now);

        setConversations(convos);
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

  // Performance optimization: Auto-refresh conversations on client change
  useEffect(() => {
    if (client) {
      loadConversations();
    } else {
      setConversations([]);
      setError(null);
    }
  }, [client, loadConversations]);

  // Performance optimization: Memoized return value
  return useMemo(
    () => ({
      conversations,
      isLoading,
      error,
      refresh: () => loadConversations(true),
      refreshIfStale: () => loadConversations(false),
    }),
    [conversations, isLoading, error, loadConversations],
  );
};

// Performance optimization: Enhanced canMessage hook with result caching
export const useCanMessage = () => {
  const client = useClient();
  const resultCache = useRef<Map<string, boolean>>(new Map());

  return {
    canMessage: useCallback(
      async (addresses: string[]): Promise<Record<string, boolean>> => {
        if (!client) return {};

        const result: Record<string, boolean> = {};
        const uncachedAddresses: string[] = [];

        // Check cache first
        addresses.forEach((address) => {
          const cached = resultCache.current.get(address);
          if (cached !== undefined) {
            result[address] = cached;
          } else {
            uncachedAddresses.push(address);
          }
        });

        if (uncachedAddresses.length === 0) {
          console.log("📦 All canMessage results from cache");
          return result;
        }

        try {
          console.log(
            "🔄 Checking canMessage for",
            uncachedAddresses.length,
            "addresses",
          );

          // V3 uses identifiers instead of addresses
          const identifiers = uncachedAddresses.map((address) => ({
            identifierKind: "Ethereum" as const,
            identifier: address,
          }));

          const canMessageResult = await client.canMessage(identifiers);

          // Convert Map to Record for compatibility and cache results
          canMessageResult.forEach((canMessage, inboxId) => {
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
    ),
  };
};

// Performance optimization: Enhanced sendMessage hook with retry logic
export const useSendMessage = () => {
  const client = useClient();
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(
    new Set(),
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: any, retryCount = 0) => {
      if (!client) throw new Error("Client not initialized");

      const messageKey = `${conversationId}_${Date.now()}`;

      // Prevent duplicate sends
      if (sendingMessages.has(messageKey)) {
        console.warn("⚠️ Message already being sent");
        return;
      }

      setSendingMessages((prev) => new Set([...prev, messageKey]));

      try {
        console.log("🔄 Sending message to conversation:", conversationId);
        const startTime = Date.now();

        // V3 conversation.send() with encoded content
        const conversation =
          await client.conversations.getConversationById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        const messageId = await conversation.send(content);

        const endTime = Date.now();
        console.log("✅ Message sent successfully", {
          messageId,
          conversationId,
          duration: endTime - startTime,
          contentLength:
            typeof content === "string" ? content.length : "unknown",
        });

        return { id: messageId, conversationId, content };
      } catch (error) {
        console.error("❌ Error sending message:", error);

        // Retry logic for network errors
        if (retryCount < 2 && error instanceof Error) {
          if (
            error.message.includes("network") ||
            error.message.includes("timeout")
          ) {
            console.log(
              `🔄 Retrying message send (attempt ${retryCount + 1}/3)`,
            );
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1)),
            );
            return sendMessage(conversationId, content, retryCount + 1);
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
    [client, sendingMessages],
  );

  return {
    sendMessage,
    isSending: sendingMessages.size > 0,
    sendingCount: sendingMessages.size,
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
      if (!client) return;

      try {
        console.log("🔄 Allowing conversations with:", addresses);

        // V3 consent management
        for (const address of addresses) {
          // Update consent state
          consentCache.current.set(address, true);
          setConsentStates((prev) => new Map([...prev, [address, true]]));
        }

        console.log("✅ Consent allowed for addresses:", addresses);
      } catch (error) {
        console.error("❌ Error allowing consent:", error);
      }
    },
    [client],
  );

  const deny = useCallback(
    async (addresses: string[]) => {
      if (!client) return;

      try {
        console.log("🔄 Denying conversations with:", addresses);

        // V3 consent management
        for (const address of addresses) {
          // Update consent state
          consentCache.current.set(address, false);
          setConsentStates((prev) => new Map([...prev, [address, false]]));
        }

        console.log("✅ Consent denied for addresses:", addresses);
      } catch (error) {
        console.error("❌ Error denying consent:", error);
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

// Performance optimization: Enhanced conversation starting with validation
export const useStartConversation = () => {
  const client = useClient();
  const [startingConversations, setStartingConversations] = useState<
    Set<string>
  >(new Set());

  const startConversation = useCallback(
    async (peerAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      // Validate address format
      if (!peerAddress || typeof peerAddress !== "string") {
        throw new Error("Invalid peer address");
      }

      // Prevent duplicate conversation starts
      if (startingConversations.has(peerAddress)) {
        console.warn(
          "⚠️ Conversation already being started with:",
          peerAddress,
        );
        throw new Error("Conversation already being started");
      }

      setStartingConversations((prev) => new Set([...prev, peerAddress]));

      try {
        console.log("🔄 Starting conversation with:", peerAddress);
        const startTime = Date.now();

        // V3 conversation creation - use newDm for direct messages
        const conversation = await client.conversations.newDm(peerAddress);

        const endTime = Date.now();
        console.log("✅ Conversation started successfully", {
          conversationId: conversation.id,
          peerAddress,
          duration: endTime - startTime,
        });

        return { conversation, peerAddress };
      } catch (error) {
        console.error("❌ Error starting conversation:", error);
        throw error;
      } finally {
        setStartingConversations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(peerAddress);
          return newSet;
        });
      }
    },
    [client, startingConversations],
  );

  return {
    startConversation,
    isStarting: startingConversations.size > 0,
    startingWith: Array.from(startingConversations),
  };
};

// Performance optimization: Enhanced conversation hook with message loading
export const useConversation = () => {
  const client = useClient();
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesCache = useRef<Map<string, any[]>>(new Map());

  const loadConversation = useCallback(
    async (forceRefresh = false) => {
      if (!client || !conversationTopic) {
        setMessages([]);
        return;
      }

      // Check cache first
      const cached = messagesCache.current.get(conversationTopic);
      if (!forceRefresh && cached) {
        console.log("📦 Using cached messages:", cached.length);
        setMessages(cached);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Loading conversation messages:", conversationTopic);
        const startTime = Date.now();

        // V3 conversation.messages() to get all messages
        const conversation =
          await client.conversations.getConversationById(conversationTopic);
        if (!conversation) throw new Error("Conversation not found");

        const conversationMessages = await conversation.messages();

        const endTime = Date.now();
        console.log("✅ Conversation messages loaded", {
          count: conversationMessages.length,
          duration: endTime - startTime,
          conversationId: conversationTopic,
        });

        // Update cache
        messagesCache.current.set(conversationTopic, conversationMessages);
        setMessages(conversationMessages);
        setError(null);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load conversation");
        console.error("❌ Failed to load conversation:", error);
        setError(error);

        // Fall back to cache if available
        const cached = messagesCache.current.get(conversationTopic);
        if (cached) {
          console.log("📦 Using cached messages after error");
          setMessages(cached);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client, conversationTopic],
  );

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  return {
    messages,
    isLoading,
    error,
    refresh: () => loadConversation(true),
  };
};

// Performance optimization: Enhanced message streaming with better error handling
export const useStreamAllMessages = () => {
  const client = useClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const seenMessages = useRef<Set<string>>(new Set());

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
    const maxReconnectAttempts = 3;

    const setupStream = async () => {
      try {
        console.log("🔄 Setting up V3 message streaming...");
        setError(null);
        setIsStreaming(true);
        setConnectionStatus("connecting");

        // Performance optimization: Enhanced message callback with deduplication
        const messageCallback = (message: any) => {
          if (message && !streamClosed) {
            const messageId =
              message.id || `${message.conversationId}_${message.sentAtNs}`;

            // Prevent duplicate messages
            if (seenMessages.current.has(messageId)) {
              console.log("🔄 Duplicate message filtered:", messageId);
              return;
            }

            seenMessages.current.add(messageId);

            console.log("📨 Real-time message received:", {
              id: messageId,
              content:
                typeof message.content === "string"
                  ? message.content.slice(0, 50) + "..."
                  : "non-text",
              sender: message.senderInboxId,
              conversation: message.conversationId,
              timestamp: message.sentAtNs,
            });

            setMessages((prev) => {
              // Additional safety check for duplicates
              const messageExists = prev.some(
                (msg: any) =>
                  (msg.id && msg.id === messageId) ||
                  (msg.conversationId === message.conversationId &&
                    msg.sentAtNs === message.sentAtNs),
              );

              if (messageExists) {
                console.log(
                  "🔄 Message already exists in state, skipping duplicate",
                );
                return prev;
              }

              return [...prev, message];
            });
          }
        };

        // Create the stream with proper error handling
        streamHandle =
          await client.conversations.streamAllMessages(messageCallback);

        console.log("✅ V3 message streaming established");
        setConnectionStatus("connected");
        reconnectAttempts = 0;

        // Set up cleanup function
        cleanup = () => {
          if (!streamClosed) {
            streamClosed = true;
            setIsStreaming(false);
            setConnectionStatus("disconnected");

            // Properly close the stream
            if (streamHandle) {
              try {
                if (typeof streamHandle.return === "function") {
                  streamHandle.return();
                }
                if (typeof streamHandle.close === "function") {
                  streamHandle.close();
                }
                console.log("🔄 Message stream closed cleanly");
              } catch (closeError) {
                console.warn("⚠️ Warning during stream close:", closeError);
              }
            }
          }
        };
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to stream messages");
        console.error("❌ Message streaming setup failed:", error);
        setError(error);
        setIsStreaming(false);
        setConnectionStatus("disconnected");
        streamClosed = true;

        // Retry logic for connection errors
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(
            `🔄 Retrying stream setup (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
          );
          setTimeout(() => {
            if (!streamClosed) {
              setupStream();
            }
          }, 2000 * reconnectAttempts);
        }
      }
    };

    setupStream();

    // Cleanup on unmount or client change
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [client]);

  // Clear messages when client changes
  useEffect(() => {
    if (!client) {
      setMessages([]);
      setError(null);
      setIsStreaming(false);
      setConnectionStatus("disconnected");
      seenMessages.current.clear();
    }
  }, [client]);

  return {
    messages,
    error,
    isStreaming,
    connectionStatus,
    messageCount: messages.length,
    seenCount: seenMessages.current.size,
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
