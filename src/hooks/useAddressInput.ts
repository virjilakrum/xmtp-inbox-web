import { useCallback } from "react";
import { useCanMessage } from "./useV3Hooks";
import { isValidLongWalletAddress } from "../helpers";

const useAddressInput = () => {
  const canMessage = useCanMessage();

  const validateAddress = useCallback(
    async (address: string) => {
      if (!address) return false;
      if (!isValidLongWalletAddress(address)) return false;

      try {
        const canMessageResult = await canMessage([address]);
        return canMessageResult[address] === true;
      } catch (error) {
        console.error("Error validating address:", error);
        return false;
      }
    },
    [canMessage],
  );

  return {
    validateAddress,
  };
};

export default useAddressInput;
