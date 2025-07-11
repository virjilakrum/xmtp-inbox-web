import { create } from "zustand";
import { CachedMessageWithId } from "../types/xmtpV3Types";

export type ActiveTab =
  | "inbox"
  | "messages"
  | "settings"
  | "requests"
  | "blocked";

export type RecipientState = "loading" | "valid" | "invalid" | "error";

interface XmtpStore {
  conversationTopic: string;
  setConversationTopic: (topic: string) => void;
  recipientWalletAddress: string;
  setRecipientWalletAddress: (address: string) => void;
  recipientInput: string;
  setRecipientInput: (input: string) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  recipientName: string;
  setRecipientName: (name: string) => void;
  recipientAvatar: string;
  setRecipientAvatar: (avatar: string) => void;
  recipientOnNetwork: boolean;
  setRecipientOnNetwork: (onNetwork: boolean) => void;
  recipientInputMode: "input" | "scan";
  setRecipientInputMode: (mode: "input" | "scan") => void;
  recipientState: RecipientState;
  setRecipientState: (state: RecipientState) => void;
  loadingConversations: boolean;
  setLoadingConversations: (loading: boolean) => void;
  consentState: "unknown" | "allowed" | "denied";
  setConsentState: (state: "unknown" | "allowed" | "denied") => void;
  previewMessage: CachedMessageWithId | null;
  setPreviewMessage: (message: CachedMessageWithId | null) => void;

  // Added missing properties
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeMessage: CachedMessageWithId | null;
  setActiveMessage: (message: CachedMessageWithId | null) => void;
  startedFirstMessage: boolean;
  setStartedFirstMessage: (started: boolean) => void;
  clientName: string;
  setClientName: (name: string) => void;
  clientAvatar: string;
  setClientAvatar: (avatar: string) => void;
  attachmentError: string | null;
  setAttachmentError: (error: string | null) => void;

  // Utility functions
  resetRecipient: () => void;
  resetXmtpState: () => void;
}

export const useXmtpStore = create<XmtpStore>((set) => ({
  conversationTopic: "",
  setConversationTopic: (topic) => set({ conversationTopic: topic }),
  recipientWalletAddress: "",
  setRecipientWalletAddress: (address) =>
    set({ recipientWalletAddress: address }),
  recipientInput: "",
  setRecipientInput: (input) => set({ recipientInput: input }),
  recipientAddress: "",
  setRecipientAddress: (address) => set({ recipientAddress: address }),
  recipientName: "",
  setRecipientName: (name) => set({ recipientName: name }),
  recipientAvatar: "",
  setRecipientAvatar: (avatar) => set({ recipientAvatar: avatar }),
  recipientOnNetwork: false,
  setRecipientOnNetwork: (onNetwork) => set({ recipientOnNetwork: onNetwork }),
  recipientInputMode: "input",
  setRecipientInputMode: (mode) => set({ recipientInputMode: mode }),
  recipientState: "loading",
  setRecipientState: (state) => set({ recipientState: state }),
  loadingConversations: false,
  setLoadingConversations: (loading) => set({ loadingConversations: loading }),
  consentState: "unknown",
  setConsentState: (state) => set({ consentState: state }),
  previewMessage: null,
  setPreviewMessage: (message) => set({ previewMessage: message }),

  // Added missing properties
  activeTab: "messages",
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeMessage: null,
  setActiveMessage: (message) => set({ activeMessage: message }),
  startedFirstMessage: false,
  setStartedFirstMessage: (started) => set({ startedFirstMessage: started }),
  clientName: "",
  setClientName: (name) => set({ clientName: name }),
  clientAvatar: "",
  setClientAvatar: (avatar) => set({ clientAvatar: avatar }),
  attachmentError: null,
  setAttachmentError: (error) => set({ attachmentError: error }),

  // Utility functions
  resetRecipient: () =>
    set({
      recipientWalletAddress: "",
      recipientInput: "",
      recipientAddress: "",
      recipientName: "",
      recipientAvatar: "",
      recipientOnNetwork: false,
      recipientInputMode: "input",
      recipientState: "loading",
    }),
  resetXmtpState: () =>
    set({
      conversationTopic: "",
      recipientWalletAddress: "",
      recipientInput: "",
      recipientAddress: "",
      recipientName: "",
      recipientAvatar: "",
      recipientOnNetwork: false,
      recipientInputMode: "input",
      recipientState: "loading",
      loadingConversations: false,
      consentState: "unknown",
      previewMessage: null,
      activeTab: "messages",
      activeMessage: null,
      startedFirstMessage: false,
      attachmentError: null,
    }),
}));
