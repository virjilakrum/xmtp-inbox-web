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
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  // V3 remote attachment handling
  const loadAttachment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // V3 attachment loading logic
      console.log(
        "V3 attachment - loading remote attachment for message:",
        message.id,
      );

      // In V3, remote attachments are handled through ContentTypeRemoteAttachment
      // This would decrypt and load the attachment from remote storage
      const attachmentContent = message.message
        .content as RemoteAttachmentContent;

      if (attachmentContent && attachmentContent.url) {
        setAttachmentUrl(attachmentContent.url);
      }
    } catch (err) {
      console.error("Error loading remote attachment:", err);
      setError("Failed to load attachment");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileName = () => {
    try {
      const content = message.message.content as RemoteAttachmentContent;
      return content.filename || "attachment";
    } catch {
      return "attachment";
    }
  };

  const getFileSize = () => {
    try {
      const content = message.message.content as RemoteAttachmentContent;
      return content.contentLength
        ? `${Math.round(content.contentLength / 1024)}KB`
        : "Unknown size";
    } catch {
      return "Unknown size";
    }
  };

  return (
    <div className="remote-attachment-tile border rounded-lg p-4 bg-gray-50">
      <div className="attachment-container">
        <div className="attachment-header flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800">📎 {getFileName()}</h4>
          <span className="text-sm text-gray-500">{getFileSize()}</span>
        </div>

        {error && (
          <div className="error text-red-500 text-sm mb-2">{error}</div>
        )}

        {isLoading ? (
          <div className="loading text-gray-500">Loading attachment...</div>
        ) : attachmentUrl ? (
          <div className="attachment-content">
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline">
              Open Attachment
            </a>
          </div>
        ) : (
          <button
            onClick={loadAttachment}
            className="load-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Load Attachment
          </button>
        )}
      </div>
    </div>
  );
};

export { RemoteAttachmentMessageTile };
export default RemoteAttachmentMessageTile;
