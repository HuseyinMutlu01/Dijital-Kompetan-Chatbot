import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ChatInput({ input, setInput, handleSend, onFocus, onBlur }: ChatInputProps) {
  return (
    <div className="border-t border-[#E2E8F3] p-4 bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Sigorta şirketi adını yazın veya soru sorun..."
          className="flex-1 p-3 border border-[#E2E8F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#092C74] text-sm bg-[#F8FAFD]"
        />
        <button
          onClick={handleSend}
          className="bg-[#092C74] text-white p-3 rounded-xl hover:bg-[#0A237D] transition-colors shadow-md hover:shadow-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}