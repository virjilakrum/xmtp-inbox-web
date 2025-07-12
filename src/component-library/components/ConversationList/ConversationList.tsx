import type React from "react";
import { Virtuoso } from "react-virtuoso";
import { EmptyMessage } from "../EmptyMessage/EmptyMessage";
import { MessagePreviewCard } from "../MessagePreviewCard/MessagePreviewCard";
import type { ActiveTab } from "../../../store/xmtp";

interface ConversationListProps {
  /**
   * What conversations should we render?
   */
  messages?: Array<React.ReactNode>;
  /**
   * Are we waiting on anything loading?
   */
  isLoading?: boolean;
  /**
   * What function do we run to start the first message?
   */
  setStartedFirstMessage?: () => void;
  /**
   * Has a value been entered for the recipient?
   */
  hasRecipientEnteredValue?: boolean;
  /**
   * Which tab are we on?
   */
  activeTab: ActiveTab;
}

export const ConversationList = ({
  messages = [],
  isLoading,
  setStartedFirstMessage,
  hasRecipientEnteredValue,
  activeTab,
}: ConversationListProps) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden h-full flex flex-col justify-start sm:w-full bg-gradient-to-br from-white to-gray-50">
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Loading conversations...
          </div>
        </div>
        <div className="flex-1 space-y-2 p-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="glass p-4 animate-pulse"
              style={{
                animationDelay: `${idx * 0.1}s`,
              }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                </div>
                <div className="w-12 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state for messages tab when no conversations and no recipient entered
  if (
    !messages.length &&
    !hasRecipientEnteredValue &&
    activeTab === "messages"
  ) {
    return (
      <div className="w-full overflow-hidden sm:w-full sm:p-4 md:p-8 border border-gray-100 h-full">
        <EmptyMessage setStartedFirstMessage={setStartedFirstMessage} />
      </div>
    );
  }

  // Show empty state for other tabs
  if (
    !messages.length &&
    !hasRecipientEnteredValue &&
    activeTab !== "messages"
  ) {
    return (
      <div className="w-full overflow-hidden sm:w-full sm:p-4 md:p-8 border border-gray-100 h-full flex flex-col justify-center items-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {activeTab === "requests"
              ? "No message requests"
              : "No blocked conversations"}
          </h3>
          <p className="text-gray-500 text-sm">
            {activeTab === "requests"
              ? "New message requests will appear here"
              : "Blocked conversations will appear here"}
          </p>
        </div>
      </div>
    );
  }

  // Show conversations list
  return (
    <Virtuoso
      className="sm:w-full flex flex-col h-full bg-gray-100 border-x"
      data-testid="conversations-list-panel"
      data={messages}
      itemContent={(index, message) => message}
    />
  );
};
