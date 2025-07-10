import { useConversation, useConsent } from "../hooks/useV3Hooks";
import { useXmtpStore } from "../store/xmtp";

export const AddressInputController = () => {
  const { conversation } = useConversation();
  const { consent } = useConsent();
  const recipientAddress = useXmtpStore((s) => s.recipientAddress);

  // TODO: Implement proper V3 address input logic
  return null;
};

export default AddressInputController;
