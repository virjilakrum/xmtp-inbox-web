import { Dialog, Transition } from "@headlessui/react";
import type React from "react";
import { Fragment, useEffect, useState } from "react";
import {
  ChatAlt2Icon,
  CheckCircleIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/solid";
import { ClipboardCopyIcon, XIcon } from "@heroicons/react/outline";
import { useTranslation } from "react-i18next";
import { QRCode } from "react-qrcode-logo";
import type { ETHAddress } from "../../../helpers";
import { classNames, isAppEnvDemo, shortAddress } from "../../../helpers";
import { XmtpIcon } from "../Icons/XmtpIcon";
import { Avatar } from "../Avatar/Avatar";
import { GhostButton } from "../GhostButton/GhostButton";
import { DisconnectIcon } from "../Icons/DisconnectIcon";
import i18next, { supportedLocales } from "../../../helpers/i18n";

interface SideNavProps {
  /**
   * Contents inside side nav
   */
  icon?: React.ReactNode;
  /**
   * What is the display address?
   */
  displayAddress?: string;
  /**
   * What is the wallet address?
   */
  walletAddress?: ETHAddress;
  /**
   * What is the avatarUrl?
   */
  avatarUrl?: string;
  /**
   * What should happen when disconnect is clicked?
   */
  onDisconnect?: () => void;
}

type Lang = {
  displayText: string | undefined;
  isSelected: boolean;
  lang: string;
};

const SideNav = ({
  icon = <XmtpIcon />,
  displayAddress,
  walletAddress,
  avatarUrl,
  onDisconnect,
}: SideNavProps) => {
  const [mappedLangs, setMappedLangs] = useState<Lang[]>([]);
  // When language changes, change the modal text to render the corresponding locale selector within that language
  useEffect(() => {
    const langs = supportedLocales.map((locale: string) => {
      const lang = locale?.split("-")?.[0] || "en";
      const languageNames = new Intl.DisplayNames([i18next.language], {
        type: "language",
      });

      return {
        displayText: languageNames.of(lang),
        isSelected: i18next.language === lang,
        lang,
      };
    });
    setMappedLangs(langs);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false);

  const onSideNavBtnClick = (key: string) => {
    if (key === t("menu.collapse_header")) setIsOpen(!isOpen);
  };

  const onXmtpIconClick = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const icons = [
    <ChatAlt2Icon
      key={t("menu.messages_header")}
      width={24}
      className={isOpen ? "mr-4" : ""}
      data-testid="messages-icon"
    />,
    <ChevronDoubleRightIcon
      key={t("menu.collapse_header")}
      width={24}
      className={isOpen ? "mr-4 rotate-180" : ""}
      data-testid="collapse-icon"
    />,
  ];
  const [currentIcon, setCurrentIcon] = useState(icons[0].key);

  const mappedButtons = icons.map((icn) => {
    const isActive =
      currentIcon === icn.key || (!currentIcon && icons[1].key === icn.key);

    return (
      <div className="group flex relative w-full" key={icn.key}>
        <button
          type="button"
          onClick={(event) => {
            setCurrentIcon((event.target as HTMLElement).innerText);
            onSideNavBtnClick(icn.key as string);
          }}
          aria-label={icn.key as string}
          className={classNames(
            "nav-item",
            "transition-all duration-200 ease-out",
            "p-4 rounded-2xl w-full flex items-center",
            "transform hover:scale-105 active:scale-95",
            "group relative overflow-hidden",
            isActive
              ? "nav-item-active text-gray-900 shadow-elegant"
              : "text-gray-600 hover:text-gray-900",
            isOpen ? "justify-start space-x-4" : "justify-center",
          )}>
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-700 to-gray-900 rounded-r-lg" />
          )}

          {/* Icon container */}
          <div
            className={classNames(
              "transition-transform duration-200",
              "flex items-center justify-center",
              isActive ? "scale-110" : "group-hover:scale-110",
            )}>
            {icn}
          </div>

          {/* Label */}
          {isOpen && (
            <span
              data-testid={icn.key}
              className={classNames(
                "font-semibold transition-all duration-200",
                "group-hover:translate-x-1",
                isActive ? "text-gray-900" : "",
              )}>
              {icn.key}
            </span>
          )}

          {/* Hover background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 -skew-x-12" />
        </button>
      </div>
    );
  });

  return (
    <div
      className={classNames(
        "flex",
        "flex-col",
        "justify-between",
        "items-center",
        "h-screen",
        "bg-gradient-to-b from-white via-gray-50 to-white",
        "backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        isOpen ? "px-6" : "px-4",
        "border-r-2",
        "border-gray-200/50",
        "shadow-elegant",
        !isOpen
          ? "w-[80px]"
          : "absolute w-[85vw] lg:w-[280px] lg:relative z-50",
      )}>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex flex-col items-start space-y-6 w-full relative z-50">
        <div className="py-6 flex w-full">
          <div className="w-full">
            {/* User Profile Section */}
            <div
              className={classNames(
                "flex mb-8 items-center transition-all duration-300",
                isOpen ? "space-x-4" : "justify-center",
              )}>
              <div className="relative">
                <Avatar url={avatarUrl} address={walletAddress} />
                {/* Online Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />
              </div>

              {isOpen && (
                <div className="flex flex-col animate-fade-in-scale">
                  <div className="flex flex-col justify-center">
                    <span
                      className="font-bold text-gray-900 text-lg leading-tight"
                      data-testid="wallet-address">
                      {displayAddress ? shortAddress(displayAddress) : ""}
                    </span>
                    {walletAddress && displayAddress !== walletAddress && (
                      <button
                        type="button"
                        className="text-sm text-gray-500 hover:text-gray-700 font-mono bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 text-left mt-1"
                        onClick={() => {
                          void navigator.clipboard.writeText(walletAddress);
                        }}
                        title="Click to copy full address">
                        {shortAddress(walletAddress)}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col items-start space-y-3">
              {mappedButtons}
            </div>
          </div>
        </div>
      </div>
      {/* Footer Section */}
      <div className="flex flex-col items-center w-full pb-6 space-y-4">
        {/* Settings/Language Button */}
        <div
          role="button"
          onClick={onXmtpIconClick}
          onKeyDown={onXmtpIconClick}
          tabIndex={0}
          className={classNames(
            "cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 p-3 rounded-2xl hover:bg-gray-100 group",
            isOpen ? "self-start" : "self-center",
          )}
          data-testid="icon">
          <div className="transform transition-transform duration-200 group-hover:rotate-12">
            {icon}
          </div>
        </div>

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 group lg:hidden"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}>
          <ChevronDoubleRightIcon
            className={classNames(
              "w-5 h-5 text-gray-600 transition-transform duration-300",
              isOpen ? "rotate-180" : "",
            )}
          />
        </button>

        {/* App Branding */}
        {isOpen && (
          <div className="text-center animate-fade-in-scale">
            <p className="text-xs text-gray-500 font-medium">Powered by</p>
            <p className="text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              zkλ Protocol
            </p>
          </div>
        )}
      </div>
      <Transition.Root show={isQrCodeDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          onClose={onXmtpIconClick}
          aria-label={t("menu.settings") || ""}>
          <div
            data-testid="share-qr-modal"
            className="bg-[#ffffffa3] w-[100vw] h-[100vh] flex items-center justify-center absolute top-0 z-20">
            <div className="bg-[url('/shareQrBg.png')] bg-repeat-round m-4 lg:w-[35%] sm:w-[90%] md:w-[50%] h-[90vh] text-white flex flex-col items-center p-4 rounded-3xl drop-shadow-lg">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsQrCodeDialogOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsQrCodeDialogOpen(false);
                  }
                }}
                className="w-[100%] flex justify-end cursor-pointer mb-20">
                <XIcon width={24} />
              </div>
              <div className="h-8">
                <img className="h-[100%]" alt="zkλ-logo" src="/xmtp-logo.png" />
              </div>
              <div className="text-center p-4 pb-6">
                {t("common.share_code")}
              </div>
              <div className="p-4 flex items-center justify-center rounded-3xl bg-white">
                <QRCode
                  size={200}
                  logoImage="/xmtp-icon.png"
                  removeQrCodeBehindLogo
                  logoPadding={10}
                  value={`${window.location.origin}/dm/${walletAddress ?? ""}`}
                />
              </div>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void navigator.clipboard.writeText(
                      `${window.location.origin}/dm/${walletAddress ?? ""}`,
                    );
                  }
                }}
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${window.location.origin}/dm/${walletAddress ?? ""}`,
                  );
                }}
                className="flex text-sm mt-5 cursor-pointer">
                <span data-testid="share-qr-link" className="underline">
                  {t("common.share_link")}
                </span>
                <ClipboardCopyIcon className="ml-2" width={16} />
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <Transition.Root show={isDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          onClose={onXmtpIconClick}
          aria-label={t("menu.settings") || ""}>
          <div className="bg-gray-50 w-fit rounded-lg absolute bottom-16 left-12 p-2 z-50">
            <div className="max-h-80 overflow-auto">
              {mappedLangs.map(({ displayText, isSelected, lang }) => (
                <div className="flex p-2 justify-between" key={lang}>
                  <button
                    type="button"
                    onClick={() => {
                      void i18next.changeLanguage(lang);
                      onXmtpIconClick();
                    }}
                    className={classNames(
                      "text-sm",
                      isSelected ? "font-bold" : "",
                    )}>
                    {displayText}
                  </button>
                  {isSelected && (
                    <CheckCircleIcon
                      width="16"
                      fill="limegreen"
                      className="ml-4"
                    />
                  )}
                </div>
              ))}
            </div>
            <hr className="m-2" />
            {!isAppEnvDemo() && (
              <>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setIsQrCodeDialogOpen(true);
                    setIsDialogOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsQrCodeDialogOpen(true);
                      setIsDialogOpen(false);
                    }
                  }}
                  data-testid="share-qr"
                  className="text-sm ml-2 cursor-pointer text-gray-600 hover:text-gray-800">
                  {t("common.share_qr_code")}
                </span>
                <hr className="m-2" />
              </>
            )}

            <span className="text-sm ml-2 text-red-600 hover:text-red-800">
              <a
                href="https://github.com/xmtp-labs/xmtp-inbox-web/issues/new?assignees=&labels=bug&template=bug_report.yml&title=Bug%3A+"
                target="_blank"
                rel="noreferrer">
                {t("common.report_bug")}
              </a>
            </span>
            <hr className="m-2" />
            <GhostButton
              onClick={onDisconnect}
              label={t("common.disconnect")}
              variant="secondary"
              size="small"
              testId="disconnect-wallet-cta"
              icon={<DisconnectIcon />}
            />
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default SideNav;
