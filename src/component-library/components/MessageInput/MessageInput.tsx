import { useState } from "react";
import { CachedConversation } from "../../../types/xmtpV3Types";

interface MessageInputProps {
  peerAddress: string;
  isDisabled: boolean;
  conversation: CachedConversation | null;
  // Add other props as needed
}

const MessageInput: React.FC<MessageInputProps> = ({
  peerAddress,
  isDisabled,
  conversation,
}) => {
  const [message, setMessage] = useState("");

  // TODO: Implement proper V3 message input logic
  return (
    <div className="message-input-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={isDisabled}
        className="message-input"
      />
      <button
        type="button"
        disabled={isDisabled || !message.trim()}
        className="send-button"
        onClick={() => {
          // TODO: Implement send logic
          console.log("Send message:", message);
        }}>
        Send
      </button>
    </div>
  );
};

export { MessageInput };
export default MessageInput;
