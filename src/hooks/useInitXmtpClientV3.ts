import { useEffect, useRef, useState } from "react";
import { useConnect, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";
import type { ETHAddress } from "../helpers";
import {
  getAppVersion,
  getEnv,
  isAppEnvDemo,
  throttledFetchAddressName,
  throttledFetchEnsAvatar,
} from "../helpers";
import { demoConnector } from "../helpers/demoConnector";
import { useXmtpStore } from "../store/xmtp";
import { getWagmiConfig } from "../helpers/config";
import useXmtpV3Client from "./useXmtpV3Client";

type ClientStatus = "new" | "created" | "enabled";

const useInitXmtpClientV3 = () => {
  // XMTP V3 client state with error handling
  const {
    client,
    isLoading,
    initialize,
    silentRestore,
    disconnect,
    isAddressInitialized: checkAddressInitialized,
    error,
    handleInstallationLimitError,
    clearLocalData,
    isInstallationLimitError,
  } = useXmtpV3Client();

  // track if onboarding is in progress
  const onboardingRef = useRef(false);
  const walletClientRef = useRef<WalletClient | null>();
  // XMTP address status
  const [status, setStatus] = useState<ClientStatus | undefined>();
  // is there a pending signature?
  const [signing, setSigning] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { connect: connectWallet } = useConnect();
  const setClientName = useXmtpStore((s) => s.setClientName);
  const setClientAvatar = useXmtpStore((s) => s.setClientAvatar);

  // Compute boolean value for current wallet address
  const isAddressInitialized = walletClient?.account?.address
    ? checkAddressInitialized(walletClient.account.address)
    : false;

  // Debug logging
  useEffect(() => {
    console.log("useInitXmtpClientV3 - Debug state:", {
      client: client ? "Client exists" : "Client is null",
      isLoading,
      walletClient: walletClient
        ? `Connected: ${walletClient.account?.address}`
        : "Not connected",
      status,
      signing,
      isAddressInitialized,
      error: error?.message,
      isInstallationLimitError,
    });
  }, [
    client,
    isLoading,
    walletClient,
    status,
    signing,
    isAddressInitialized,
    error,
    isInstallationLimitError,
  ]);

  // Handle installation limit error recovery
  const handleInstallationLimitRecovery = async () => {
    try {
      if (!walletClient?.account?.address) {
        throw new Error("Wallet not connected");
      }

      const address = walletClient.account.address;
      console.log(
        `Starting installation limit recovery for address: ${address}`,
      );

      await handleInstallationLimitError(address);
      setStatus(undefined);
      setSigning(false);
      console.log("Installation limit error recovery completed");
    } catch (error) {
      console.error("Failed to recover from installation limit error:", error);
      throw error;
    }
  };

  // Manual client initialization function
  const initializeXmtpClient = async () => {
    if (!walletClient || onboardingRef.current || client) {
      console.log("useInitXmtpClientV3 - Skipping initialization:", {
        hasWallet: !!walletClient,
        onboarding: onboardingRef.current,
        hasClient: !!client,
      });
      return;
    }

    console.log(
      "useInitXmtpClientV3 - Starting manual client initialization for:",
      walletClient.account?.address,
    );
    onboardingRef.current = true;
    const { address } = walletClient.account;

    try {
      setSigning(true);
      setStatus("new");

      // Initialize V3 client
      console.log("useInitXmtpClientV3 - Calling initialize...");
      await initialize(walletClient);
      console.log("useInitXmtpClientV3 - V3 client initialized successfully");

      // Set up profile information
      const name = await throttledFetchAddressName(address as ETHAddress);
      if (name) {
        const avatar = await throttledFetchEnsAvatar(getWagmiConfig(), {
          name,
        });
        if (avatar) {
          setClientAvatar(avatar);
        }
        setClientName(name);
      }

      setStatus("enabled");
      setSigning(false);
      console.log("useInitXmtpClientV3 - V3 client setup complete");
    } catch (error) {
      console.error("Failed to initialize XMTP V3 client:", error);
      setSigning(false);

      // Don't clear status for installation limit errors - let user handle it
      if ((error as Error).name !== "InstallationLimitError") {
        setStatus(undefined);
      }
    } finally {
      onboardingRef.current = false;
    }
  };

  // Demo connection (if needed)
  useEffect(() => {
    if (isAppEnvDemo()) {
      console.log("Demo mode - connecting to demo wallet");
      // TODO: Fix demo connector usage
      // connectWallet({ connector: demoConnector });
    }
    if (!client) {
      setStatus(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-detect wallet changes and clear client if needed
  useEffect(() => {
    if (walletClient !== walletClientRef.current) {
      if (walletClientRef.current && walletClient) {
        // Wallet changed, disconnect old client
        console.log("useInitXmtpClientV3 - Wallet changed, clearing client");
        disconnect();
        setStatus(undefined);
        setSigning(false);
      }

      // If a wallet is connected and we don't have a client, try to restore first
      if (walletClient && !client && walletClient.account?.address) {
        const address = walletClient.account.address;
        console.log(
          "useInitXmtpClientV3 - Wallet connected, checking for existing client",
        );

        // Check if we can restore the client without signature
        if (isAddressInitialized) {
          console.log(
            "useInitXmtpClientV3 - Address previously initialized, attempting silent restore",
          );
          // Try to restore the client silently (won't create new client)
          silentRestore(address).catch((error) => {
            console.log(
              "useInitXmtpClientV3 - Silent restore failed, user will need to manually initialize:",
              error.message,
            );
            // Don't throw error, just log it - user can manually initialize
          });
        } else {
          console.log(
            "useInitXmtpClientV3 - Address not previously initialized, waiting for manual initialization",
          );
        }
      }
    }
    walletClientRef.current = walletClient;
  }, [walletClient, disconnect, isAddressInitialized, client, silentRestore]);

  return {
    client,
    isLoading: isLoading || signing,
    status,
    setStatus,
    disconnect,
    initializeXmtpClient, // Manual initialization function
    isAddressInitialized,
    canInitialize: !!walletClient && !client && !onboardingRef.current,
    // Error handling
    error,
    isInstallationLimitError,
    handleInstallationLimitRecovery,
    clearLocalData: walletClient?.account?.address
      ? () => clearLocalData(walletClient.account!.address)
      : undefined,
  };
};

export default useInitXmtpClientV3;
