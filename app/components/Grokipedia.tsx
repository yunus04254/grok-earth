'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, Loader2, BookOpen, ExternalLink, MapPin } from 'lucide-react';
import { GECard } from '@/components/GECard';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface GrokipediaProps {
  onClose: () => void;
  city: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Grokipedia({ onClose, city }: GrokipediaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasQueried = useRef(false);

  // Auto-query when component mounts with a city
  useEffect(() => {
    if (city && !hasQueried.current) {
      hasQueried.current = true;
      queryCity(city);
    }
  }, [city]);

  const queryCity = async (cityName: string) => {
    if (!cityName.trim()) return;

    setIsLoading(true);
    setError(null);
    
    // Add user query message
    const userMessage: Message = {
      role: 'user',
      content: `Querying Grokipedia for: ${cityName}`
    };
    setMessages([userMessage]);

    try {
      const response = await fetch('/api/query-grokipedia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: cityName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          
          // Update messages with streaming content
          setMessages([
            userMessage,
            { role: 'assistant', content: assistantMessage }
          ]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="fixed left-6 top-24 z-40 w-[420px] max-h-[calc(100vh-280px)]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <GECard
        icon={<BookOpen className="h-5 w-5" />}
        title="Grokipedia"
        live={isLoading}
        onClose={onClose}
        maxHeight={700}
      >
        <div className="space-y-4">
          {/* City Header */}
          <div className="flex items-center gap-3 p-3 bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-lg">
            <div className="p-2 bg-[#60a5fa]/20 rounded-full">
              <MapPin className="w-5 h-5 text-[#60a5fa]" />
            </div>
            <div>
              <p className="text-xs text-[#9ca3af] uppercase tracking-wide">Exploring</p>
              <p className="text-lg font-semibold text-[#e5e7eb]">{city}</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Loading Initial State */}
          {messages.length === 0 && isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#60a5fa] animate-spin" />
              <p className="text-[#9ca3af] text-sm">
                Fetching information about {city}...
              </p>
            </div>
          )}

          {/* Messages Display */}
          {messages.map((message, index) => (
            <div key={index} className="space-y-3">
              {message.role === 'assistant' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#34d399]" />
                    <p className="text-xs font-semibold text-[#34d399] uppercase tracking-wide">Grokipedia</p>
                  </div>
                  <div className="text-sm text-[#e5e7eb] leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold text-[#e5e7eb] mt-4 mb-2 border-b border-[#2a2f3a]/40 pb-2">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-semibold text-[#e5e7eb] mt-3 mb-2">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-[#e5e7eb] mb-3 leading-relaxed text-sm">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-[#e5e7eb]">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 mb-3 text-[#e5e7eb] text-sm">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-[#e5e7eb]">
                            {children}
                          </li>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#60a5fa] hover:text-[#34d399] underline inline-flex items-center gap-1 transition-colors"
                          >
                            {children}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ),
                        hr: () => (
                          <hr className="border-[#2a2f3a]/40 my-4" />
                        ),
                        em: ({ children }) => (
                          <em className="text-[#9ca3af] italic">
                            {children}
                          </em>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading State */}
          {isLoading && messages.length > 0 && (
            <div className="flex items-center gap-2 text-[#9ca3af]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-xs">Streaming response...</p>
            </div>
          )}

          {/* Footer Info */}
          {messages.length > 0 && !isLoading && (
            <div className="pt-3 border-t border-[#2a2f3a]/40">
              <p className="text-xs text-[#6b7280] text-center">
                Powered by xAI Grok • Grokipedia
              </p>
            </div>
          )}
        </div>
      </GECard>
    </motion.div>
  );
}
