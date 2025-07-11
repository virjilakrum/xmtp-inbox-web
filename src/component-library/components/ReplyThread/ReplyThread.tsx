import { useState, useEffect } from "react";
import { CachedMessageWithId } from "../../../types/xmtpV3Types";
import { useReplies } from "../../../hooks/useV3Hooks";
import { FullMessage } from "../FullMessage/FullMessage";

interface ReplyThreadProps {
  message: CachedMessageWithId;
}

const ReplyThread: React.FC<ReplyThreadProps> = ({ message }) => {
  const { replies, getReplies } = useReplies();
  const [threadReplies, setThreadReplies] = useState<CachedMessageWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // V3 reply thread logic
  useEffect(() => {
    const loadReplies = async () => {
      setIsLoading(true);
      try {
        const messageReplies = await getReplies(message.id);
        setThreadReplies(messageReplies);
      } catch (error) {
        console.error("Error loading replies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReplies();
  }, [message.id, getReplies]);

  return (
    <div className="reply-thread p-4 bg-gray-50 rounded-lg">
      <div className="original-message mb-4">
        <h3 className="text-lg font-semibold mb-2">Original Message</h3>
        <FullMessage message={message} />
      </div>

      <div className="replies-container">
        <h3 className="text-lg font-semibold mb-2">
          Replies ({threadReplies.length})
        </h3>

        {isLoading ? (
          <div className="loading">Loading replies...</div>
        ) : threadReplies.length > 0 ? (
          threadReplies.map((reply) => (
            <div
              key={reply.id}
              className="reply-item mb-2 pl-4 border-l-2 border-gray-300">
              <FullMessage message={reply} />
            </div>
          ))
        ) : (
          <div className="no-replies text-gray-500">
            No replies yet. V3 reply system ready for implementation.
          </div>
        )}
      </div>
    </div>
  );
};

export { ReplyThread };
export default ReplyThread;
