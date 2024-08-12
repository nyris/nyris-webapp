import { useHistory } from "react-router-dom";

import { makeFileHandler } from "@nyris/nyris-react-components";

import UploadDisclaimer from "./UploadDisclaimer";
import { Chat as ChatType, MessageType } from "../types";

import { ReactComponent as CloseIcon } from "../assets/close.svg";
import { ReactComponent as VizoAvatarIcon } from "../assets/vizo_avatar.svg";
import { ReactComponent as CameraIcon } from "../assets/camera.svg";
import { ReactComponent as RefreshIcon } from "../assets/refresh.svg";
import { ReactComponent as ArrowDownIcon } from "../assets/arrow_down_expanded.svg";

function ChatHistory({
  lastChatRef,
  chatHistory,
  imageThumb,
  containerRef,
  showDisclaimer,
  setShowDisclaimer,
  imageSearch,
  setShowChat,
  setNotification,
  showNewResultButton,
  showRefinedResult,
  vizoLoading,
  vizoLoadingMessage,
  ocrList,
  userQueryCount,
  onDisclaimerContinue,
  isMobile,
}: {
  lastChatRef: any;
  chatHistory: ChatType[];
  imageThumb: any;
  containerRef: any;
  showRefinedResult: any;
  showNewResultButton: any;
  vizoLoading: boolean;
  vizoLoadingMessage: string;
  userQueryCount: number;
  ocrList?: string[];
  showDisclaimer?: boolean;
  setShowDisclaimer?: any;
  imageSearch?: any;
  setShowChat?: any;
  setNotification?: any;
  onDisclaimerContinue?: any;
  isMobile?: any;
}) {
  const history = useHistory();

  return (
    <>
      {showDisclaimer && (
        <UploadDisclaimer
          onClose={() => {
            setShowDisclaimer(false);
          }}
          onContinue={({
            file,
            dontShowAgain,
          }: {
            file: any;
            dontShowAgain: any;
          }) => {
            if (!isMobile) {
              onDisclaimerContinue({ file, dontShowAgain });
            } else {
              onDisclaimerContinue({ dontShowAgain });
            }
            setShowDisclaimer(false);
          }}
          isMobile={isMobile}
        />
      )}
      <div
        className="w-full h-10 flex justify-center items-center fixed bg-gradient-to-b from-[#F3F3F5] to-[#ffffff00] md:hidden"
        onClick={() => {
          setShowChat(false);
          setNotification(false);
        }}
      >
        <ArrowDownIcon className="text-[#2B2C46]" />
      </div>
      <div
        ref={containerRef}
        className="md:max-h-96 overflow-y-auto pt-10 md:pt-2"
      >
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
                <div className="flex flex-col gap-y-2 bg-[#E9E9EC] p-3 rounded-2xl">
                  <div className="whitespace-pre-wrap ">{chat.message}</div>
                </div>
              )}

              {chat.type === MessageType.AI && (
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
            <p className="text-base animate-loadingTextColor ">
              {vizoLoadingMessage}
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

      {userQueryCount > 3 && !vizoLoading && (
        <div className="flex px-7 py-4 gap-8 items-center">
          <VizoAvatarIcon
            className="min-h-10 min-w-10"
            width={40}
            height={40}
          />
          <div className="whitespace-pre-wrap ">
            You have reached the question limit for this session. Please start a
            new session or upload a new image.
          </div>
        </div>
      )}
    </>
  );
}

export default ChatHistory;
