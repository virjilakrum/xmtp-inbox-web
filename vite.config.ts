import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pluginRewriteAll from "vite-plugin-rewrite-all";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pluginRewriteAll()],
  optimizeDeps: {
    exclude: [
      "@xmtp/user-preferences-bindings-wasm",
      "@xmtp/browser-sdk",
      "@xmtp/browser-sdk/workers/client",
    ],
    include: [
      "@xmtp/content-type-text",
      "@xmtp/content-type-reply",
      "@xmtp/content-type-reaction",
      "@xmtp/content-type-remote-attachment",
      "@xmtp/content-type-primitives",
    ],
  },
  worker: {
    format: "es",
  },
  define: {
    global: "globalThis",
  },
  build: {
    target: "es2020",
    rollupOptions: {
      external: (id) => {
        return id.includes("@xmtp/browser-sdk/workers/client");
      },
    },
  },
  resolve: {
    alias: {
      "protobufjs/minimal": "protobufjs/minimal.js",
    },
  },
  esbuild: {
    target: "es2020",
  },
  server: {
    fs: {
      allow: [".", "../node_modules"],
    },
  },
  ssr: {
    noExternal: ["protobufjs"],
  },
});
