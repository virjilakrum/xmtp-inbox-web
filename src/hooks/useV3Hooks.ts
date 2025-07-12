import { useXmtpV3Context } from "../context/XmtpV3Provider";
import { useState, useEffect, useCallback } from "react";
import useXmtpV3Client from "./useXmtpV3Client";
import { useXmtpStore } from "../store/xmtp";

// V3 equivalent of useClient from V2
export const useClient = () => {
  const context = useXmtpV3Context();
  return context.client;
};

// V3 equivalent of useConversations from V2
export const useConversations = () => {
  const client = useClient();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadConversations = useCallback(async () => {
    if (!client) return;

    setIsLoading(true);
    try {
      // V3 conversations.list() returns conversations in descending order by last message
      const convos = await client.conversations.list();
      setConversations(convos);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load conversations"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (client) {
      loadConversations();
    }
  }, [client, loadConversations]);

  return { conversations, isLoading, error, refresh: loadConversations };
};

// V3 equivalent of useCanMessage from V2
export const useCanMessage = () => {
  const client = useClient();

  return {
    canMessage: useCallback(
      async (addresses: string[]): Promise<Record<string, boolean>> => {
        if (!client) return {};
        try {
          // V3 uses identifiers instead of addresses
          const identifiers = addresses.map((address) => ({
            identifierKind: "Ethereum" as const,
            identifier: address,
          }));

          const result = await client.canMessage(identifiers);

          // Convert Map to Record for compatibility
          const canMessageRecord: Record<string, boolean> = {};
          result.forEach((canMessage, inboxId) => {
            // Find corresponding address for this inbox ID
            const index = Array.from(result.keys()).indexOf(inboxId);
            if (index >= 0 && addresses[index]) {
              canMessageRecord[addresses[index]] = canMessage;
            }
          });

          return canMessageRecord;
        } catch (error) {
          console.error("Error checking canMessage:", error);
          return {};
        }
      },
      [client],
    ),
  };
};

// V3 equivalent of useSendMessage from V2
export const useSendMessage = () => {
  const client = useClient();

  return {
    sendMessage: useCallback(
      async (conversationId: string, content: any) => {
        if (!client) throw new Error("Client not initialized");
        try {
          // V3 conversation.send() with encoded content
          const conversation =
            await client.conversations.getConversationById(conversationId);
          if (!conversation) throw new Error("Conversation not found");

          const messageId = await conversation.send(content);
          return { id: messageId, conversationId, content };
        } catch (error) {
          console.error("Error sending message:", error);
          throw error;
        }
      },
      [client],
    ),
  };
};

// V3 equivalent of useConsent from V2 - now uses inbox-based consent
export const useConsent = () => {
  const client = useClient();

  return {
    consent: useCallback(
      async (addressOrInboxId: string, allow: boolean = true) => {
        if (!client) return;
        try {
          // V3 consent management is at conversation level or inbox level
          const consentState = allow ? "allowed" : "denied";

          // Try to find inbox ID for this address if needed
          let inboxId = addressOrInboxId;
          if (addressOrInboxId.startsWith("0x")) {
            // This is an address, find the inbox ID
            const foundInboxId = await client.findInboxIdByIdentifier({
              identifierKind: "Ethereum" as const,
              identifier: addressOrInboxId,
            });
            if (foundInboxId) {
              inboxId = foundInboxId;
            }
          }

          // Set consent preference at inbox level
          await client.preferences.setConsentStates([
            {
              entity: inboxId,
              entityType: "inbox_id" as any, // V3 consent entity type (strict typing)
              state: consentState as any, // V3 consent state (strict typing)
            },
          ]);
        } catch (error) {
          console.error("Error managing consent:", error);
        }
      },
      [client],
    ),

    allow: useCallback(
      async (addresses: string[]) => {
        if (!client) return;
        const consentHook = useConsent();
        for (const address of addresses) {
          await consentHook.consent(address, true);
        }
      },
      [client],
    ),

    deny: useCallback(
      async (addresses: string[]) => {
        if (!client) return;
        const consentHook = useConsent();
        for (const address of addresses) {
          await consentHook.consent(address, false);
        }
      },
      [client],
    ),
  };
};

// V3 equivalent of useDb from V2 - V3 manages database automatically
export const useDb = () => {
  const client = useClient();
  return {
    db: client, // V3 client has built-in database management
  };
};

// V3 equivalent of useStartConversation from V2 - uses inbox IDs
export const useStartConversation = () => {
  const client = useClient();

  return {
    startConversation: useCallback(
      async (peerAddress: string) => {
        if (!client) throw new Error("Client not initialized");
        try {
          // V3 uses findOrCreateDm with inbox ID instead of address
          let inboxId = peerAddress;

          // If this is an address, find the inbox ID
          if (peerAddress.startsWith("0x")) {
            const foundInboxId = await client.findInboxIdByIdentifier({
              identifierKind: "Ethereum" as const,
              identifier: peerAddress,
            });
            if (!foundInboxId) {
              throw new Error(
                `No inbox found for address: ${peerAddress}. This address needs to connect to XMTP first.`,
              );
            }
            inboxId = foundInboxId;
          }

          // V3 conversations.newDm() creates or returns existing DM
          const conversation = await client.conversations.newDm(inboxId);
          return {
            cachedConversation: conversation,
            conversation: conversation,
          };
        } catch (error) {
          console.error("Error starting conversation:", error);
          throw error;
        }
      },
      [client],
    ),
  };
};

// V3 equivalent of useConversation from V2
export const useConversation = () => {
  const client = useClient();

  // V3 selected conversation state management using conversationTopic
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Load conversation when topic changes
  useEffect(() => {
    if (client && conversationTopic) {
      const loadConversation = async () => {
        try {
          const conversation =
            await client.conversations.getConversationById(conversationTopic);
          setSelectedConversation(conversation);
        } catch (error) {
          console.error("Error loading selected conversation:", error);
          setSelectedConversation(null);
        }
      };
      loadConversation();
    } else {
      setSelectedConversation(null);
    }
  }, [client, conversationTopic]);

  return {
    conversation: selectedConversation,
    getCachedByTopic: useCallback(
      async (topic: string) => {
        if (!client) return null;
        try {
          // V3 uses conversation ID instead of topic
          return await client.conversations.getConversationById(topic);
        } catch (error) {
          console.error("Error getting conversation by topic:", error);
          return null;
        }
      },
      [client],
    ),

    getCachedByPeerAddress: useCallback(
      async (peerAddress: string) => {
        if (!client) return null;
        try {
          // Find inbox ID for address, then get DM conversation
          const inboxId = await client.findInboxIdByIdentifier({
            identifierKind: "Ethereum" as const,
            identifier: peerAddress,
          });
          if (!inboxId) return null;

          return await client.conversations.getDmByInboxId(inboxId);
        } catch (error) {
          console.error("Error getting conversation by peer address:", error);
          return null;
        }
      },
      [client],
    ),
  };
};

// V3 equivalent of useStreamAllMessages from V2
export const useStreamAllMessages = () => {
  const client = useClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) return;

    const setupStream = async () => {
      try {
        // V3 conversations.streamAllMessages() returns a Promise<AsyncStream>
        const stream = await client.conversations.streamAllMessages(
          (message) => {
            if (message) {
              setMessages((prev) => [...prev, message]);
            }
          },
        );

        return () => {
          // Clean up stream
          if (stream && typeof stream.return === "function") {
            stream.return();
          }
        };
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to stream messages"),
        );
      }
    };

    setupStream();
  }, [client]);

  return { messages, error };
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
