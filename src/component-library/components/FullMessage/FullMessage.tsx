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

  // TODO: Implement proper V3 message display logic
  return (
    <div className="message-container">
      <div className="message-content">
        {/* TODO: Implement proper message rendering */}
        <p>Message: {JSON.stringify(message)}</p>
      </div>
    </div>
  );
};

export { FullMessage };
export default FullMessage;
