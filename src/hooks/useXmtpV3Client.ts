import { useEffect, useRef, useState } from "react";
import { useWalletClient } from "wagmi";
import { Client } from "@xmtp/browser-sdk";
import type { WalletClient } from "viem";
import { getEnv, getAppVersion } from "../helpers";

interface XmtpV3ClientState {
  client: Client | null;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
}

const useXmtpV3Client = () => {
  const [state, setState] = useState<XmtpV3ClientState>({
    client: null,
    isLoading: false,
    error: null,
    isConnected: false,
  });

  const { data: walletClient } = useWalletClient();
  const clientRef = useRef<Client | null>(null);

  const initialize = async (signer: WalletClient) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!signer.account?.address) {
        throw new Error("Wallet not connected");
      }

      // Generate a secure encryption key for the local database
      const dbEncryptionKey = crypto.getRandomValues(new Uint8Array(32));

      // V3 signer interface using the correct structure for EOA
      const v3Signer = {
        type: "EOA" as const,
        getIdentifier: () => ({
          identifierKind: "Ethereum" as const,
          identifier: signer.account!.address,
        }),
        signMessage: async (message: string) => {
          const signature = await signer.signMessage({
            message,
            account: signer.account!,
          });
          return new Uint8Array(
            signature
              .slice(2)
              .match(/.{1,2}/g)!
              .map((byte) => parseInt(byte, 16)),
          );
        },
      };

      // V3 client initialization with proper options
      const client = await Client.create(v3Signer, {
        env: getEnv() as "dev" | "production" | "local",
        dbEncryptionKey,
        dbPath: `xmtp-v3-${signer.account.address}`,
      });

      clientRef.current = client;
      setState({
        client,
        isLoading: false,
        error: null,
        isConnected: true,
      });

      return client;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to initialize V3 client"),
      }));
      throw error;
    }
  };

  const disconnect = async () => {
    if (clientRef.current) {
      try {
        // Clean shutdown of V3 client
        await clientRef.current.close();
        clientRef.current = null;
      } catch (error) {
        console.error("Error disconnecting V3 client:", error);
      }
    }
    setState({
      client: null,
      isLoading: false,
      error: null,
      isConnected: false,
    });
  };

  useEffect(() => {
    if (walletClient && !state.client && !state.isLoading) {
      initialize(walletClient).catch(console.error);
    }
  }, [walletClient, state.client, state.isLoading]);

  return {
    ...state,
    initialize,
    disconnect,
  };
};

export default useXmtpV3Client;
