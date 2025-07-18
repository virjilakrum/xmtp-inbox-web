import { useTranslation, Trans } from "react-i18next";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Spinner } from "../Loaders/Spinner";
import { ctaStep, stepMapping } from "./stepMapping";
import { GhostButton } from "../GhostButton/GhostButton";
import { DisconnectIcon } from "../Icons/DisconnectIcon";
import { logoSvg as Logo } from "./logo";
import { PillButton } from "../PillButton/PillButton";
import {
  CreditCardIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/outline";

interface OnboardingStepProps {
  /**
   * What step in the process is this?
   */
  step: number;
  /**
   * Is the message content loading?
   */
  isLoading?: boolean;
  /**
   * What function should be run to connect to a wallet?
   */
  onConnect?: () => void;
  /**
   * What function should be run to create an XMTP identity?
   */
  onCreate?: () => void;
  /**
   * What function should be run to enable an XMTP identity?
   */
  onEnable?: () => void;
  /**
   * What function should be run to disconnect a wallet?
   */
  onDisconnect?: () => void;
}

export const OnboardingStep = ({
  step,
  isLoading,
  onConnect,
  onCreate,
  onEnable,
  onDisconnect,
}: OnboardingStepProps) => {
  const { t } = useTranslation();

  const stepInfo = isLoading
    ? stepMapping[step]?.loading
    : stepMapping[step]?.default;

  if (stepInfo) {
    const { header, subheader, cta, subtext, disconnect_tip } = stepInfo;

    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-20 w-64 h-64 gradient-primary opacity-20 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-80 h-80 gradient-secondary opacity-15 blur-3xl animate-pulse"
          style={{ borderRadius: "50%" }}></div>

        <div className="glass p-8 md:p-12 max-w-md w-full text-center shadow-modern animate-fade-in-scale">
          {/* Logo/Icon Section */}
          <div className="mb-8">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="gradient-primary w-24 h-24 flex items-center justify-center mx-auto rounded-2xl shadow-modern">
                  <Spinner />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-lg font-semibold text-gray-900">
                    {t("onboarding.connecting_header")}
                  </div>
                  <div className="text-sm text-gray-600 animate-pulse">
                    {t("onboarding.connecting_subheader")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {step === 1 ? (
                  <div className="gradient-primary w-20 h-20 flex items-center justify-center mx-auto mb-4 rounded-xl shadow-modern">
                    <CreditCardIcon className="w-10 h-10 text-white" />
                  </div>
                ) : (
                  <div className="gradient-secondary w-20 h-20 flex items-center justify-center mx-auto mb-4 rounded-xl shadow-modern">
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
                  </div>
                )}
                <div data-testid="xmtp-logo" className="scale-75 opacity-60">
                  <Logo />
                </div>
              </div>
            )}
          </div>

          {/* Step Progress */}
          {step > 1 && !isLoading && (
            <div className="mb-6">
              <div className="flex justify-center space-x-2 mb-3">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`w-3 h-3 transition-all duration-300 ${
                      s <= step - 1 ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {t("common.step_of_2", { NUM: step - 1 })}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-black bg-clip-text text-transparent mb-4"
                data-testid={
                  step === 1 ? "no-wallet-connected-header" : undefined
                }>
                {t(header)}
              </h1>
              <p
                className="text-lg text-gray-600 leading-relaxed"
                data-testid={
                  step === 1 ? "no-wallet-connected-subheader" : undefined
                }>
                <Trans i18nKey={subheader ?? ""} />
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {cta === ctaStep.ENABLE ? (
                <PillButton
                  label={t("onboarding.enable_button")}
                  onClick={onEnable}
                  testId="enable-xmtp-identity-cta"
                />
              ) : cta === ctaStep.CREATE ? (
                <PillButton
                  label={t("onboarding.create_button")}
                  onClick={onCreate}
                  testId="create-xmtp-identity-cta"
                />
              ) : cta === ctaStep.CONNECT ? (
                <div data-testid="no-wallet-connected-cta">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button
                        onClick={openConnectModal}
                        className="w-full gradient-primary text-white px-8 py-4 font-semibold shadow-elegant hover:shadow-modern transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 group"
                        data-testid="no-wallet-connected-cta">
                        <CreditCardIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {t("onboarding.intro_button")}
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              ) : null}

              {/* Disconnect Button */}
              {step > 1 && (
                <GhostButton
                  onClick={onDisconnect}
                  label={t("common.disconnect")}
                  variant="secondary"
                  icon={<DisconnectIcon />}
                />
              )}
            </div>

            {/* Additional Info */}
            {subtext && (
              <p
                className="text-sm text-gray-500 font-medium"
                data-testid={
                  step === 1 ? "no-wallet-connected-subtext" : undefined
                }>
                {t(subtext)}
              </p>
            )}

            {/* Features Preview for Step 1 */}
            {step === 1 && !isLoading && (
              <div className="mt-8 p-4 bg-gray-50 border border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <ShieldCheckIcon className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Secure</p>
                  </div>
                  <div className="text-center">
                    <SparklesIcon className="w-6 h-6 text-gray-800 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Private</p>
                  </div>
                  <div className="text-center">
                    <CreditCardIcon className="w-6 h-6 text-gray-900 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Decentralized</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disconnect Tip */}
        {disconnect_tip && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200">
            <p
              className="text-sm text-gray-700"
              data-testid={step === 1 ? "disconnect_tip" : undefined}>
              <Trans>{t(disconnect_tip)}</Trans>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by zkλ Protocol</p>
        </div>
      </div>
    );
  }
  return null;
};
