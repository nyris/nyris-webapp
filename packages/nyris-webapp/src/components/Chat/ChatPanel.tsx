import { memo, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { MessageSquare, RotateCcw, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

import useChatStore from 'stores/chat/chatStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useChat from 'hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

function ChatPanel() {
  const settings = (window as any).settings;
  const chatEnabled = settings?.chat?.enabled !== false; // Default to true if not specified
  
  const { isOpen, toggleOpen } = useChatStore();
  const { setShowAdminSettings } = useSmartFiltersStore();
  
  const {
    messages,
    isLoading,
    error,
    hasApiKey,
    sendMessage,
    cancelRequest,
    startNewConversation,
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Suggested prompts for empty state
  const suggestedPrompts = [
    'What are the differences between these products?',
    'Which product would you recommend?',
    'Tell me more about the top result',
    'What specifications should I look for?',
  ];
  
  // Don't render if chat is disabled
  if (!chatEnabled) {
    return null;
  }

  return (
    <div className="border-t border-[#E0E0E0] bg-[#FAFAFF] mt-2">
      {/* Header - Always visible, clickable to toggle */}
      <button
        onClick={toggleOpen}
        className={twMerge(
          'w-full flex items-center justify-between p-3',
          'hover:bg-[#F9F9FB] transition-colors',
          'focus:outline-none'
        )}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-[#3E36DC]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">
            Chat with Results
          </span>
          {messages.length > 0 && (
            <span className="px-1.5 py-0.5 bg-[#3E36DC] text-white text-[10px] font-medium rounded-full min-w-[18px] text-center">
              {messages.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-[#666]" />
        ) : (
          <ChevronUp size={16} className="text-[#666]" />
        )}
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="flex flex-col" style={{ maxHeight: '400px' }}>
          {/* No API Key Warning */}
          {!hasApiKey && (
            <div className="mx-3 mb-2 p-3 bg-[#FFF3CD] border border-[#FFE69C] rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-[#856404] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#856404]">
                    Gemini API key required for chat.{' '}
                    <button
                      onClick={() => setShowAdminSettings(true)}
                      className="underline font-medium hover:text-[#533f03]"
                    >
                      Configure in Admin Settings
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-3 mb-2 p-3 bg-[#F8D7DA] border border-[#F5C6CB] rounded-lg">
              <p className="text-xs text-[#721C24]">{error}</p>
            </div>
          )}

          {/* Messages area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto min-h-[200px] max-h-[280px]"
          >
            {messages.length === 0 ? (
              // Empty state with suggestions
              <div className="p-4 text-center">
                <MessageSquare size={24} className="mx-auto text-[#E0E0E0] mb-2" />
                <p className="text-xs text-[#666] mb-3">
                  Ask questions about your search results
                </p>
                
                {hasApiKey && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-[#999] uppercase tracking-wide mb-2">
                      Try asking:
                    </p>
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(prompt)}
                        disabled={isLoading}
                        className={twMerge(
                          'block w-full text-left px-3 py-2 rounded-lg',
                          'text-xs text-[#3E36DC] bg-[#F0EFFF]',
                          'hover:bg-[#E4E3FF] transition-colors',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Message list
              <div className="py-2">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* New conversation button */}
          {messages.length > 0 && (
            <div className="px-3 py-2 border-t border-[#E0E0E0]">
              <button
                onClick={startNewConversation}
                disabled={isLoading}
                className={twMerge(
                  'flex items-center justify-center gap-1.5 w-full',
                  'text-[10px] text-[#666] hover:text-[#3E36DC]',
                  'py-1 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <RotateCcw size={10} />
                Start new conversation
              </button>
            </div>
          )}

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            onCancel={cancelRequest}
            isLoading={isLoading}
            disabled={!hasApiKey}
            placeholder={hasApiKey ? 'Ask about the results...' : 'Configure API key to chat'}
          />
        </div>
      )}
    </div>
  );
}

export default memo(ChatPanel);
