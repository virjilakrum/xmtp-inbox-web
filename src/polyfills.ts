import { Buffer } from "buffer";

// Add Buffer to global scope
globalThis.Buffer = Buffer;

// Ensure global is defined
globalThis.global = globalThis.global ?? globalThis;

// workaround for https://github.com/coinbase/coinbase-wallet-sdk/issues/874
// TODO: remove when https://github.com/coinbase/coinbase-wallet-sdk/pull/940 is released (>3.7.1)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.process = { env: {} };

export {};
