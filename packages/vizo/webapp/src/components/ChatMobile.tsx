import classNames from "classnames";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { ReactComponent as HistoryIcon } from "../assets/history.svg";

import { ReactComponent as CameraSimpleIcon } from "../assets/camera_simple.svg";
import { ReactComponent as ArrowEnter } from "../assets/arrow_enter.svg";

import { Chat as ChatType, MessageType } from "../types";
import ChatHistory from "./ChatHistory";

interface Props {
  imageThumb: any;
  ocrList?: string[];
  vizoLoading: boolean;
  onUserQuery: (text: string) => void;
  chatHistory: ChatType[];
  filters: string[];
  showNewResultButton: boolean;
  showRefinedResult: any;
  imageSearch: any;
  setIsCameraOpen: any;
  setSelectedPreFilters: any;
  selectedPreFilters: any;
  notification: boolean;
  setNotification: any;
  vizoLoadingMessage: string;
}

const ChatMobile: React.FC<Props> = ({
  imageThumb,
  ocrList,
  vizoLoading,
  onUserQuery,
  chatHistory,
  showNewResultButton,
  showRefinedResult,
  imageSearch,
  setIsCameraOpen,
  setSelectedPreFilters,
  selectedPreFilters,
  notification,
  setNotification,
  vizoLoadingMessage,
}) => {
  const lastChatRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

  const [userQuery, setUserQuery] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [showChat, setShowChat] = useState(false);

  // const showDisclaimerDisabled = useMemo(() => {
  //   const disclaimer = localStorage.getItem("upload-disclaimer");

  //   if (!disclaimer) return false;
  //   return disclaimer === "dont-show";
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [showDisclaimer]);

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      onUserQuery(userQuery);
      setUserQuery("");
      // Perform any additional actions here
    }
  };

  const userQueryCount = useMemo(() => {
    return chatHistory.reduce((count, item) => {
      if (item.type === MessageType.USER) {
        console.log({ item });

        return count + 1;
      }
      return count;
    }, 0);
  }, [chatHistory]);

  useEffect(() => {
    if (vizoLoading) {
      setShowChat(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classNames(["fixed", "bottom-8", "w-full"])}>
      {showChat && (
        <div className={classNames(["px-2"])}>
          <div className={classNames(["rounded-[21px]", "w-full", "bg-white"])}>
            <div className="w-full rounded-[21px] shadow-outer max-h-[292px] overflow-y-auto">
              <ChatHistory
                lastChatRef={lastChatRef}
                chatHistory={chatHistory}
                imageThumb={imageThumb}
                containerRef={containerRef}
                showRefinedResult={showRefinedResult}
                showNewResultButton={showNewResultButton}
                vizoLoading={vizoLoading}
                vizoLoadingMessage={vizoLoadingMessage}
                imageSearch={imageSearch}
                ocrList={ocrList}
                setShowDisclaimer={setShowDisclaimer}
                showDisclaimer={showDisclaimer}
                setNotification={setNotification}
                setShowChat={setShowChat}
                userQueryCount={userQueryCount}
              />
            </div>
          </div>
        </div>
      )}
      {!showChat && (
        <div
          className={classNames([
            "flex",
            "justify-center",
            "items-center",
            "w-10",
            "h-10",
            "bg-[#2B2C46]",
            "rounded-full",
            "mb-4",
            "self-end",
            "mr-2",
            "ml-auto",
            "cursor-pointer",
          ])}
          onClick={() => {
            setShowChat(true);
            setNotification(false);
          }}
        >
          <HistoryIcon className={classNames(["text-white"])} />
          {notification && (
            <div className="min-w-3 min-h-3 bg-primary rounded-full absolute border-2 border-white -top-0.5 right-2.5"></div>
          )}
        </div>
      )}

      <div className={classNames(["px-2", "mt-2"])}>
        <div
          className={classNames([
            "h-12",
            "rounded-3xl",
            "shadow-outer",
            "w-full",
            "bg-white",
            "px-2",
            "flex",
            "items-center",
            "justify-between",
          ])}
        >
          <div className="flex flex-1 gap-x-2">
            {/* <PreFilterMobile
              setPreFilters={(prefilters) => setSelectedPreFilters(prefilters)}
              selectedPreFilters={selectedPreFilters}
            /> */}
            <input
              placeholder="Message Vizo..."
              className="text-xs outline-none w-full pr-2"
              value={userQuery}
              disabled={userQueryCount > 3}
              onChange={(e) => {
                setUserQuery(e.target.value);
              }}
              onClick={() => {
                setShowChat(true);
                setNotification(false);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex gap-x-2">
            <div
              className={classNames([
                "w-8",
                "h-8",
                "rounded-3xl",
                "flex",
                "justify-center",
                "items-center",
                userQuery.length > 0 ? "bg-[#2B2C46]" : "bg-[#F3F3F5]",
                userQuery.length > 0 ? "cursor-pointer" : "cursor-default",
              ])}
              onClick={() => {
                if (userQuery?.length > 0) {
                  onUserQuery(userQuery);
                  setUserQuery("");
                }
              }}
            >
              <ArrowEnter className="text-white w-3.5 h-3.5" />
            </div>

            <div
              className={classNames([
                "w-8",
                "h-8",
                "rounded-3xl",
                "flex",
                "justify-center",
                "items-center",
                "bg-[#F3F3F5]",
                "cursor-pointer",
              ])}
              onClick={() => {
                setIsCameraOpen(true);
              }}
            >
              <CameraSimpleIcon className="text-[#3E36DC]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMobile;
