/**
 * Chat Assistant Component — Vizo Search Assistant (Desktop)
 */

import { memo, useRef, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Send, Loader2, Globe } from 'lucide-react';

import useConversationStore from 'stores/chat/conversationStore';
import { Icon } from '@nyris/nyris-react-components';
import useUiStore from 'stores/ui/uiStore';
import OptionChip, { ChatOption } from './OptionChip';
import { useChatAssistantLogic } from './useChatAssistantLogic';

function ChatAssistant() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    inputValue,
    setInputValue,
    messages,
    isLoading,
    isEvaluated,
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

  const setIsOpen = useConversationStore(s => s.setIsOpen);

  const toggleAiMode = useUiStore(state => state.toggleAiMode);

  // Focus input on text_search_prompt option click
  const wrappedHandleOptionClick = useCallback(
    async (option: ChatOption) => {
      if (option.action_type === 'text_search_prompt') {
        inputRef.current?.focus();
      }
      if (option.action_type === 'related_part') {
        inputRef.current?.focus();
      }
      await handleOptionClick(option);
    },
    [handleOptionClick],
  );

  const handleCatalogSearchTextChipClick = useCallback(async () => {
    await handleCatalogSearchWithText();
  }, [handleCatalogSearchWithText]);

  return (
    <div
      className={twMerge([
        'w-full h-full rounded-[24px] relative shadow-outer overflow-hidden',
        'flex flex-col',

        'border border-solid border-[#DDDEE7]',
        'bg-[radial-gradient(ellipse_at_70%_7%,_#F3F4F8_50%,_#E4E3FF_100%)]',
      ])}
    >
      <div
        className="absolute top-3 right-4 bg-[#FAFAFA] w-7 h-7 flex justify-center items-center rounded-lg cursor-pointer"
        onClick={() => {
          toggleAiMode();
          setIsOpen(false);
        }}
      >
        <Icon name="close" className="fill-[#BBBDCF] text-[#BBBDCF]" />
      </div>

      {/* {error && (
        <div className="flex-shrink-0 mx-3 mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
          <p className="text-[11px] text-red-700">{error}</p>
        </div>
      )} */}

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3 space-y-3">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center px-4 py-10">
            <div className="w-12 h-12 rounded-full bg-[#F0EFFF] flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-[#3E36DC]" />
            </div>
            <p className="text-sm font-semibold text-[#2B2C46] mb-1">
              Vizo Search Assistant
            </p>
            <p className="text-[11px] text-[#999] leading-relaxed max-w-[200px]">
              Upload an image to get started, or search for a product
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            return (
              <div
                key={msg.id || i}
                className={twMerge(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div className="">
                  {/* Bubble */}
                  <div
                    className={twMerge(
                      'py-3 pr-4 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-[#E7E8F1] text-[#3B3E5F] rounded-tl-[16px] rounded-tr-[8px] rounded-br-[16px] rounded-bl-[16px] px-4 py-3 font-medium'
                        : msg?.content?.startsWith('[P7')
                          ? 'bg-[#EEF2FF] border border-[#C7D2FE] text-[#2B2C46] rounded-2xl rounded-bl-sm'
                          : ' text-[#2B2C46] rounded-2xl rounded-bl-sm',
                      i === 0 && 'pr-6',
                    )}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded"
                        className="w-[48px] h-[48px] rounded-lg object-cover mb-2"
                      />
                    )}
                    {msg?.content?.startsWith('[P7') && (
                      <div className="flex items-center gap-1 mb-1.5 text-indigo-600 font-semibold text-[10px]">
                        <Globe size={10} /> Google Grounding
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-4 tracking-[0.16px]">
                      {msg?.content?.startsWith('[P7')
                        ? msg.content.replace(/^\[P7[^\]]*\]\s*/, '')
                        : msg.content}
                    </pre>
                  </div>

                  {/* Quick reply options */}
                  {msg.role === 'assistant' &&
                    msg.options &&
                    msg.options.length > 0 && (
                      <div className="mt-2 space-y-2.5">
                        {/* Option chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {msg.options
                            .filter(o => o.action_type !== 'text_search_prompt')
                            .map((option, optIdx) => (
                              <OptionChip
                                key={optIdx}
                                option={option}
                                onClick={wrappedHandleOptionClick}
                                disabled={
                                  isLoading || i !== messages.length - 1
                                }
                              />
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F3F3F5] rounded-2xl rounded-bl-sm">
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

      {/* ── P7 Grounding status strip ── */}
      {(p7Running || p7Done) && (
        <div className="flex-shrink-0 px-3 py-1.5 border-t border-[#E0E0E0] bg-[#F8F8FF]">
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

      {/* ── Upload image — fixed above input ── */}
      {isEvaluated && hasApiKey && (
        <div className="px-2">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
            className={twMerge(
              'w-full h-12 rounded-[32px] bg-[#3B3E5F] mb-2',
              'flex items-center justify-center gap-2 text-white cursor-pointer',
              'hover:bg-[#333653] transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span>Upload image</span>
            <Icon name="camera_ai" />
          </button>
        </div>
      )}

      {/* ── Input ── */}
      {/* <div className="flex-shrink-0 px-3 py-3 border-t border-[#E0E0E0] bg-white rounded-3xl mt-2">
      </div> */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 items-end px-2"
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={
            isLoading ? 'Please wait...' : 'Ask about the results...'
          }
          disabled={isLoading}
          rows={1}
          className={twMerge(
            'flex-1 resize-none rounded-xl px-3 py-2.5 text-sm pr-14',
            'border-2 border-[#3E36DC] outline-none',
            'bg-[#F3F4F8] disabled:opacity-60',
            'min-h-[56px] max-h-[100px]',
            'rounded-[32px]',
            'overflow-y-auto scrollbar-hide',
          )}
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.4',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          /* Hide scrollbar for Webkit browsers */
          /* Add this style in a global CSS if not already present: .scrollbar-hide::-webkit-scrollbar { display: none; } */
        />

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim() || !hasApiKey}
          className={twMerge(
            'p-2.5 rounded-[32px] transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center',
            inputValue.trim() && !isLoading && hasApiKey
              ? 'bg-[#FAFAFA] text-black hover:bg-blue-100/40'
              : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed',
            'absolute right-4 bottom-2',
          )}
        >
          <Send size={16} />
        </button>
        {/* Hidden file input — triggered by Upload image button above */}
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
      </form>
    </div>
  );
}

export default memo(ChatAssistant);
