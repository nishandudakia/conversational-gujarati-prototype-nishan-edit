import { useEffect, useRef } from 'react';
import type { ConversationMessage } from '../App';

interface OutputProps {
  conversationHistory: ConversationMessage[];
}

export default function Output({ conversationHistory }: OutputProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  if (conversationHistory.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-5 text-center text-zinc-400 italic">
       Let's pratice a conversation in Gujarati together. Start the conversation with the common greeting 'Kem cho' which means 'How are you?' in Gujarati...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-5 space-y-4">
      {conversationHistory.map((message) => (
        <div key={message.id} className="space-y-4">
          {/* User Message - Right aligned */}
          <div className="flex justify-end">
            <div className="max-w-[75%] bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 space-y-2">
              <div className="text-base leading-relaxed break-words whitespace-pre-wrap">
                {message.userphoneticGujaratiText ? (
                  <strong className="font-medium italic">{message.userphoneticGujaratiText}</strong>
                ) : (
                  <span className="opacity-70 italic">...</span>
                )}
              </div>
              <div className="text-sm opacity-90 break-words whitespace-pre-wrap">
                {message.userenglishText || '...'}
              </div>
              <div className="text-sm opacity-90 break-words whitespace-pre-wrap">
                Pronounciation: {message.pronounciationRating || '...'}
              </div>
            </div>
          </div>

          {/* AI Response - Left aligned */}
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-green-600 text-white rounded-2xl rounded-tl-sm px-4 py-3 space-y-2">
              <div className="text-base leading-relaxed break-words whitespace-pre-wrap">
                {message.aiphoneticGujaratiText ? (
                  <strong className="font-medium italic">{message.aiphoneticGujaratiText}</strong>
                ) : (
                  <span className="text-white/70 italic">...</span>
                )}
              </div>
              <div className="text-sm opacity-90 break-words whitespace-pre-wrap">
                {message.aienglishText || '...'}
              </div>
            </div>
          </div>

          {/* Suggestions - Left aligned with distinct styling */}
          {message.suggestions && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-gray-100 text-zinc-900 rounded-2xl rounded-tl-sm px-4 py-3 space-y-3">
                <div className="text-xs uppercase tracking-wide text-zinc-600 font-semibold">
                  Suggestions - Something else you want to say? Just ask 'How do I say...'
                </div>
                {message.suggestions.split(',').map((suggestion, idx) => {
                  const match = suggestion.trim().match(/^(.+?)\s*\((.+?)\)\s*$/);
                  if (match) {
                    const [, gujarati, english] = match;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="text-base leading-relaxed break-words whitespace-pre-wrap">
                          <strong className="font-medium italic">{gujarati.trim()}</strong>
                        </div>
                        <div className="text-sm text-zinc-700 break-words whitespace-pre-wrap">
                          {english.trim()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
