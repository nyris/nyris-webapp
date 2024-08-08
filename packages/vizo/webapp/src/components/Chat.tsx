import classNames from "classnames";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { makeFileHandler } from "@nyris/nyris-react-components";

import { ReactComponent as EnterIcon } from "../assets/enter.svg";
import { ReactComponent as CameraIcon } from "../assets/camera.svg";

import { Chat as ChatType, MessageType } from "../types";
import ChatHistory from "./ChatHistory";
import { ReactComponent as ArrowEnter } from "../assets/arrow_enter.svg";

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
  vizoLoadingMessage: string;
}

const Chat: React.FC<Props> = ({
  imageThumb,
  ocrList,
  vizoLoading,
  onUserQuery,
  chatHistory,
  filters,
  showNewResultButton,
  showRefinedResult,
  imageSearch,
  vizoLoadingMessage,
}) => {
  const [userQuery, setUserQuery] = useState("");

  const lastChatRef = useRef<any>(null);

  const containerRef = useRef<any>(null);

  const scrollToLastMessage = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // const scrollToLastMessage = () => {
  //   lastChatRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

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
    if (lastChatRef.current) {
      if (chatHistory.length > 2) {
        scrollToLastMessage();
      }
    }
  }, [chatHistory]);

  const handleKeyDown = (event: { key: string }) => {
    if (userQuery.length > 0 && !vizoLoading) {
      if (event.key === "Enter") {
        onUserQuery(userQuery);
        setUserQuery("");
        // Perform any additional actions here
      }
    }
  };

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const showDisclaimerDisabled = useMemo(() => {
    const disclaimer = localStorage.getItem("upload-disclaimer");

    if (!disclaimer) return false;
    return disclaimer === "dont-show";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisclaimer]);

  return (
    <div className="w-full h-fit shadow-outer mt-4">
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
        userQueryCount={userQueryCount}
      />

      <div className="w-full relative border-t border-[#E0E0E0] h-12 bg-[#FAFAFA]">
        <EnterIcon className="absolute top-4 left-9" />
        <input
          value={userQuery}
          onChange={(e) => {
            setUserQuery(e.target.value);
          }}
          disabled={userQueryCount > 3}
          onKeyDown={handleKeyDown}
          placeholder="Message Vizo..."
          className="w-full  bg-[#FAFAFA] pl-24 pr-16 pt-3 outline-none"
        />
        <div className="absolute top-0 right-3 h-full flex items-center gap-3">
          <div
            className={classNames([
              "w-4",
              "h-4",
              "rounded-3xl",
              "flex",
              "justify-center",
              "items-center",
              userQuery.length > 0 && !vizoLoading
                ? "bg-[#2B2C46]"
                : "bg-[#F3F3F5]",
              userQuery.length > 0 && !vizoLoading
                ? "cursor-pointer"
                : "cursor-default",
            ])}
            onClick={() => {
              if (userQuery?.length > 0 && !vizoLoading) {
                onUserQuery(userQuery);
                setUserQuery("");
              }
            }}
          >
            <ArrowEnter className="text-white w-2.5 h-2.5" />
          </div>

          <label
            className="cursor-pointer"
            htmlFor={showDisclaimerDisabled ? "nyris__hello-open-camera" : ""}
            onClick={() => {
              if (!showDisclaimerDisabled) {
                setShowDisclaimer(true);
              }
            }}
          >
            <CameraIcon className="" />
          </label>
        </div>

        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png,image/webp"
          onChange={makeFileHandler((e) => imageSearch(e))}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default Chat;
