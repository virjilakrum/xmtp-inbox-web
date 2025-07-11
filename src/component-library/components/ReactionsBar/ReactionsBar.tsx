import {
  CachedMessageWithId,
  CachedConversation,
} from "../../../types/xmtpV3Types";

interface ReactionsBarProps {
  message: CachedMessageWithId;
  conversation: CachedConversation;
  setOnHover: (hover: boolean) => void;
}

const ReactionsBar: React.FC<ReactionsBarProps> = ({
  message,
  conversation,
  setOnHover,
}) => {
  // V3 reactions bar logic
  const reactions = ["👍", "👎", "😀", "😢", "😮", "😡"];

  const handleReaction = async (emoji: string) => {
    try {
      console.log(
        "V3 reaction - adding reaction:",
        emoji,
        "to message:",
        message.id,
      );
      // V3 reaction implementation would use ContentTypeReaction
      // await conversation.conversation.send({ content: emoji }, { contentType: ContentTypeReaction });
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  return (
    <div
      className="reactions-bar flex gap-2 p-2 bg-gray-50 rounded-lg"
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}>
      {reactions.map((emoji) => (
        <button
          key={emoji}
          className="reaction-button hover:bg-gray-200 p-1 rounded text-lg"
          onClick={() => handleReaction(emoji)}
          type="button">
          {emoji}
        </button>
      ))}
    </div>
  );
};

export { ReactionsBar };
export default ReactionsBar;
