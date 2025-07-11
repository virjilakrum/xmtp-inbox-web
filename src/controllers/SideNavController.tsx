import { useWalletClient, useDisconnect } from "wagmi";
import { useXmtpStore } from "../store/xmtp";
import { useClient } from "../hooks/useV3Hooks";
import SideNav from "../component-library/components/SideNav/SideNav";
import { shortAddress } from "../helpers";

export const SideNavController = () => {
  const client = useClient();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  const clientName = useXmtpStore((s) => s.clientName);
  const clientAvatar = useXmtpStore((s) => s.clientAvatar);
  const resetXmtpState = useXmtpStore((s) => s.resetXmtpState);

  const handleDisconnect = () => {
    resetXmtpState();
    disconnect();
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
