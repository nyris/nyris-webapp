import { memo, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { twMerge } from 'tailwind-merge';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

function ChatInput({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false,
  placeholder = 'Ask about the results...',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (value.trim() && !disabled && !isLoading) {
      onSend(value.trim());
      setValue('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="border-t border-[#E0E0E0] p-3 bg-white ">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={twMerge(
            'flex-1 resize-none rounded-xl border border-[#E0E0E0]',
            'px-3 py-2 text-xs leading-relaxed',
            'focus:outline-none focus:border-[#3E36DC] focus:ring-1 focus:ring-[#3E36DC]',
            'placeholder:text-[#999]',
            'transition-colors',
            'max-h-[100px]',
            (disabled || isLoading) && 'bg-[#F3F3F5] cursor-not-allowed',
          )}
        />

        <button
          onClick={isLoading ? handleCancel : handleSubmit}
          disabled={disabled || (!isLoading && !value.trim())}
          className={twMerge(
            'flex-shrink-0 w-8 h-8 rounded-full',
            'flex items-center justify-center',
            'transition-colors',
            isLoading
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : value.trim() && !disabled
                ? 'bg-[#3E36DC] hover:bg-[#332CB7] text-white'
                : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed',
          )}
          title={isLoading ? 'Stop generating' : 'Send message'}
        >
          {isLoading ? (
            <Square size={14} fill="currentColor" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>

      <p className="text-[10px] text-[#999] mt-1.5 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}

export default memo(ChatInput);
