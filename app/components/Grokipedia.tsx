'use client';

import { useState } from 'react';
import { Search, Globe, Loader2, BookOpen, ExternalLink } from 'lucide-react';
import { GECard } from '@/components/GECard';
import ReactMarkdown from 'react-markdown';

interface GrokipediaProps {
  onClose: () => void;
  initialCity?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Grokipedia({ onClose, initialCity = '' }: GrokipediaProps) {
  const [city, setCity] = useState(initialCity);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setIsLoading(true);
    setError(null);
    
    // Add user query message
    const userMessage: Message = {
      role: 'user',
      content: `Querying Grokipedia for: ${city}`
    };
    setMessages([userMessage]);

    try {
      const response = await fetch('/api/query-grokipedia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <GECard
          icon={<BookOpen className="h-6 w-6" />}
          title="Grokipedia"
          live={isLoading}
          onClose={onClose}
          maxHeight={600}
        >
          <div className="space-y-6">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter a city name (e.g., London, Paris, Tokyo)"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1d24]/50 border border-[#2a2f3a]/60 rounded-lg text-[#e5e7eb] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#60a5fa]/50 focus:border-[#60a5fa]"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!city.trim() || isLoading}
                className="px-6 py-3 bg-[#60a5fa] hover:bg-[#3b82f6] disabled:bg-[#2a2f3a] disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Query
                  </>
                )}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {/* Empty State */}
            {messages.length === 0 && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="p-4 bg-[#60a5fa]/10 rounded-full">
                  <Globe className="w-12 h-12 text-[#60a5fa]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">
                    Explore Cities with Grokipedia
                  </h3>
                  <p className="text-[#9ca3af] max-w-md text-sm">
                    Enter a city name to discover its historical overview and recent events,
                    powered by xAI&apos;s Grok AI model.
                  </p>
                </div>
              </div>
            )}

            {/* Messages Display */}
            {messages.map((message, index) => (
              <div key={index} className="space-y-3">
                {message.role === 'user' && (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#60a5fa]" />
                    <p className="text-sm font-medium text-[#9ca3af]">{message.content}</p>
                  </div>
                )}
                {message.role === 'assistant' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#34d399]" />
                      <p className="text-sm font-semibold text-[#34d399] uppercase tracking-wide">Response</p>
                    </div>
                    <div className="text-base text-[#e5e7eb] leading-relaxed pl-6 prose prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold text-[#e5e7eb] mt-4 mb-2 border-b border-[#2a2f3a]/40 pb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-semibold text-[#e5e7eb] mt-3 mb-2">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-[#e5e7eb] mb-3 leading-relaxed">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-[#e5e7eb]">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-1 mb-3 text-[#e5e7eb]">
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
                <p className="text-sm">Streaming response...</p>
              </div>
            )}

            {/* Footer Info */}
            {messages.length > 0 && (
              <div className="pt-4 border-t border-[#2a2f3a]/40">
                <p className="text-xs text-[#6b7280] text-center">
                  Powered by xAI Grok • Information from Grokipedia knowledge base
                </p>
              </div>
            )}
          </div>
        </GECard>
      </div>
    </div>
  );
}
