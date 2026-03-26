import { memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { User, Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from 'stores/chat/chatStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simple markdown-like formatting for assistant messages
  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Split by lines and process
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;
    let listItems: string[] = [];
    
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-4 my-1 space-y-0.5">
            {listItems.map((item, i) => (
              <li key={i} className="text-xs">{formatInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };
    
    const formatInline = (text: string) => {
      // Bold: **text**
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };
    
    lines.forEach((line, i) => {
      const trimmedLine = line.trim();
      
      // Check for list items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        inList = true;
        listItems.push(trimmedLine.substring(2));
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        // Numbered list
        inList = true;
        listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
      } else {
        flushList();
        
        if (trimmedLine === '') {
          // Empty line - add spacing
          if (elements.length > 0) {
            elements.push(<div key={`space-${i}`} className="h-2" />);
          }
        } else {
          // Regular paragraph
          elements.push(
            <p key={`p-${i}`} className="text-xs leading-relaxed">
              {formatInline(trimmedLine)}
            </p>
          );
        }
      }
    });
    
    flushList();
    
    return elements;
  };

  return (
    <div
      className={twMerge(
        'flex gap-2 px-3 py-2',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={twMerge(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
          isUser ? 'bg-[#3E36DC]' : 'bg-[#E4E3FF]'
        )}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          <Sparkles size={14} className="text-[#3E36DC]" />
        )}
      </div>
      
      {/* Message content */}
      <div
        className={twMerge(
          'flex flex-col max-w-[85%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={twMerge(
            'rounded-xl px-3 py-2',
            isUser
              ? 'bg-[#3E36DC] text-white rounded-tr-sm'
              : 'bg-[#F3F3F5] text-[#2B2C46] rounded-tl-sm'
          )}
        >
          {message.content ? (
            isUser ? (
              <p className="text-xs leading-relaxed">{message.content}</p>
            ) : (
              <div className="space-y-1">{formatContent(message.content)}</div>
            )
          ) : (
            // Loading placeholder
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#3E36DC] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-[#3E36DC] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-[#3E36DC] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <span className="text-[10px] text-[#999] mt-0.5 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default memo(ChatMessage);
