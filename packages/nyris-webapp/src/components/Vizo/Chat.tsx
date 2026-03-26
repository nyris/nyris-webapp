import React, { useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';

import { makeFileHandler } from '@nyris/nyris-react-components';

import { ReactComponent as EnterIcon } from '../../assets/enter.svg';
import { ReactComponent as CameraIcon } from '../../assets/camera.svg';

import { ReactComponent as ArrowEnter } from '../../assets/arrow_enter.svg';
import ChatHistory from './ChatHistory';
import { MessageType, Chat as ChatType } from 'types';

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
  noResult: boolean;
  onCloseAiMode?: () => void;
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
  noResult,
  onCloseAiMode,
}) => {
  const [userQuery, setUserQuery] = useState('');

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
      if (event.key === 'Enter') {
        onUserQuery(userQuery);
        setUserQuery('');
        // Perform any additional actions here
      }
    }
  };

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const showDisclaimerDisabled = useMemo(() => {
    const disclaimer = localStorage.getItem('upload-disclaimer');

    if (!disclaimer) return false;
    return disclaimer === 'dont-show';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisclaimer]);

  return (
    <div
      className={classNames([
        'w-full h-full rounded-[24px] relative shadow-outer overflow-hidden',
        'flex flex-col',
        'p-[8px]',
      ])}
      style={{
        background: 'linear-gradient(#F3F4F8, #E4E3FF)',
      }}
    >
      {onCloseAiMode && (
        <button
          type="button"
          onClick={onCloseAiMode}
          className="absolute top-3 right-3 z-10 w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#2B2C46] hover:bg-[#F3F3F5] rounded-full transition-colors"
          aria-label="Close AI mode"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 3L9 9M9 3L3 9"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <div className="flex-1 min-h-0">
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
          noResult={noResult}
          onDisclaimerContinue={({
            file,
            dontShowAgain,
          }: {
            file: any;
            dontShowAgain: any;
          }) => {
            if (dontShowAgain) {
              localStorage.setItem('upload-disclaimer', 'dont-show');
            }
            imageSearch(file);
          }}
        />
      </div>

      <div className="w-full flex flex-col items-center gap-2">
        <label
          htmlFor="chat-upload-image-control"
          className="text-white flex items-center justify-center"
          style={{
            width: 260,
            height: 56,
            padding: '20px 8px 20px 8px',
            gap: 8,
            borderRadius: 32,
            background: '#3B3E5F',
            opacity: 1,
          }}
        >
          <CameraIcon />
          <span>Upload Image</span>
        </label>
        <input
          type="file"
          id="chat-upload-image-control"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={event => {
            const file = event.target.files?.[0];
            if (file) {
              console.log('Upload Image selected:', file);
            }
            event.target.value = '';
          }}
        />
        <div className="w-[260px] h-14 py-2 pr-2 pl-4 rounded-[32px] border-2 border-[#CACAD1] bg-[#FAFAFA] flex items-center gap-2">
          <input
            value={userQuery}
            onChange={e => {
              setUserQuery(e.target.value);
            }}
            disabled={userQueryCount > 100}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the results..."
            className="flex-1 h-full bg-transparent outline-none text-sm"
          />
          <div
            className={classNames([
              'rounded-3xl',
              'flex',
              'justify-center',
              'items-center',
              'bg-transparent',
              'w-7 h-7',
              'hover:bg-[#F3F3F5]',
            ])}
            onClick={() => {
              if (userQuery?.length > 0 && !vizoLoading) {
                onUserQuery(userQuery);
                setUserQuery('');
              }
            }}
          >
            <div
              className={classNames([
                'min-w-4',
                'min-h-4',
                'rounded-3xl',
                'flex',
                'justify-center',
                'items-center',
                userQuery.length > 0 && !vizoLoading
                  ? 'bg-[#2B2C46]'
                  : 'bg-[#F3F3F5]',
                userQuery.length > 0 && !vizoLoading
                  ? 'cursor-pointer'
                  : 'cursor-default',
              ])}
            >
              <ArrowEnter className="text-white w-2.5 h-2.5" />
            </div>
          </div>
          {/*

          <label
            className={classNames([
              "cursor-pointer",
              "w-7",
              "h-7",
              "bg-transparent",
              "hover:bg-[#F3F3F5]",
              "rounded-3xl",
              "flex",
              "justify-center",
              "items-center",
            ])}
            htmlFor={showDisclaimerDisabled ? "nyris__hello-open-camera" : ""}
            onClick={() => {
              if (!showDisclaimerDisabled) {
                setShowDisclaimer(true);
              }
            }}
          >
            <CameraIcon className="" />
          </label>
          */}
        </div>
        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png,image/webp"
          onChange={makeFileHandler(e => imageSearch(e))}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default Chat;
