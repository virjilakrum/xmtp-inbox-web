import { useConversation, useConsent } from "../hooks/useV3Hooks";
import { useXmtpStore } from "../store/xmtp";
import { AddressInput } from "../component-library/components/AddressInput/AddressInput";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useClient } from "../hooks/useV3Hooks";

export const AddressInputController = () => {
  const conversationTopic = useXmtpStore((s) => s.conversationTopic);
  const { messages, isLoading, error } = useConversation(
    conversationTopic || "",
  );
  const { conversation } = useSelectedConversation();
  const { consent } = useConsent();
  const client = useClient();
  const recipientAddress = useXmtpStore((s) => s.recipientAddress);
  const setRecipientAddress = useXmtpStore((s) => s.setRecipientAddress);

  // **FIX**: Enhanced V3 address input logic with validation
  const handleAddressChange = (address: string) => {
    try {
      // **FIX**: Enhanced validation to prevent self-messaging
      const clientAddress = client?.inboxId;

      if (
        address &&
        clientAddress &&
        address.toLowerCase() === clientAddress.toLowerCase()
      ) {
        console.warn("⚠️ Cannot message yourself:", address);
        // Don't set the address if it's the same as the client
        return;
      }

      // **FIX**: Enhanced address format validation
      const isValidAddress =
        /^0x[a-fA-F0-9]{40}$/.test(address) ||
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(address) ||
        address === ""; // Allow empty for clearing

      if (!isValidAddress && address !== "") {
        console.warn("⚠️ Invalid address format:", address);
        // Still set the address but log the warning
      }

      console.log("V3 address input - setting recipient:", {
        address,
        clientAddress,
        isSelf: address.toLowerCase() === clientAddress?.toLowerCase(),
        isValid: isValidAddress,
      });

      setRecipientAddress(address);
    } catch (error) {
      console.error("Error setting recipient address:", error);
    }
  };

  return (
    <AddressInput
      value={recipientAddress}
      onChange={handleAddressChange}
      isLoading={isLoading}
      isError={!!error}
      subtext={
        conversation ? `Connected to ${conversation.peerAddress}` : undefined
      }
    />
  );
};

export default AddressInputController;
