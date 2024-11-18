import React from 'react';
import { FileText, Building2, AlertTriangle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessageProps {
  text: string;
  isUser: boolean;
  onCompanyClick?: (company: string) => void;
  onFavorite?: (company: string) => void;
  clickableCompanies?: string[];
  favorites?: string[];
}

export function ChatMessage({ 
  text, 
  isUser, 
  onCompanyClick, 
  onFavorite,
  clickableCompanies = [],
  favorites = []
}: ChatMessageProps) {
  const renderDocumentItem = (doc: string) => {
    const isWarning = doc.includes('⚠️ UNUTMA:');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 p-2 rounded-lg ${
          isWarning 
            ? 'bg-amber-50 border border-amber-200' 
            : 'bg-white border border-gray-100'
        } shadow-sm hover:shadow-md transition-shadow`}
      >
        {isWarning ? (
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-[#092C74] flex-shrink-0" />
        )}
        <span className={`flex-1 ${isWarning ? 'font-medium text-amber-700' : ''}`}>
          {isWarning ? doc.replace('⚠️ UNUTMA: ', '') : doc}
        </span>
      </motion.div>
    );
  };

  const renderText = () => {
    if (!clickableCompanies?.length) {
      if (text.includes('için gereken evraklar:')) {
        const [title, ...documents] = text.split('\n\n');
        const documentList = documents.join('').split('• ').filter(Boolean);
        const companyName = title.split(' için')[0];
        
        // Separate warnings and regular documents
        const warnings = documentList.filter(doc => doc.includes('⚠️ UNUTMA:'));
        const regularDocs = documentList.filter(doc => !doc.includes('⚠️ UNUTMA:'));
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{title}</h3>
              {onFavorite && (
                <button
                  onClick={() => onFavorite(companyName)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title={favorites?.includes(companyName) ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
                >
                  <Star
                    className={`w-5 h-5 ${
                      favorites?.includes(companyName)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              )}
            </div>
            <motion.div 
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {warnings.map((doc, index) => (
                <motion.div 
                  key={`warning-${index}`}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  {renderDocumentItem(doc.trim())}
                </motion.div>
              ))}
              {regularDocs.map((doc, index) => (
                <motion.div 
                  key={`doc-${index}`}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  {renderDocumentItem(doc.trim())}
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      }
      return <pre className="whitespace-pre-wrap font-sans text-sm">{text}</pre>;
    }

    return (
      <div className="text-sm">
        <div className="mb-3 font-medium">{text}</div>
        <AnimatePresence>
          <motion.div 
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {clickableCompanies.map((company, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCompanyClick?.(company)}
                className="cursor-pointer p-3 rounded-lg bg-white border border-gray-100 hover:border-[#092C74] hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#092C74]" />
                  <span>{company}</span>
                </div>
                {onFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite(company);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favorites?.includes(company)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
          isUser
            ? 'bg-[#092C74] text-white'
            : 'bg-[#F0F4FA] border border-[#E2E8F3] text-gray-800'
        }`}
      >
        {renderText()}
      </div>
    </motion.div>
  );
}