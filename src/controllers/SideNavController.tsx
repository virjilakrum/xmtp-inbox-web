import { useWalletClient, useDisconnect } from "wagmi";
import { useXmtpStore } from "../store/xmtp";
import { useClient } from "../hooks/useV3Hooks";
import { useXmtpV3Context } from "../context/XmtpV3Provider";
import SideNav from "../component-library/components/SideNav/SideNav";
import { shortAddress } from "../helpers";

export const SideNavController = () => {
  const client = useClient();
  const { data: walletClient } = useWalletClient();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { disconnect: disconnectXmtp } = useXmtpV3Context();

  const clientName = useXmtpStore((s) => s.clientName);
  const clientAvatar = useXmtpStore((s) => s.clientAvatar);
  const resetXmtpState = useXmtpStore((s) => s.resetXmtpState);

  const handleDisconnect = async () => {
    try {
      console.log("SideNavController - Starting disconnect process");

      // Reset XMTP state first
      resetXmtpState();

      // Disconnect XMTP client
      if (client) {
        console.log("SideNavController - Disconnecting XMTP client");
        await disconnectXmtp();
      }

      // Disconnect wallet
      console.log("SideNavController - Disconnecting wallet");
      disconnectWallet();

      console.log("SideNavController - Disconnect process completed");
    } catch (error) {
      console.error("SideNavController - Error during disconnect:", error);
      // Even if XMTP disconnect fails, still disconnect wallet
      disconnectWallet();
    }
  };

  if (!client || !walletClient) {
    return null;
  }

  const walletAddress = walletClient.account?.address;
  const displayAddress =
    clientName || (walletAddress ? shortAddress(walletAddress) : "");

  return (
    <SideNav
      displayAddress={displayAddress}
      walletAddress={walletAddress}
      avatarUrl={clientAvatar}
      onDisconnect={handleDisconnect}
    />
  );
};

export default SideNavController;
