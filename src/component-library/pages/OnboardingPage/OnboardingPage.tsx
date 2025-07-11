import { OnboardingStep } from "../../components/OnboardingStep/OnboardingStep";

interface OnboardingPageProps {
  step: number;
  isLoading?: boolean;
  onConnect?: () => void;
  onCreate?: () => void;
  onEnable?: () => void;
  onDisconnect?: () => void;
}

export const OnboardingPage = ({
  step = 1,
  isLoading = false,
  onConnect,
  onCreate,
  onEnable,
  onDisconnect,
}: OnboardingPageProps) => (
  // In the app, these props will come from page state
  <div className="bg-white w-full">
    <OnboardingStep
      step={step}
      isLoading={isLoading}
      onConnect={onConnect}
      onCreate={onCreate}
      onEnable={onEnable}
      onDisconnect={onDisconnect}
    />
  </div>
);
