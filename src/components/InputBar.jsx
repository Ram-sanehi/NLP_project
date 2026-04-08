import { useState, useRef, useEffect } from 'react';

/**
 * Input bar component with text input and send button.
 * Supports Enter to send and Shift+Enter for new line.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSend - Callback when message is sent
 * @param {boolean} props.disabled - Whether input is disabled (e.g., during loading)
 */
export default function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSend(trimmedInput);
      setInput('');
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-chat-bg border-t border-chat-border px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            rows={1}
            className="w-full bg-chat-input border border-chat-border rounded-xl px-4 py-3 pr-12
                     text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500
                     focus:ring-1 focus:ring-blue-500 resize-none transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     max-h-[200px] overflow-y-auto"
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-12 h-12 bg-blue-600 hover:bg-blue-700
                   disabled:bg-gray-700 disabled:cursor-not-allowed
                   rounded-xl flex items-center justify-center
                   transition-colors duration-200"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Helper text */}
      <div className="max-w-4xl mx-auto mt-2 text-xs text-gray-500 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
