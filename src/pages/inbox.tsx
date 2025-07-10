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
  // TODO: Implement useStreamConversations for V3

  const { consent, allow, deny } = useConsent();

  useEffect(() => {
    if (!client) {
      navigate("/");
    } else {
      // TODO: Implement consent loading for V3
      console.log("V3 TODO: Load consent list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const checkSigners = () => {
      const address1 = walletClient?.account.address;
      // TODO: Implement V3 client address checking
      const address2 = ""; // V3 client doesn't have address property
      // addresses must be defined before comparing
      if (address1 && address2 && address1 !== address2) {
        resetXmtpState();
        // TODO: Implement V3 client disconnect
        wipeKeys(address1 ?? "");
        disconnectWagmi();
        resetWagmi();
      }
    };
    void checkSigners();
  }, [resetXmtpState, walletClient, resetWagmi, disconnectWagmi]);

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
