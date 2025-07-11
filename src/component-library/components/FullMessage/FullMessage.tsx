import { useState } from "react";
import { useCanMessage } from "../../../hooks/useV3Hooks";
import { CachedMessageWithId } from "../../../types/xmtpV3Types";
import { shortAddress } from "../../../helpers";

interface FullMessageProps {
  message: CachedMessageWithId;
  // Add other props as needed
}

const FullMessage: React.FC<FullMessageProps> = ({ message }) => {
  const { canMessage } = useCanMessage();
  const [isLoading, setIsLoading] = useState(false);

  // V3 message display logic
  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(timestamp);
  };

  const getSenderAddress = () => {
    if (message.message.senderInboxId) {
      return shortAddress(message.message.senderInboxId);
    }
    return message.message.senderInboxId || "Unknown";
  };

  return (
    <div className="message-container p-4 border-b border-gray-200">
      <div className="message-header mb-2">
        <span className="text-sm font-semibold text-gray-700">
          {getSenderAddress()}
        </span>
        <span className="text-xs text-gray-500 ml-2">
          {formatTimestamp(
            new Date(Number(message.message.sentAtNs) / 1000000),
          )}
        </span>
      </div>
      <div className="message-content">
        <p className="text-gray-900">{String(message.message.content)}</p>
      </div>
    </div>
  );
};

export { FullMessage };
export default FullMessage;
