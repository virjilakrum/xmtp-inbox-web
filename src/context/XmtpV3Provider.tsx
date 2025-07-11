import React, { createContext, useContext, ReactNode } from "react";
import { Client } from "@xmtp/browser-sdk";
import useInitXmtpClientV3 from "../hooks/useInitXmtpClientV3";

interface XmtpV3ContextType {
  client: Client | null;
  isLoading: boolean;
  status: "new" | "created" | "enabled" | undefined;
  disconnect: () => void;
  initializeXmtpClient: () => Promise<void>;
  isAddressInitialized: boolean;
  canInitialize: boolean;
  // Error handling
  error: Error | null;
  isInstallationLimitError: boolean;
  handleInstallationLimitRecovery: () => Promise<void>;
  clearLocalData: (() => void) | undefined;
}

const XmtpV3Context = createContext<XmtpV3ContextType | null>(null);

interface XmtpV3ProviderProps {
  children: ReactNode;
}

export const XmtpV3Provider: React.FC<XmtpV3ProviderProps> = ({ children }) => {
  const {
    client,
    isLoading,
    status,
    disconnect,
    initializeXmtpClient,
    isAddressInitialized,
    canInitialize,
    error,
    isInstallationLimitError,
    handleInstallationLimitRecovery,
    clearLocalData,
  } = useInitXmtpClientV3();

  const value: XmtpV3ContextType = {
    client,
    isLoading,
    status,
    disconnect,
    initializeXmtpClient,
    isAddressInitialized,
    canInitialize,
    error,
    isInstallationLimitError,
    handleInstallationLimitRecovery,
    clearLocalData,
  };

  return (
    <XmtpV3Context.Provider value={value}>{children}</XmtpV3Context.Provider>
  );
};

export const useXmtpV3Context = () => {
  const context = useContext(XmtpV3Context);
  if (!context) {
    throw new Error("useXmtpV3Context must be used within XmtpV3Provider");
  }
  return context;
};

export default XmtpV3Provider;
