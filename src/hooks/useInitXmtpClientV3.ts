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
  // XMTP V3 client state
  const { client, isLoading, initialize, disconnect } = useXmtpV3Client();

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

  // if this is an app demo, connect to the temporary wallet
  useEffect(() => {
    if (isAppEnvDemo()) {
      connectWallet({ connector: demoConnector });
    }
    if (!client) {
      setStatus(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize V3 client when wallet is connected
  useEffect(() => {
    const initializeClient = async () => {
      if (onboardingRef.current) {
        // the walletClient has changed, restart the onboarding process
        if (walletClient !== walletClientRef.current) {
          setStatus(undefined);
          setSigning(false);
        } else {
          // onboarding in progress and walletClient is the same, do nothing
          return;
        }
      }

      // skip this if we already have a client and ensure we have a walletClient
      if (!client && walletClient) {
        onboardingRef.current = true;
        const { address } = walletClient.account;

        try {
          setSigning(true);
          setStatus("new");

          // Initialize V3 client
          await initialize(walletClient);

          // Set up profile information
          const name = await throttledFetchAddressName(address as ETHAddress);
          if (name) {
            const avatar = await throttledFetchEnsAvatar(getWagmiConfig(), {
              name,
            });
            setClientAvatar(avatar);
            setClientName(name);
          }

          setStatus("enabled");
          setSigning(false);
        } catch (error) {
          console.error("Failed to initialize XMTP V3 client:", error);
          setSigning(false);
          setStatus(undefined);
        } finally {
          onboardingRef.current = false;
        }
      }
    };

    void initializeClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, walletClient]);

  // it's important that this effect runs last
  useEffect(() => {
    walletClientRef.current = walletClient;
  }, [walletClient]);

  return {
    client,
    isLoading: isLoading || signing,
    status,
    setStatus,
    disconnect,
  };
};

export default useInitXmtpClientV3;
