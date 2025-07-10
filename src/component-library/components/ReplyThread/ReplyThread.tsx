import { CachedMessageWithId } from "../../../types/xmtpV3Types";

interface ReplyThreadProps {
  message: CachedMessageWithId;
}

const ReplyThread: React.FC<ReplyThreadProps> = ({ message }) => {
  // TODO: Implement proper V3 reply thread logic
  return (
    <div className="reply-thread">
      <div className="reply-container">
        {/* TODO: Implement proper reply thread rendering */}
        <p>Reply Thread for message: {message.id}</p>
      </div>
    </div>
  );
};

export { ReplyThread };
export default ReplyThread;
