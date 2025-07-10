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
  // TODO: Implement proper V3 reactions bar logic
  return (
    <div className="reactions-bar">
      {/* TODO: Implement reactions UI */}
      <div>Reactions placeholder</div>
    </div>
  );
};

export { ReactionsBar };
export default ReactionsBar;
