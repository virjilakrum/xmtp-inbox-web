import { useConsent } from "../../../hooks/useV3Hooks";

interface AcceptOrDenyProps {
  peerAddress: string;
  onAccept?: () => void;
  onDeny?: () => void;
}

const AcceptOrDeny: React.FC<AcceptOrDenyProps> = ({
  peerAddress,
  onAccept,
  onDeny,
}) => {
  const { consent } = useConsent();

  const handleAccept = async () => {
    try {
      await consent(peerAddress);
      onAccept?.();
    } catch (error) {
      console.error("Error accepting conversation:", error);
    }
  };

  const handleDeny = async () => {
    try {
      await consent(peerAddress);
      onDeny?.();
    } catch (error) {
      console.error("Error denying conversation:", error);
    }
  };

  return (
    <div className="accept-deny-container">
      <div className="accept-deny-buttons">
        <button type="button" onClick={handleAccept} className="accept-button">
          Accept
        </button>
        <button type="button" onClick={handleDeny} className="deny-button">
          Deny
        </button>
      </div>
    </div>
  );
};

export { AcceptOrDeny };
export default AcceptOrDeny;
