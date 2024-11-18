import React, { useState, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatHeader } from './components/ChatHeader';
import { insuranceData } from './data/insuranceData';
import { MessageCircle, History, Star } from 'lucide-react';
import { findClosestMatch } from './utils/stringSimilarity';
import { findCompaniesByDocument } from './utils/searchUtils';
import { handleUserInput } from './utils/chatLogic';
import { Message, ConfirmationState } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    text: 'Merhaba! Size nasıl yardımcı olabilirim? Hangi sigorta şirketi veya banka hakkında bilgi almak istersiniz?',
    isUser: false
  }]);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<ConfirmationState>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const commonQueries = [
    "İbraname isteyen kurumlar",
    "Müstehaklık sorgulanan kurumlar",
    "Hasta payı faturası gereken yerler",
    "Kimlik isteyen kurumlar"
  ];

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleCompanyClick = (company: string) => {
    if (insuranceData[company]) {
      addToSearchHistory(company);
      setIsTyping(true);
      setTimeout(() => {
        const documents = insuranceData[company];
        const response = `${company} için gereken evraklar:\n\n${documents.map(doc => `• ${doc}`).join('\n')}`;
        setMessages(prev => [...prev, { text: response, isUser: false }]);
        setIsTyping(false);
      }, 500);
    }
  };

  const toggleFavorite = (company: string) => {
    setFavorites(prev => {
      if (prev.includes(company)) {
        return prev.filter(c => c !== company);
      }
      return [...prev, company];
    });
    toast.success(
      favorites.includes(company) 
        ? 'Favorilerden kaldırıldı' 
        : 'Favorilere eklendi'
    );
  };

  const addToSearchHistory = (query: string) => {
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10);
      return newHistory;
    });
  };

  const handleClearChat = () => {
    setMessages([{
      text: 'Merhaba! Size nasıl yardımcı olabilirim? Hangi sigorta şirketi veya banka hakkında bilgi almak istersiniz?',
      isUser: false
    }]);
    setAwaitingConfirmation(null);
    toast.success('Sohbet temizlendi');
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    addToSearchHistory(input);
    setIsTyping(true);
    setShowSuggestions(false);

    setTimeout(() => {
      const { response, newConfirmationState, clickableCompanies } = handleUserInput(
        input,
        awaitingConfirmation,
        insuranceData
      );

      if (response) {
        setMessages(prev => [...prev, {
          text: response,
          isUser: false,
          clickableCompanies
        }]);
      }

      setAwaitingConfirmation(newConfirmationState);
      setIsTyping(false);
    }, 500);

    setInput('');
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        toast('Chatbot açıldı! Yardım için bir soru sorun.', {
          icon: '💬',
        });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  return (
    <div className="w-full h-screen bg-white">
      <Toaster position="top-right" />
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[400px] h-[600px] bg-white rounded-2xl shadow-xl flex flex-col"
            >
              <ChatHeader onClose={() => setIsOpen(false)} onClear={handleClearChat} />
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ChatMessage
                      {...message}
                      onCompanyClick={handleCompanyClick}
                      onFavorite={toggleFavorite}
                      favorites={favorites}
                    />
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 p-4 bg-gray-50 rounded-lg w-fit"
                  >
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </motion.div>
                )}
              </div>
              <div className="relative">
                {showSuggestions && (input.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 bg-white border border-[#E2E8F3] rounded-lg shadow-lg p-4 m-2"
                  >
                    {favorites.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                          <Star className="w-4 h-4" />
                          <span>Favoriler</span>
                        </div>
                        <div className="space-y-1">
                          {favorites.map((company, index) => (
                            <div
                              key={`fav-${index}`}
                              onClick={() => handleCompanyClick(company)}
                              className="cursor-pointer p-2 hover:bg-gray-50 rounded text-sm"
                            >
                              {company}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {searchHistory.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                          <History className="w-4 h-4" />
                          <span>Son Aramalar</span>
                        </div>
                        <div className="space-y-1">
                          {searchHistory.slice(0, 5).map((query, index) => (
                            <div
                              key={`history-${index}`}
                              onClick={() => setInput(query)}
                              className="cursor-pointer p-2 hover:bg-gray-50 rounded text-sm"
                            >
                              {query}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Sık Sorulan Sorular</div>
                      <div className="space-y-1">
                        {commonQueries.map((query, index) => (
                          <div
                            key={`common-${index}`}
                            onClick={() => setInput(query)}
                            className="cursor-pointer p-2 hover:bg-gray-50 rounded text-sm"
                          >
                            {query}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <ChatInput
                  input={input}
                  setInput={setInput}
                  handleSend={handleSend}
                  onFocus={handleInputFocus}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 bg-[#092C74] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0A237D] transition-colors"
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}