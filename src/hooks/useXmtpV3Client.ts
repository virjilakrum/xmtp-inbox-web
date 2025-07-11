import { Client } from "@xmtp/browser-sdk";
import { WalletClient } from "viem";
import { useCallback, useEffect, useRef, useState } from "react";
import { getEnv } from "../helpers";

const XMTP_V3_INITIALIZED_KEY = "xmtp-v3-initialized-addresses";

interface XmtpV3ClientState {
  client: Client | null;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
}

interface InstallationInfo {
  id: string;
  createdAt: Date;
}

// Installation limit error detection
const isInstallationLimitError = (error: Error): boolean => {
  return (
    error.message.includes("has already registered 5/5 installations") ||
    error.message.includes("Cannot register a new installation")
  );
};

const useXmtpV3Client = () => {
  const [state, setState] = useState<XmtpV3ClientState>({
    client: null,
    isLoading: false,
    error: null,
    isConnected: false,
  });

  const clientRef = useRef<Client | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("useXmtpV3Client - Debug state:", {
      client: state.client ? "Client exists" : "Client is null",
      isLoading: state.isLoading,
      error: state.error?.message,
      isConnected: state.isConnected,
    });
  }, [state]);

  // Check if address was previously initialized
  const isAddressInitialized = (address: string): boolean => {
    try {
      const initialized = localStorage.getItem(XMTP_V3_INITIALIZED_KEY);
      if (!initialized) return false;
      const addresses = JSON.parse(initialized) as string[];
      return addresses.includes(address.toLowerCase());
    } catch {
      return false;
    }
  };

  // Mark address as initialized
  const markAddressInitialized = (address: string) => {
    try {
      const initialized = localStorage.getItem(XMTP_V3_INITIALIZED_KEY);
      const addresses = initialized
        ? (JSON.parse(initialized) as string[])
        : [];
      const lowercaseAddress = address.toLowerCase();
      if (!addresses.includes(lowercaseAddress)) {
        addresses.push(lowercaseAddress);
        localStorage.setItem(
          XMTP_V3_INITIALIZED_KEY,
          JSON.stringify(addresses),
        );
      }
    } catch (error) {
      console.error("Failed to mark address as initialized:", error);
    }
  };

  // Clear address initialization (useful when needing to reset)
  const clearAddressInitialization = (address: string) => {
    try {
      const initialized = localStorage.getItem(XMTP_V3_INITIALIZED_KEY);
      if (!initialized) return;

      const addresses = JSON.parse(initialized) as string[];
      const lowercaseAddress = address.toLowerCase();
      const updatedAddresses = addresses.filter(
        (addr) => addr !== lowercaseAddress,
      );

      localStorage.setItem(
        XMTP_V3_INITIALIZED_KEY,
        JSON.stringify(updatedAddresses),
      );

      console.log(`Cleared initialization for address: ${address}`);
    } catch (error) {
      console.error("Failed to clear address initialization:", error);
    }
  };

  // Clear all local data for the specified address
  const clearLocalData = async (address: string) => {
    try {
      console.log(`Clearing local data for address: ${address}`);

      // Clear initialization flag
      clearAddressInitialization(address);

      // Clear IndexedDB data for this address
      const dbName = `xmtp-v3-${address}`;

      // Attempt to delete the database
      if ("databases" in indexedDB) {
        const databases = await indexedDB.databases();
        const targetDb = databases.find((db) => db.name === dbName);
        if (targetDb) {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          await new Promise((resolve, reject) => {
            deleteReq.onsuccess = () => resolve(true);
            deleteReq.onerror = () => reject(deleteReq.error);
          });
          console.log(`Cleared local database: ${dbName}`);
        }
      }

      // Clear any other address-specific localStorage keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(address.toLowerCase())) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      console.log(`Cleared all local data for address: ${address}`);
    } catch (error) {
      console.error("Failed to clear local data:", error);
      throw error;
    }
  };

  // Get installation info (placeholder for V3 method when available)
  const getInstallations = async (): Promise<InstallationInfo[]> => {
    try {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }

      // TODO: When V3 SDK supports listing installations, implement here
      // For now, return empty array
      console.log("Installation listing not yet available in V3 SDK");
      return [];
    } catch (error) {
      console.error("Failed to get installations:", error);
      return [];
    }
  };

  // Revoke installation (placeholder for V3 method when available)
  const revokeInstallation = async (
    installationId: string,
  ): Promise<boolean> => {
    try {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }

      // TODO: When V3 SDK supports installation revocation, implement here
      // For now, log the attempt
      console.log(`Revocation requested for installation: ${installationId}`);
      console.log("Installation revocation not yet available in V3 SDK");
      return false;
    } catch (error) {
      console.error("Failed to revoke installation:", error);
      return false;
    }
  };

  // Try to restore existing client from database
  const tryRestoreClient = async (address: string): Promise<Client | null> => {
    try {
      console.log(
        "useXmtpV3Client - Trying to restore existing client for:",
        address,
      );

      // Check if we have a stored client for this address
      if (!isAddressInitialized(address)) {
        console.log("useXmtpV3Client - Address not previously initialized");
        return null;
      }

      // Try to create client without signer (restore from database)
      const dbPath = `xmtp-v3-${address}`;

      // TODO: In real XMTP V3, there might be a restore method
      // For now, we'll need to check if the database exists
      console.log(
        "useXmtpV3Client - Client restoration not yet implemented, will need to re-initialize",
      );
      return null;
    } catch (error) {
      console.error("useXmtpV3Client - Failed to restore client:", error);
      return null;
    }
  };

  const initialize = async (signer: WalletClient) => {
    console.log(
      "useXmtpV3Client - Starting initialization with signer:",
      signer.account?.address,
    );
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!signer.account?.address) {
        throw new Error("Wallet not connected");
      }

      const address = signer.account.address;

      // Try to restore existing client first
      const restoredClient = await tryRestoreClient(address);
      if (restoredClient) {
        console.log("useXmtpV3Client - Client restored successfully");
        clientRef.current = restoredClient;
        setState({
          client: restoredClient,
          isLoading: false,
          error: null,
          isConnected: true,
        });
        return restoredClient;
      }

      // If restoration failed, create new client (requires signature)
      console.log("useXmtpV3Client - Creating new client (signature required)");
      console.log("useXmtpV3Client - Generating encryption key...");

      // Generate a secure encryption key for the local database
      const dbEncryptionKey = crypto.getRandomValues(new Uint8Array(32));

      console.log("useXmtpV3Client - Creating V3 signer...");
      // V3 signer interface using the correct structure for EOA
      const v3Signer = {
        type: "EOA" as const,
        getIdentifier: () => ({
          identifierKind: "Ethereum" as const,
          identifier: address,
        }),
        signMessage: async (message: string) => {
          console.log("useXmtpV3Client - Signing message...");
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

      console.log("useXmtpV3Client - Creating V3 client...");
      // V3 client initialization with proper options
      const client = await Client.create(v3Signer, {
        env: getEnv() as "dev" | "production" | "local",
        dbEncryptionKey,
        dbPath: `xmtp-v3-${address}`,
      });

      console.log("useXmtpV3Client - V3 client created successfully");

      // Mark address as initialized for future sessions
      markAddressInitialized(address);

      clientRef.current = client;
      setState({
        client,
        isLoading: false,
        error: null,
        isConnected: true,
      });

      return client;
    } catch (error) {
      console.error("useXmtpV3Client - Initialization failed:", error);

      // Handle installation limit error specifically
      if (isInstallationLimitError(error as Error)) {
        const enhancedError = new Error(
          `XMTP Installation Limit Reached: This address has already registered the maximum number of installations (5/5). ` +
            `To resolve this issue:\n\n` +
            `1. Clear local data and try again (temporary fix)\n` +
            `2. Use a different wallet address for testing\n` +
            `3. Contact XMTP support if you need help revoking old installations\n\n` +
            `Original error: ${(error as Error).message}`,
        );
        enhancedError.name = "InstallationLimitError";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: enhancedError,
        }));
        throw enhancedError;
      }

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

  // Handle installation limit error recovery with address parameter
  const handleInstallationLimitError = async (address: string) => {
    if (!address) {
      throw new Error("Address is required for clearing local data");
    }

    console.log(`Handling installation limit error for address: ${address}`);

    // Clear all local data for this address
    await clearLocalData(address);

    // Reset the client state
    setState({
      client: null,
      isLoading: false,
      error: null,
      isConnected: false,
    });

    console.log(
      "Local data cleared. You can now try connecting again or use a different address.",
    );
  };

  // Remove auto-initialization to prevent unwanted signatures
  // Client will only be initialized when explicitly called
  return {
    ...state,
    initialize,
    disconnect,
    isAddressInitialized,
    // Installation management methods
    getInstallations,
    revokeInstallation,
    clearLocalData,
    handleInstallationLimitError,
    // Error helpers
    isInstallationLimitError: state.error
      ? isInstallationLimitError(state.error)
      : false,
  };
};

export default useXmtpV3Client;
