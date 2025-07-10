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

// V3 conversation type
type CachedConversation = {
  peerAddress: string;
  topic?: string;
  conversationId?: string;
  metadata?: {
    peerAddressName?: string;
    peerAddressAvatar?: string;
  };
  walletAddress?: string;
};

export type PeerAddressAvatar = string | null;
export type PeerAddressName = string | null;

/**
 * Get the cached name of a conversation's peer address
 *
 * @param conversation The conversation
 * @returns The resolved name of the conversation's peer address
 */
export const getCachedPeerAddressName = (conversation: CachedConversation) =>
  conversation.metadata?.peerAddressName as PeerAddressName;

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
 * @param db V3 client (database managed automatically)
 */
export const setPeerAddressName = async (
  name: string | null,
  conversation: CachedConversation,
  db: any, // V3 client
) => {
  // TODO: Implement V3 conversation metadata storage
  // V3 manages database automatically, may need different approach
  console.log("V3 TODO: Store peer address name", { name, conversation });
};

/**
 * Get the cached avatar of a conversation's peer address
 *
 * @param conversation The conversation
 * @returns The avatar of the conversation's peer address
 */
export const getCachedPeerAddressAvatar = (conversation: CachedConversation) =>
  conversation.metadata?.peerAddressAvatar as PeerAddressAvatar;

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
 * @param db V3 client (database managed automatically)
 */
export const setPeerAddressAvatar = async (
  avatar: string | null,
  conversation: CachedConversation,
  db: any, // V3 client
) => {
  // TODO: Implement V3 conversation metadata storage
  // V3 manages database automatically, may need different approach
  console.log("V3 TODO: Store peer address avatar", { avatar, conversation });
};

/**
 * Given a conversation, lookup and update the identity of the conversation
 * peer address. (V3 simplified)
 */
export const updateConversationIdentity = async (
  conversation: CachedConversation,
  db: any, // V3 client
) => {
  const name = await fetchPeerAddressName(conversation);
  if (name) {
    await setPeerAddressName(name, conversation, db);

    const avatar = await fetchPeerAddressAvatar(conversation);
    if (avatar) {
      await setPeerAddressAvatar(avatar, conversation, db);
    }
  }
};

/**
 * Given an array of conversations, lookup and update the identities of the
 * conversation peer addresses. (V3 simplified)
 */
export const updateConversationIdentities = async (
  conversations: CachedConversation[],
  db: any, // V3 client
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
          void setPeerAddressName(name, convo, db);
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
              void setPeerAddressName(name, convo, db);
            });
          }
        }),
      );
    }
  }
};
