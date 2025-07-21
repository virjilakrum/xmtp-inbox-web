// V3 conversation helper - simplified since V3 manages database automatically
import type { ETHAddress } from "./string";
import {
  throttledFetchUnsNames,
  throttledFetchEnsAvatar,
  throttledFetchEnsName,
  throttledFetchAddressName,
} from "./string";
import { chunkArray } from "./functions";
import { getWagmiConfig } from "./config";
import {
  CachedConversation,
  CachedConversationWithId,
} from "../types/xmtpV3Types";

export type PeerAddressAvatar = string | null;
export type PeerAddressName = string | null;

/**
 * Get the cached name of a conversation's peer address
 *
 * @param conversation The conversation
 * @returns The cached name or null if not found
 */
export const getCachedPeerAddressName = (
  conversation: CachedConversation,
): PeerAddressName => {
  try {
    // For V3, check enhancedMetadata for custom nickname first
    if (conversation.enhancedMetadata?.customizations?.nickname) {
      return conversation.enhancedMetadata.customizations.nickname;
    }

    // Then check if we have a cached name in enhancedMetadata
    if (conversation.enhancedMetadata?.title) {
      return conversation.enhancedMetadata.title;
    }

    return null;
  } catch (error) {
    console.error("Error getting cached peer address name:", error);
    return null;
  }
};

/**
 * Fetch the resolved name of a conversation's peer address if it's not present
 * in the cache
 *
 * @param conversation The conversation
 * @returns The resolved name of the conversation's peer address
 */
export const fetchPeerAddressName = async (
  conversation: CachedConversation,
) => {
  // first check if the name is cached
  let name = getCachedPeerAddressName(conversation);
  if (!name) {
    name =
      (await throttledFetchAddressName(
        conversation.peerAddress as ETHAddress,
      )) ?? null;
  }
  return name;
};

/**
 * Set the peer address name in a conversation (V3 simplified)
 *
 * @param name The name for the peer address
 * @param conversation The conversation
 * @returns Promise<void>
 */
export const setPeerAddressName = async (
  name: string | null,
  conversation: CachedConversation,
): Promise<void> => {
  try {
    // V3 conversation metadata storage using localStorage (simple approach)
    const metadataKey = `xmtp-v3-peer-name-${conversation.id || conversation.peerAddress}`;
    if (name) {
      localStorage.setItem(metadataKey, name);
      console.log("V3 metadata: Stored peer address name", {
        name,
        conversationId: conversation.id,
      });
    } else {
      localStorage.removeItem(metadataKey);
    }
  } catch (error) {
    console.error("V3 metadata: Error storing peer address name", error);
  }
};

/**
 * Get the cached avatar of a conversation's peer address
 *
 * @param conversation The conversation
 * @returns The cached avatar URL or null if not found
 */
export const getCachedPeerAddressAvatar = (
  conversation: CachedConversation,
): PeerAddressAvatar => {
  try {
    // For V3, check enhancedMetadata for avatarUrl
    if (conversation.enhancedMetadata?.avatarUrl) {
      return conversation.enhancedMetadata.avatarUrl;
    }

    return null;
  } catch (error) {
    console.error("Error getting cached peer address avatar:", error);
    return null;
  }
};

/**
 * Fetch the avatar of a conversation's peer address if it's not present
 * in the cache
 *
 * @param conversation The conversation
 * @returns The avatar of the conversation's peer address
 */
export const fetchPeerAddressAvatar = async (
  conversation: CachedConversation,
) => {
  // first check if the avatar is cached
  let avatar = getCachedPeerAddressAvatar(conversation);
  if (!avatar) {
    // check for a cached name
    const name = getCachedPeerAddressName(conversation);
    if (name) {
      avatar =
        (await throttledFetchEnsAvatar(getWagmiConfig(), { name })) ?? null;
    }
  }
  return avatar;
};

/**
 * Set the peer address avatar in a conversation (V3 simplified)
 *
 * @param avatar The avatar for the peer address
 * @param conversation The conversation
 * @returns Promise<void>
 */
export const setPeerAddressAvatar = async (
  avatar: string | null,
  conversation: CachedConversation,
): Promise<void> => {
  try {
    // V3 conversation metadata storage using localStorage (simple approach)
    const metadataKey = `xmtp-v3-peer-avatar-${conversation.id || conversation.peerAddress}`;
    if (avatar) {
      localStorage.setItem(metadataKey, avatar);
      console.log("V3 metadata: Stored peer address avatar", {
        avatar,
        conversationId: conversation.id,
      });
    } else {
      localStorage.removeItem(metadataKey);
    }
  } catch (error) {
    console.error("V3 metadata: Error storing peer address avatar", error);
  }
};

/**
 * Set the cached name of a conversation's peer address
 *
 * @param conversation The conversation to update
 * @param name The name to cache
 * @returns The updated conversation (for V3, this is handled differently)
 */
export const setCachedPeerAddressName = async (
  conversation: CachedConversation,
  name: string,
): Promise<void> => {
  try {
    console.log("Setting cached peer address name for V3 conversation:", {
      conversationId: conversation.id,
      name,
    });

    // Real V3 implementation: Update conversation's enhanced metadata
    // Store in localStorage for persistence across sessions
    const metadataKey = `xmtp-v3-peer-name-${conversation.id}`;
    localStorage.setItem(metadataKey, name);

    // Update conversation metadata in memory
    if (conversation.enhancedMetadata) {
      conversation.enhancedMetadata.customizations = {
        ...conversation.enhancedMetadata.customizations,
        nickname: name,
      };
      conversation.enhancedMetadata.updatedAt = new Date();
    }

    // Dispatch custom event for real-time updates
    const event = new CustomEvent("xmtp-conversation-metadata-updated", {
      detail: {
        conversationId: conversation.id,
        type: "peerName",
        value: name,
      },
    });
    window.dispatchEvent(event);

    console.log("Successfully updated peer address name:", name);
  } catch (error) {
    console.error("Error setting cached peer address name:", error);
    throw error;
  }
};

/**
 * Set the cached avatar of a conversation's peer address
 *
 * @param conversation The conversation to update
 * @param avatar The avatar URL to cache
 * @returns The updated conversation (for V3, this is handled differently)
 */
export const setCachedPeerAddressAvatar = async (
  conversation: CachedConversation,
  avatar: string,
): Promise<void> => {
  try {
    console.log("Setting cached peer address avatar for V3 conversation:", {
      conversationId: conversation.id,
      avatar,
    });

    // Real V3 implementation: Update conversation's enhanced metadata
    // Store in localStorage for persistence across sessions
    const metadataKey = `xmtp-v3-peer-avatar-${conversation.id}`;
    localStorage.setItem(metadataKey, avatar);

    // Update conversation metadata in memory
    if (conversation.enhancedMetadata) {
      conversation.enhancedMetadata.avatarUrl = avatar;
      conversation.enhancedMetadata.updatedAt = new Date();
    }

    // Dispatch custom event for real-time updates
    const event = new CustomEvent("xmtp-conversation-metadata-updated", {
      detail: {
        conversationId: conversation.id,
        type: "peerAvatar",
        value: avatar,
      },
    });
    window.dispatchEvent(event);

    console.log("Successfully updated peer address avatar:", avatar);
  } catch (error) {
    console.error("Error setting cached peer address avatar:", error);
    throw error;
  }
};

/**
 * Given a conversation, lookup and update the identity of the conversation
 * peer address. (V3 simplified)
 */
export const updateConversationIdentity = async (
  conversation: CachedConversation,
) => {
  const name = await fetchPeerAddressName(conversation);
  if (name) {
    await setPeerAddressName(name, conversation);

    const avatar = await fetchPeerAddressAvatar(conversation);
    if (avatar) {
      await setPeerAddressAvatar(avatar, conversation);
    }
  }
};

/**
 * Given an array of conversations, lookup and update the identities of the
 * conversation peer addresses. (V3 simplified)
 */
export const updateConversationIdentities = async (
  conversations: CachedConversation[],
) => {
  // key the conversations by peer address for easy lookup
  const conversationsWithoutNameMap = conversations.reduce(
    (result, conversation) => {
      // check if conversation already has peer address name
      const name = getCachedPeerAddressName(conversation);
      // skip conversations with name
      return name
        ? result
        : {
            ...result,
            [conversation.peerAddress]: (
              result[conversation.peerAddress] ?? []
            ).concat(conversation),
          };
    },
    {} as { [peerAddress: string]: CachedConversation[] },
  );
  const addressesWithoutNames = Object.keys(
    conversationsWithoutNameMap,
  ) as ETHAddress[];

  // make sure we have addresses to lookup
  if (addressesWithoutNames.length > 0) {
    // first check for UNS names first since we can do a bulk lookup
    const unsNames = await throttledFetchUnsNames(addressesWithoutNames);
    (Object.entries(unsNames) as [ETHAddress, string][]).forEach(
      ([address, name]) => {
        const addressConversations = conversationsWithoutNameMap[address];
        addressConversations.forEach((convo) => {
          void setPeerAddressName(name, convo);
        });
      },
    );
    const unsAddresses = Object.keys(unsNames);
    const unresolvedAddresses: ETHAddress[] = addressesWithoutNames.filter(
      (address) => !unsAddresses.includes(address),
    );

    // since there's no bulk lookup for ENS names, we batch the lookups in
    // groups of 10
    // eslint-disable-next-line no-restricted-syntax
    for (const chunk of chunkArray(unresolvedAddresses, 10)) {
      // this will yield to the event loop to prevent UI blocking
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        chunk.map(async (address) => {
          const name = await throttledFetchEnsName(getWagmiConfig(), {
            address,
          });
          if (name) {
            const addressConversations = conversationsWithoutNameMap[address];
            addressConversations.forEach((convo) => {
              void setPeerAddressName(name, convo);
            });
          }
        }),
      );
    }
  }
};
