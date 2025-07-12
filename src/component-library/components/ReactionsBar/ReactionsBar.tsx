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
      className="glass rounded-2xl p-3 flex gap-2 shadow-elegant hover:shadow-modern transition-all duration-300 animate-fade-in-scale backdrop-blur-sm border border-gray-200/50"
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}>
      {reactions.map((emoji, index) => (
        <button
          key={emoji}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 hover:bg-white border border-gray-200/50 hover:border-gray-300 text-lg transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-elegant"
          onClick={() => handleReaction(emoji)}
          type="button"
          style={{
            animationDelay: `${index * 50}ms`,
          }}>
          {/* Hover background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl -skew-x-12" />

          {/* Emoji */}
          <span className="relative z-10 transition-transform duration-200 group-hover:scale-125 group-active:scale-90">
            {emoji}
          </span>

          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
            React with {emoji}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
          </div>
        </button>
      ))}
    </div>
  );
};

export { ReactionsBar };
export default ReactionsBar;
