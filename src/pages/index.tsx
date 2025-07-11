import { useEffect } from "react";
import { useConnect, useConnectors } from "wagmi";
import { useClient } from "../hooks/useV3Hooks";
import { useXmtpV3Context } from "../context/XmtpV3Provider";
import { OnboardingPage } from "../component-library/pages/OnboardingPage/OnboardingPage";
import ErrorBoundary from "../component-library/components/ErrorBoundary/ErrorBoundary";
import InboxPage from "./inbox";

const Index = () => {
  const client = useClient();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const {
    isLoading,
    initializeXmtpClient,
    isAddressInitialized,
    canInitialize,
    status,
    error,
    isInstallationLimitError,
    handleInstallationLimitRecovery,
    clearLocalData,
  } = useXmtpV3Context();

  useEffect(() => {
    console.log("Index - Debug state:", {
      client: client ? "Client exists" : "Client is null",
      isLoading,
      isAddressInitialized,
      canInitialize,
      status,
      error: error?.message,
      isInstallationLimitError,
    });
  }, [
    client,
    isLoading,
    isAddressInitialized,
    canInitialize,
    status,
    error,
    isInstallationLimitError,
  ]);

  // Determine onboarding step
  const getOnboardingStep = () => {
    if (!canInitialize && !client) {
      return 1; // Need to connect wallet
    }
    if (canInitialize && !client) {
      return isAddressInitialized ? 2 : 2; // Can initialize XMTP
    }
    return 3; // Client ready
  };

  const handleConnect = async () => {
    try {
      console.log("Index - Connecting wallet...");
      // Connect to the first available connector
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleCreateOrEnable = async () => {
    try {
      console.log("Index - Initializing XMTP client...");
      await initializeXmtpClient();
    } catch (error) {
      console.error("Failed to initialize XMTP client:", error);
    }
  };

  const handleRetry = async () => {
    try {
      console.log("Index - Retrying initialization...");
      await initializeXmtpClient();
    } catch (error) {
      console.error("Failed to retry initialization:", error);
    }
  };

  const handleClearData = async () => {
    try {
      console.log("Index - Clearing local data...");
      await handleInstallationLimitRecovery();
    } catch (error) {
      console.error("Failed to clear local data:", error);
    }
  };

  // Show error boundary for installation limit errors
  if (error && isInstallationLimitError) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={handleRetry}
        onClearData={handleClearData}
        className="p-6 max-w-2xl mx-auto mt-8"
      />
    );
  }

  if (!client) {
    const step = getOnboardingStep();
    return (
      <OnboardingPage
        step={step}
        isLoading={isLoading}
        onConnect={handleConnect}
        onCreate={handleCreateOrEnable}
        onEnable={handleCreateOrEnable}
        onDisconnect={() => {
          console.log("Disconnect requested");
          // Handle disconnect
        }}
      />
    );
  }

  return <InboxPage />;
};

export default Index;
