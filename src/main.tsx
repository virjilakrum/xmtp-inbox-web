import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import AppController from "./controllers/AppController";
import { ToastProvider } from "./component-library/components/Toast/Toast";
import { ErrorBoundary } from "./component-library/components/ErrorBoundary/ErrorBoundary";
import { XmtpV3Provider } from "./context/XmtpV3Provider";
import { ThemeProvider } from "./context/ThemeProvider";
import { getWagmiConfig } from "./helpers/config";
import "./globals.css";

const queryClient = new QueryClient();
const config = getWagmiConfig() as any; // Type assertion to fix compatibility issue

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Application error:", error, errorInfo);
        // You can add error reporting here
      }}
      maxRetries={3}
      resetOnPropsChange={true}>
      <ThemeProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <XmtpV3Provider>
                <ToastProvider position="top-right" maxToasts={5}>
                  <AppController />
                </ToastProvider>
              </XmtpV3Provider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
