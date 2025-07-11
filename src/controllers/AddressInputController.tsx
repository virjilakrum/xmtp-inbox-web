import { useConversation, useConsent } from "../hooks/useV3Hooks";
import { useXmtpStore } from "../store/xmtp";
import { AddressInput } from "../component-library/components/AddressInput/AddressInput";

export const AddressInputController = () => {
  const { conversation } = useConversation();
  const { consent } = useConsent();
  const recipientAddress = useXmtpStore((s) => s.recipientAddress);
  const setRecipientAddress = useXmtpStore((s) => s.setRecipientAddress);

  // V3 address input logic - handles both addresses and inbox IDs
  const handleAddressChange = (address: string) => {
    try {
      // V3 can handle both Ethereum addresses and inbox IDs
      console.log("V3 address input - setting recipient:", address);
      setRecipientAddress(address);
    } catch (error) {
      console.error("Error setting recipient address:", error);
    }
  };

  return (
    <AddressInput value={recipientAddress} onChange={handleAddressChange} />
  );
};

export default AddressInputController;
