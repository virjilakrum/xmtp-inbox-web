import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { StarIcon } from "@heroicons/react/solid";
import { IconSkeletonLoader } from "../Loaders/SkeletonLoaders/IconSkeletonLoader";
import { ShortCopySkeletonLoader } from "../Loaders/SkeletonLoaders/ShortCopySkeletonLoader";
import { classNames } from "../../../helpers";
import { Avatar } from "../Avatar/Avatar";
import type { ActiveTab } from "../../../store/xmtp";

interface MessagePreviewCardProps {
  /**
   * What is the avatar url?
   */
  avatarUrl?: string;
  /**
   * What is the message text?
   */
  text?: string | ReactElement;
  /**
   * What is the display address associated with the message?
   */
  displayAddress?: string;
  /**
   * What is the wallet address associated with the message?
   */
  address: string;
  /**
   * What is the datetime of the message
   */
  datetime?: Date;
  /**
   * Are we waiting on anything loading?
   */
  isLoading?: boolean;
  /**
   * What happens on message click?
   */
  onClick?: () => void;
  /**
   * Is conversation selected?
   */
  isSelected?: boolean;
  /**
   * What is the app this conversation started on?
   */
  conversationDomain?: string;
  /**
   * Is this conversation pinned?
   */
  pinned?: boolean;
  /**
   * Which tab are we on?
   */
  activeTab: ActiveTab;
  /**
   * Method to reset tab
   */
  setActiveTab: (tab: ActiveTab) => void;
  /**
   * Method to allow an address
   */
  allow: (address: string[]) => Promise<void>;
}

export const MessagePreviewCard = ({
  avatarUrl,
  text,
  displayAddress,
  address,
  datetime,
  isLoading = false,
  onClick,
  isSelected,
  conversationDomain,
  pinned,
  activeTab,
  setActiveTab,
  allow,
}: MessagePreviewCardProps) => {
  const { t } = useTranslation();

  return (
    <div
      role="button"
      className={classNames(
        "flex items-center transition-all duration-200 ease-out cursor-pointer relative group overflow-hidden",
        "border-0 border-b border-gray-200/50 hover:border-gray-300",
        "transform hover:scale-[1.02] active:scale-[0.98]",
        isSelected
          ? "bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 shadow-elegant"
          : "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:via-white hover:to-gray-50",
        isLoading ? "px-4 py-3" : "p-4",
      )}
      onClick={onClick}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={0}>
      {/* Hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 -skew-x-12" />

      {/* Left border indicator for selected state */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-700 to-gray-900" />
      )}

      {/* Avatar Section */}
      <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        <Avatar url={avatarUrl} address={address} isLoading={isLoading} />
        {/* Online status indicator for active conversations */}
        {!isLoading && pinned && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content Section */}
      <div
        className={classNames(
          "flex flex-col items-start flex-1 ml-4 relative z-10",
          !isLoading ? "overflow-hidden" : "",
        )}>
        {/* Domain Badge */}
        {!isLoading && conversationDomain && (
          <div className="text-xs mb-2 text-white px-3 py-1 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 shadow-sm font-medium">
            {conversationDomain}
          </div>
        )}

        {/* Display Name */}
        {isLoading ? (
          <ShortCopySkeletonLoader />
        ) : (
          <span
            className={classNames(
              "text-lg font-bold transition-colors duration-200",
              isSelected
                ? "text-gray-900"
                : "text-gray-800 group-hover:text-gray-900",
            )}>
            {displayAddress ?? t("messages.convos_empty_recipient_placeholder")}
          </span>
        )}

        {/* Message Preview */}
        {isLoading ? (
          <ShortCopySkeletonLoader />
        ) : (
          <span
            className={classNames(
              "text-sm line-clamp-1 w-full break-all transition-colors duration-200 mt-1",
              isSelected
                ? "text-gray-700"
                : "text-gray-600 group-hover:text-gray-700",
            )}
            data-testid="message-preview-text">
            {text}
          </span>
        )}
      </div>

      {/* Right Section - Time/Status */}
      <div className="flex flex-col items-end space-y-2 relative z-10">
        {!isLoading && datetime && (
          <span className="text-xs text-gray-500 font-medium">
            {new Date(datetime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}

        {/* Pin indicator */}
        {!isLoading && pinned && (
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
        )}
      </div>
    </div>
  );
};
