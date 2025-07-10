import { useState } from "react";
import {
  CachedMessageWithId,
  RemoteAttachmentContent,
} from "../../../types/xmtpV3Types";

interface RemoteAttachmentMessageTileProps {
  message: CachedMessageWithId;
}

const RemoteAttachmentMessageTile: React.FC<
  RemoteAttachmentMessageTileProps
> = ({ message }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement proper V3 remote attachment handling
  return (
    <div className="remote-attachment-tile">
      <div className="attachment-container">
        {/* TODO: Implement proper attachment rendering */}
        <p>Remote Attachment: {JSON.stringify(message.message)}</p>
      </div>
    </div>
  );
};

export { RemoteAttachmentMessageTile };
export default RemoteAttachmentMessageTile;
