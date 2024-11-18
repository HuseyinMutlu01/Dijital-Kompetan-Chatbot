import React from 'react';
import { Building2, X, Eraser } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onClear: () => void;
}

export function ChatHeader({ onClose, onClear }: ChatHeaderProps) {
  return (
    <div className="bg-[#092C74] p-4 rounded-t-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Building2 className="w-7 h-7 text-white" />
        <div>
          <h1 className="text-white text-lg font-semibold">
            Acıbadem Sigorta Asistanı
          </h1>
          <p className="text-[#B8C7E5] text-sm">
            Sigorta ve banka evrak bilgilendirme sistemi
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="text-white hover:text-gray-200 transition-colors p-1"
          title="Sohbeti Temizle"
        >
          <Eraser className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors p-1"
          title="Kapat"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}