import classNames from "classnames";

import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { ReactComponent as ArrowDownIcon } from "../assets/arrow_down_expanded.svg";
import { ReactComponent as CloseIcon } from "../assets/close.svg";
import { ReactComponent as VizoAvatarIcon } from "../assets/vizo_avatar.svg";
import { ReactComponent as HistoryIcon } from "../assets/history.svg";

import { ReactComponent as CameraIcon } from "../assets/camera.svg";
import { ReactComponent as RefreshIcon } from "../assets/refresh.svg";
import { ReactComponent as CameraSimpleIcon } from "../assets/camera_simple.svg";
import { ReactComponent as ArrowEnter } from "../assets/arrow_enter.svg";

import { Chat as ChatType, MessageType } from "../types";
import UploadDisclaimer from "./UploadDisclaimer";
import { makeFileHandler } from "@nyris/nyris-react-components";
import PreFilterMobile from "./PreFilterMobile";

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
}

const ChatMobile: React.FC<Props> = ({
  imageThumb,
  ocrList,
  vizoLoading,
  onUserQuery,
  chatHistory,
  filters,
  showNewResultButton,
  showRefinedResult,
  imageSearch,
  setIsCameraOpen,
  setSelectedPreFilters,
  selectedPreFilters,
}) => {
  const history = useHistory();

  const lastChatRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

  const [userQuery, setUserQuery] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [showChat, setShowChat] = useState(true);

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

  return (
    <div className={classNames(["fixed", "bottom-8", "w-full"])}>
      {showChat && (
        <div className={classNames(["px-2"])}>
          <div className={classNames(["rounded-[21px]", "w-full", "bg-white"])}>
            <div className="w-full rounded-[21px] shadow-outer max-h-[292px] overflow-y-auto">
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
              <div
                className="w-full h-10 flex justify-center items-center fixed bg-gradient-to-b from-[#F3F3F5] to-[#ffffff00]"
                onClick={() => {
                  setShowChat(false);
                }}
              >
                <ArrowDownIcon className="text-[#2B2C46]" />
              </div>
              <div ref={containerRef} className="overflow-y-auto pt-10">
                <div className="flex px-2 gap-8 justify-end">
                  <div className="p-3 rounded-2xl bg-[#F4F4F6]">
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
                </div>
                {chatHistory.map((chat, index) => {
                  return (
                    <div
                      key={index}
                      className={`flex px-7 py-4 gap-8 items-start ${
                        chat.type === MessageType.USER ? "justify-end" : ""
                      } `}
                      ref={
                        index === chatHistory.length - 1 ? lastChatRef : null
                      }
                    >
                      {chat.type === MessageType.AI && (
                        <VizoAvatarIcon
                          className="min-h-10 min-w-10"
                          width={40}
                          height={40}
                        />
                      )}

                      {chat.type === MessageType.USER && (
                        <div className="flex flex-col gap-y-2 bg-[#E9E9EC] p-3 rounded-2xl">
                          <div className="whitespace-pre-wrap ">
                            {chat.message}
                          </div>
                        </div>
                      )}

                      {chat.type !== MessageType.USER && (
                        <div className="flex flex-col gap-y-2">
                          <div className="whitespace-pre-wrap ">
                            {chat.message}
                          </div>
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
                                onChange={makeFileHandler((e) =>
                                  imageSearch(e)
                                )}
                                style={{ display: "none" }}
                              />

                              <p>Upload a new picture</p>
                              <CameraIcon color="white" />
                            </label>
                          )}
                        </div>
                      )}
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
          }}
        >
          <HistoryIcon className={classNames(["text-white"])} />
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
            <PreFilterMobile
              setPreFilters={(prefilters) => setSelectedPreFilters(prefilters)}
              selectedPreFilters={selectedPreFilters}
            />
            <input
              placeholder="Message Vizo..."
              className="text-xs outline-none w-full pr-2"
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
              }}
              onClick={() => {
                setShowChat(true);
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
                "cursor-pointer",
              ])}
              onClick={() => {
                onUserQuery(userQuery);
                setUserQuery("");
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
