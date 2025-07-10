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
