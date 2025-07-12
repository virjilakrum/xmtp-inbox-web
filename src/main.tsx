import "./polyfills";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// V3 imports
import {
  ContentTypeScreenEffect,
  ScreenEffectCodec,
} from "@xmtp/experimental-content-type-screen-effect";
import App from "./controllers/AppController";
import { getWagmiConfig } from "./helpers/config";
import { XmtpV3Provider } from "./context/XmtpV3Provider";

// Content type configurations for V3
export const ScreenEffectCodecInstance = new ScreenEffectCodec();

const queryClient = new QueryClient();

// Production log filtering for XMTP MLS logs
if (process.env.NODE_ENV === "production") {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  // Filter out XMTP MLS sync logs that are too verbose
  const isXmtpMlsLog = (message: string) => {
    return (
      typeof message === "string" &&
      (message.includes("xmtp_mls::groups::mls_sync") ||
        message.includes("sync_until_last_intent_resolved") ||
        message.includes("sync_with_conn") ||
        message.includes("envelope cursor") ||
        message.includes("calling update cursor for group") ||
        message.includes(
          "Transaction completed successfully: process for group",
        ))
    );
  };

  // Override console.info to filter XMTP logs
  console.info = (...args) => {
    if (args.some((arg) => isXmtpMlsLog(String(arg)))) {
      return; // Suppress verbose XMTP MLS logs
    }
    originalConsole.info(...args);
  };

  // Override console.log to filter XMTP logs
  console.log = (...args) => {
    if (args.some((arg) => isXmtpMlsLog(String(arg)))) {
      return; // Suppress verbose XMTP MLS logs
    }
    originalConsole.log(...args);
  };

  // Keep warnings and errors as they are important
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <WagmiProvider config={getWagmiConfig()}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <StrictMode>
          <XmtpV3Provider>
            <App />
          </XmtpV3Provider>
        </StrictMode>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
);
