import React from "react";
import {
  ExclamationCircleIcon,
  UsersIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";
import { PillButton } from "../PillButton/PillButton";

interface InboxNotFoundErrorProps {
  recipientAddress: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export const InboxNotFoundError: React.FC<InboxNotFoundErrorProps> = ({
  recipientAddress,
  onRetry,
  onClose,
}) => {
  const formatAddress = (address: string) => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const shareInvite = () => {
    const inviteText = `Hey! I tried to message you on zkλ but you need to set up your inbox first. Visit https://zkλ.org to get started with decentralized messaging! 🚀`;
    const mailtoUrl = `mailto:?subject=Join me on zkλ&body=${encodeURIComponent(inviteText)}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <ExclamationCircleIcon className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
          Recipient Not Found
        </h3>

        {/* Description */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            The address{" "}
            <button
              onClick={() => copyToClipboard(recipientAddress)}
              className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              title="Click to copy address">
              {formatAddress(recipientAddress)}
            </button>{" "}
            hasn't set up zkλ messaging yet.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-800">
                <p className="font-medium mb-1">What does this mean?</p>
                <p>
                  zkλ requires both sender and recipient to have an active
                  inbox. The person you're trying to message needs to connect
                  their wallet to zkλ first.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <PillButton
            label="Invite to zkλ"
            iconOverride={<UsersIcon className="w-4 h-4" />}
            onClick={shareInvite}
            variant="primary"
            testId="invite-to-zkλ"
          />

          {onRetry && (
            <PillButton
              label="Try Again"
              onClick={onRetry}
              variant="secondary"
              testId="retry-message"
            />
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes scale-up {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-scale-up {
    animation: scale-up 0.2s ease-out;
  }
`;
document.head.appendChild(style);
