import { memo, useState, useRef, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Send, Loader2, AlertCircle, Globe } from 'lucide-react';

import { Icon } from '@nyris/nyris-react-components';
import Tooltip from 'components/Tooltip/TooltipComponent';
import useUiStore from 'stores/ui/uiStore';
import { useTranslation } from 'react-i18next';
import CustomCamera from 'components/CustomCameraDrawer';
import ImageUpload from 'components/ImageUpload';
import { useChatAssistantLogic } from './useChatAssistantLogic';

function MobileChatAssistant() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    inputValue,
    setInputValue,
    messages,
    isLoading,
    isEvaluated,
    error,
    hasApiKey,
    p7Running,
    p7Done,
    catalogSearchReady,
    catalogSearching,
    messagesEndRef,
    imageInputRef,
    handleSendMessage,
    handleOptionClick,
    handleImageUpload,
    handleCatalogSearchWithText,
  } = useChatAssistantLogic();

  const setIsAiModeOpen = useUiStore(state => state.setIsAiModeOpen);

  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  // Focus input on text_search_prompt option click
  const wrappedHandleOptionClick = useCallback(
    async (option: any) => {
      if (option.action_type === 'text_search_prompt') {
        inputRef.current?.focus();
      }
      await handleOptionClick(option);
    },
    [handleOptionClick],
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-[50] flex flex-col justify-end max-h-[50vh]">
      {/* Chat container — anchored to bottom, content-based height, max 50vh */}
      <div
        className={twMerge(
          'relative flex flex-col max-h-[50vh] overflow-hidden bg-white/40 backdrop-blur-[8px] rounded-t-[24px] ',
          'shadow-[0px_0px_32px_0px_rgba(152,155,183,1)]',
        )}
      >
        {/* Close / collapse chevron */}
        <div className="flex items-center justify-end px-4 pt-3 pb-1 absolute top-4 right-4">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FAFAFA]"
            onClick={() => setIsAiModeOpen(false)}
          >
            <Icon name="arrow_down" className="fill-[#3B3E5F] w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex-shrink-0 mx-4 mt-1 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
            <p className="text-[11px] text-red-700">{error}</p>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 px-4">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center flex-grow text-center px-4 py-10">
              <div className="w-12 h-12 rounded-full bg-[#F0EFFF] flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-[#3E36DC]" />
              </div>
              <p className="text-sm font-semibold text-[#2B2C46] mb-1">
                Hi! I can help you find parts faster. What are you looking for?
              </p>
              <p className="text-[11px] text-[#999] leading-relaxed max-w-[200px]">
                Upload an image to get started, or search for a product
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={twMerge(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div className="max-w-[85%]">
                  <div
                    className={twMerge(
                      'py-3 px-4 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-[#3E36DC] text-white rounded-tl-[16px] rounded-tr-[8px] rounded-br-[16px] rounded-bl-[16px] px-4 py-3 font-medium'
                        : msg.content.startsWith('[P7')
                          ? 'bg-[#EEF2FF] border border-[#C7D2FE] text-[#2B2C46] rounded-2xl rounded-bl-sm'
                          : 'bg-white text-[#2B2C46] rounded-2xl rounded-bl-sm shadow-sm',
                    )}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded"
                        className="w-[48px] h-[48px] rounded-lg object-cover mb-2"
                      />
                    )}
                    {msg.content.startsWith('[P7') && (
                      <div className="flex items-center gap-1 mb-1.5 text-indigo-600 font-semibold text-[10px]">
                        <Globe size={10} /> Google Grounding
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-5 tracking-[0.16px]">
                      {msg.content.startsWith('[P7')
                        ? msg.content.replace(/^\[P7[^\]]*\]\s*/, '')
                        : msg.content}
                    </pre>
                  </div>

                  {msg.role === 'assistant' &&
                    msg.options &&
                    msg.options.length > 0 && (
                      <div className="mt-2 space-y-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {msg.options
                            .filter(
                              o =>
                                o.action_type !== 'text_search_prompt' &&
                                o.action_type !== 'catalog_search_text',
                            )
                            .map((option, optIdx) => (
                              <Tooltip
                                key={optIdx}
                                content={option.label}
                                disabled={option.label.length <= 32}
                              >
                                <button
                                  key={optIdx}
                                  onClick={() =>
                                    wrappedHandleOptionClick(option)
                                  }
                                  disabled={isLoading}
                                  className={twMerge(
                                    'px-2.5 py-1.5 text-sm font-medium rounded-full',
                                    'transition-colors',
                                    isLoading &&
                                      'opacity-50 cursor-not-allowed',
                                    'bg-[#FFFFFF] font-semibold',
                                    'border border-[#DDDEE7] text-[#767A9F] hover:bg-[#545987] hover:text-[#F3F4F8]',
                                  )}
                                >
                                  {option.label}
                                </button>
                              </Tooltip>
                            ))}

                          {!(isLoading || !catalogSearchReady) &&
                            i === messages.length - 1 && (
                              <button
                                onClick={handleCatalogSearchWithText}
                                disabled={isLoading || !catalogSearchReady}
                                className={twMerge(
                                  'px-2.5 py-1.5 text-sm font-medium rounded-full flex justify-center items-center gap-2',
                                  'transition-colors',
                                  isLoading && 'opacity-50 cursor-not-allowed',
                                  'bg-[#FFFFFF] font-semibold',
                                  'border border-[#DDDEE7] text-[#767A9F] hover:bg-[#545987] hover:text-[#F3F4F8]',
                                )}
                              >
                                <span>Text search in catalog</span>
                                <Icon
                                  name="search"
                                  className="text-[10px] w-[10px] h-[10px] fill-[#767A9F]"
                                />
                              </button>
                            )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-white/80 rounded-2xl rounded-bl-sm shadow-sm">
                <Loader2 size={12} className="animate-spin text-[#3E36DC]" />
                <span className="text-xs text-[#666]">
                  {!isEvaluated
                    ? 'Analyzing results...'
                    : catalogSearching
                      ? 'Refining your search…'
                      : 'Thinking...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* P7 Grounding status strip */}
        {(p7Running || p7Done) && (
          <div className="flex-shrink-0 px-4 py-1.5 bg-white/60">
            {p7Running ? (
              <span className="flex items-center gap-1.5 text-[10px] text-blue-600">
                <Globe size={10} className="animate-pulse" /> Running Google
                Grounding...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] text-blue-500">
                <Globe size={10} /> Google Grounding complete
              </span>
            )}
          </div>
        )}

        {/* Bottom input bar */}
        <div className="flex-shrink-0 px-3 pb-4 pt-2">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div
              className={twMerge(
                'flex items-center gap-2 flex-1 h-14',
                'rounded-[32px] border-[2px] border-solid border-[#655EE3] bg-[#F3F4F8] p-2',
              )}
            >
              <button
                type="button"
                className="flex items-center justify-center p-2 rounded-full flex-shrink-0"
                onClick={() => setIsAiModeOpen(false)}
              >
                <Icon
                  name="search_ai"
                  width={20}
                  height={20}
                  className="text-[#3B3E5F]"
                />
              </button>
              <input
                ref={inputRef}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#2B2C46] placeholder-[#989BB7]"
                placeholder={isLoading ? 'Please wait...' : t('Ask Vizo!')}
                disabled={isLoading}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="submit"
                className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 bg-[#FAFAFA]"
                disabled={!inputValue.trim() || isLoading || !hasApiKey}
              >
                <Send
                  size={16}
                  className={twMerge(
                    inputValue.trim() && !isLoading
                      ? 'text-[#655EE3]'
                      : 'text-[#BBBDCF]',
                  )}
                />
              </button>
            </div>

            <div
              className={twMerge(
                'h-14 min-w-14 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-solid border-[#DDDEE7]',
                'shadow-ds-2',
              )}
            >
              <ImageUpload
                onCameraClick={() => {
                  setOpenModalCamera(true);
                }}
                disableDisclaimer={true}
              />
            </div>
          </form>

          {/* Hidden file input for image upload */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
      <CustomCamera
        show={isOpenModalCamera}
        onClose={() => {
          setOpenModalCamera(s => !s);
        }}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
}

export default memo(MobileChatAssistant);
