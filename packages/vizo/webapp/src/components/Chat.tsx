import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeFileHandler } from "@nyris/nyris-react-components";

import { ReactComponent as AvatarIcon } from "../assets/avatar.svg";
import { ReactComponent as CloseIcon } from "../assets/close.svg";
import { ReactComponent as VizoAvatarIcon } from "../assets/vizo_avatar.svg";
import { ReactComponent as EnterIcon } from "../assets/enter.svg";
import { ReactComponent as CameraIcon } from "../assets/camera.svg";
import { ReactComponent as RefreshIcon } from "../assets/refresh.svg";

import { Chat as ChatType, MessageType } from "../types";
import UploadDisclaimer from "./UploadDisclaimer";

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
}) => {
  const history = useHistory();
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

  useEffect(() => {
    if (lastChatRef.current) {
      if (chatHistory.length > 2) {
        scrollToLastMessage();
      }
    }
  }, [chatHistory]);

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      onUserQuery(userQuery);
      setUserQuery("");
      // Perform any additional actions here
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
      {showDisclaimer && (
        <UploadDisclaimer
          onClose={() => {
            setShowDisclaimer(false);
          }}
          onContinue={(file: any, dontShowAgain: boolean) => {
            if (dontShowAgain) {
              localStorage.setItem("upload-disclaimer", "dont-show");
            }
            setShowDisclaimer(false);
            imageSearch(file);
          }}
        />
      )}

      <div ref={containerRef} className="max-h-96 overflow-y-auto">
        <div className="flex px-7 py-4 gap-8">
          <AvatarIcon width={40} height={40} />
          <div className="flex justify-center items-center rounded h-10 border-2 border-[#3E36DC]">
            <img
              src={imageThumb}
              width={36}
              alt="searched thumb"
              className="h-full object-contain"
            />
            <div className="bg-[#E4E3FF] w-9 h-full flex justify-center items-center cursor-pointer">
              <CloseIcon
                width={16}
                height={16}
                color="#655EE3"
                onClick={() => {
                  // setSearchKey("");
                  // setResults([]);
                  // setSearchImage(null);
                  // setImageThumb("");
                  history.push("/");
                }}
              />
            </div>
          </div>
        </div>
        {chatHistory.map((chat, index) => {
          return (
            <div
              key={index}
              className={`flex px-7 py-4 gap-8 items-start`}
              ref={index === chatHistory.length - 1 ? lastChatRef : null}
            >
              {chat.type === MessageType.AI && (
                <VizoAvatarIcon
                  className="min-h-10 min-w-10"
                  width={40}
                  height={40}
                />
              )}

              {chat.type === MessageType.USER && (
                <AvatarIcon
                  className="min-h-10 min-w-10"
                  width={40}
                  height={40}
                />
              )}

              <div className="flex flex-col gap-y-2">
                <div className="whitespace-pre-wrap ">{chat.message}</div>
                {chat.responseType === "OCR" && (
                  <div className="flex flex-wrap gap-2">
                    {ocrList?.map((value, index) => {
                      return (
                        <p
                          className="bg-[#F3F3F5] px-2 py-2 rounded-2xl text-sm break-words"
                          key={index}
                        >
                          {`${value}`}
                        </p>
                      );
                    })}
                  </div>
                )}
                {chat.responseType === "filter" && (
                  <div className="flex flex-wrap gap-2">
                    {filters?.map((value, index) => {
                      return (
                        <p
                          className="bg-[#F3F3F5] px-2 py-2 rounded-2xl text-sm break-words"
                          key={index}
                        >
                          {`${value}`}
                        </p>
                      );
                    })}
                  </div>
                )}
                {chat.responseType === "upload_new_image" && (
                  <label
                    htmlFor="nyris__hello-open-camera"
                    className="flex items-center justify-center gap-x-2  px-2 bg-[#2B2C46] text-white text-xs w-40 h-7 rounded-3xl cursor-pointer"
                  >
                    <input
                      type="file"
                      name="take-picture"
                      id="nyris__hello-open-camera"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={makeFileHandler((e) => imageSearch(e))}
                      style={{ display: "none" }}
                    />

                    <p>Upload a new picture</p>
                    <CameraIcon color="white" />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {vizoLoading && (
        <div className={`flex px-7 py-4 gap-8 items-center`}>
          <VizoAvatarIcon
            className="min-h-10 min-w-10"
            width={40}
            height={40}
          />
          <div className="flex flex-col gap-y-2">
            <p className="text-base bg-clip-text bg-gradient-to-r from-[#3E36DC] to-[#E31B5D] text-transparent">
              Analysis is being performed...
            </p>
          </div>
        </div>
      )}
      {showNewResultButton && (
        <div className={`flex px-7 py-4 gap-8 items-center`}>
          <VizoAvatarIcon
            className="min-h-10 min-w-10"
            width={40}
            height={40}
          />
          <div className="flex flex-col gap-y-2">
            <div
              onClick={() => {
                showRefinedResult();
              }}
              className="text-base bg-gradient-to-r from-[#3E36DC] to-[#E31B5D] text-white flex gap-x-2 w-48 h-8 justify-center items-center drop-shadow-md cursor-pointer rounded-2xl"
            >
              <RefreshIcon color="white" />
              New results available
            </div>
          </div>
        </div>
      )}

      <div className="w-full relative border-t border-[#E0E0E0] h-12 bg-[#F6F6F6]">
        <EnterIcon className="absolute top-4 left-9" />
        <input
          value={userQuery}
          onChange={(e) => {
            setUserQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message Vizo..."
          className="w-full  bg-[#F6F6F6] pl-24 pr-9 pt-3 outline-none"
        />

        <label
          className="cursor-pointer"
          htmlFor={showDisclaimerDisabled ? "nyris__hello-open-camera" : ""}
          onClick={() => {
            if (!showDisclaimerDisabled) {
              setShowDisclaimer(true);
            }
          }}
        >
          <CameraIcon className="absolute top-4 right-3" />
        </label>

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
