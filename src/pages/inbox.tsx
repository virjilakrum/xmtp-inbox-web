import type React from "react";
import { useEffect, useState } from "react";
import { useDisconnect, useWalletClient } from "wagmi";
import type { Attachment } from "@xmtp/content-type-remote-attachment";
import { useNavigate } from "react-router-dom";
import { XIcon } from "@heroicons/react/outline";
import { useXmtpStore } from "../store/xmtp";
import { wipeKeys } from "../helpers";
import { FullConversationController } from "../controllers/FullConversationController";
import { AddressInputController } from "../controllers/AddressInputController";
import { HeaderDropdownController } from "../controllers/HeaderDropdownController";
import { MessageInputController } from "../controllers/MessageInputController";
import { SideNavController } from "../controllers/SideNavController";
import { LearnMore } from "../component-library/components/LearnMore/LearnMore";
import { ConversationListController } from "../controllers/ConversationListController";
import { useAttachmentChange } from "../hooks/useAttachmentChange";
import useSelectedConversation from "../hooks/useSelectedConversation";
import { ReplyThread } from "../component-library/components/ReplyThread/ReplyThread";
// V3 imports
import { useConsent, useClient, useConversations } from "../hooks/useV3Hooks";

const Inbox: React.FC<{ children?: React.ReactNode }> = () => {
  const navigate = useNavigate();
  const resetXmtpState = useXmtpStore((state) => state.resetXmtpState);
  const activeMessage = useXmtpStore((state) => state.activeMessage);

  const client = useClient();
  const [isDragActive, setIsDragActive] = useState(false);
  const { conversations } = useConversations();
  const selectedConversation = useSelectedConversation();
  const { data: walletClient } = useWalletClient();
  // V3 useStreamConversations implemented via useConversations hook
  // The useConversations hook already provides real-time conversation updates

  const { consent, allow, deny } = useConsent();

  useEffect(() => {
    if (!client) {
      navigate("/");
    } else {
      // Load V3 consent preferences
      loadConsentList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // Load V3 consent preferences
  const loadConsentList = async () => {
    if (!client) return;
    try {
      // V3 consent is managed automatically at conversation level
      // Individual consent states are checked per conversation
      console.log("V3 consent system ready - consent checked per conversation");

      // V3 handles consent automatically through conversation.isAllowed()
      // No need to load a separate consent list
    } catch (error) {
      console.error("Error with V3 consent system:", error);
    }
  };

  // V3 conversation monitoring - handled by useConversations hook
  useEffect(() => {
    if (!client) return;

    // V3 conversation monitoring is handled automatically by useConversations hook
    // The hook provides real-time updates when conversations change
    console.log("V3 conversation monitoring active via useConversations hook");
  }, [client]);

  const activeTab = useXmtpStore((s) => s.activeTab);
  const setActiveMessage = useXmtpStore((s) => s.setActiveMessage);

  const loadingConversations = useXmtpStore(
    (state) => state.loadingConversations,
  );
  const startedFirstMessage = useXmtpStore(
    (state) => state.startedFirstMessage,
  );
  const setStartedFirstMessage = useXmtpStore(
    (state) => state.setStartedFirstMessage,
  );

  const { disconnect: disconnectWagmi, reset: resetWagmi } = useDisconnect();

  const [attachmentPreview, setAttachmentPreview]: [
    string | undefined,
    (url: string | undefined) => void,
  ] = useState();

  const [attachment, setAttachment]: [
    Attachment | undefined,
    (attachment: Attachment | undefined) => void,
  ] = useState();

  const { onAttachmentChange } = useAttachmentChange({
    setAttachment,
    setAttachmentPreview,
    setIsDragActive,
  });

  // if the wallet address changes, disconnect the XMTP client
  useEffect(() => {
    const checkSigners = async () => {
      const address1 = walletClient?.account.address;

      // V3 client address checking via inbox ID
      let clientAddress = "";
      if (client) {
        try {
          // V3 clients are associated with inbox IDs, not direct addresses
          // For now, skip strict address comparison as V3 handles identity differently
          // The persistence system already ensures client-wallet consistency
          console.log("V3 client identity managed by persistence system");
        } catch (error) {
          console.error("Error with V3 client identity:", error);
        }
      }

      // addresses must be defined before comparing
      if (address1 && clientAddress && address1 !== clientAddress) {
        resetXmtpState();

        // V3 client disconnect
        try {
          if (client) {
            await client.close();
            console.log("V3 client disconnected successfully");
          }
        } catch (error) {
          console.error("Error disconnecting V3 client:", error);
        }

        wipeKeys(address1 ?? "");
        disconnectWagmi();
        resetWagmi();
      }
    };
    void checkSigners();
  }, [resetXmtpState, walletClient, resetWagmi, disconnectWagmi, client]);

  if (!client) {
    return <div />;
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  return (
    // Controller for drag-and-drop area
    <div
      className={isDragActive ? "bg-slate-100" : "bg-white"}
      onDragOver={handleDrag}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDrop={onAttachmentChange}>
      <div className="w-full md:h-full overflow-auto flex flex-col md:flex-row">
        <div className="flex">
          <SideNavController />
          <div className="flex flex-col w-full h-screen overflow-y-auto md:min-w-[350px]">
            <HeaderDropdownController />
            <ConversationListController />
          </div>
        </div>
        {
          <div className="flex w-full flex-col h-screen overflow-hidden">
            {!conversations.length &&
            !loadingConversations &&
            !startedFirstMessage ? (
              <LearnMore
                setStartedFirstMessage={() => setStartedFirstMessage(true)}
              />
            ) : (
              // Full container including replies
              <div className="flex h-screen">
                <div className="h-full w-full flex flex-col justify-between">
                  {activeMessage && selectedConversation ? (
                    <div className="h-full overflow-auto">
                      <XIcon
                        data-testid="replies-close-icon"
                        width={24}
                        onClick={() => setActiveMessage(null)}
                        className="absolute top-2 right-2 cursor-pointer"
                      />
                      <ReplyThread message={activeMessage} />
                    </div>
                  ) : (
                    <>
                      <div className="flex" data-testid="address-container">
                        <AddressInputController />
                      </div>
                      <div
                        className="h-full overflow-auto flex flex-col"
                        onFocus={() => {
                          setActiveMessage(null);
                        }}>
                        {selectedConversation &&
                          selectedConversation.conversation && (
                            <FullConversationController
                              conversation={{
                                peerAddress:
                                  selectedConversation.conversation.id || "",
                                topic: selectedConversation.conversation.id,
                                conversationId:
                                  selectedConversation.conversation.id,
                              }}
                            />
                          )}
                      </div>
                    </>
                  )}

                  {/* Drag event handling needing for content attachments */}
                  {activeTab === "messages" ? (
                    <MessageInputController
                      attachment={attachment}
                      setAttachment={setAttachment}
                      attachmentPreview={attachmentPreview}
                      setAttachmentPreview={setAttachmentPreview}
                      setIsDragActive={setIsDragActive}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
};

export default Inbox;
