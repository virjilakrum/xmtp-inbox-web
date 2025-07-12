import type React from "react";
import { PillButton } from "../PillButton/PillButton";
import { GhostButton } from "../GhostButton/GhostButton";
import { useTranslation } from "react-i18next";
import { useXmtpStore } from "../../../store/xmtp";

interface EmptyMessageProps {
  setStartedFirstMessage?: () => void;
}

export const EmptyMessage: React.FC<EmptyMessageProps> = ({
  setStartedFirstMessage,
}) => {
  const { t } = useTranslation();
  const setActiveTab = useXmtpStore((s) => s.setActiveTab);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-white to-gray-50">
      {/* Main icon */}
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-elegant">
        <svg
          className="w-12 h-12 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        {t("messages.empty_message_header")}
      </h2>

      {/* Description */}
      <p className="text-gray-600 text-center mb-8 max-w-md leading-relaxed">
        Your zkλ inbox is empty. Start a conversation by entering an Ethereum
        address below, or explore your message requests and blocked
        conversations using the tabs above.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <PillButton
          label="Start Your First Conversation"
          onClick={() => {
            setStartedFirstMessage?.();
            setActiveTab("messages");
          }}
        />

        <div className="flex gap-3">
          <GhostButton
            label="View Requests"
            onClick={() => setActiveTab("requests")}
            variant="secondary"
            size="small"
          />
          <GhostButton
            label="View Blocked"
            onClick={() => setActiveTab("blocked")}
            variant="secondary"
            size="small"
          />
        </div>
      </div>

      {/* Help text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">Need help getting started?</p>
        <button
          className="text-sm text-gray-700 hover:text-gray-900 underline transition-colors"
          onClick={() => window.open("https://docs.xmtp.org", "_blank")}>
          Learn more about zkλ messaging
        </button>
      </div>
    </div>
  );
};
