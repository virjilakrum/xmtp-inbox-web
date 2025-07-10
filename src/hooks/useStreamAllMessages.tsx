import { useStreamAllMessages } from "./useV3Hooks";
import { DecodedMessage } from "@xmtp/browser-sdk";

export const useStreamAllMessagesHook = () => {
  const { messages, error } = useStreamAllMessages();

  return {
    messages: messages as DecodedMessage[],
    error,
    isLoading: false,
  };
};

export default useStreamAllMessagesHook;
