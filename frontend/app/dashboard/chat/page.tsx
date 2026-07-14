'use client';

import { useState, useRef, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Plus, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPlayground() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleNew() {
    setMessages([]);
    setConversationId(null);
    setInput('');
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const data = await api<{ conversation_id: number; answer: string }>('/chat', {
        method: 'POST',
        body: { message: question, conversation_id: conversationId },
      });
      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to get response';
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Chat Playground</h1>
          <p className="mt-1 text-white/50">Test your AI chatbot with your uploaded documents.</p>
        </div>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 rounded-[12px] bg-[#1e2353] border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-[#2a2f6e] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden rounded-[16px] border border-white/5 bg-[#1e2353] flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#35ed7e]/20 mb-6 animate-float">
                  <Sparkles className="h-8 w-8 text-[#35ed7e]" />
                </div>
                <h3 className="text-xl font-bold text-white font-display uppercase tracking-wide">Start a conversation</h3>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">
                  Ask a question about your uploaded documents. The AI will answer using only your content.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#35ed7e] mt-1 shadow-lg shadow-[#35ed7e]/20">
                    <Bot className="h-5 w-5 text-black" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-5 py-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#5865f2] text-white rounded-[20px] rounded-br-sm shadow-lg shadow-[#5865f2]/20'
                      : 'bg-[#0a0d3a] text-white/90 rounded-[20px] rounded-bl-sm border border-white/5'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0a0d3a] border border-white/10 mt-1">
                    <User className="h-5 w-5 text-white/50" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#35ed7e] mt-1 shadow-lg shadow-[#35ed7e]/20">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <div className="rounded-[20px] rounded-bl-sm bg-[#0a0d3a] border border-white/5 px-5 py-5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#35ed7e] [animation-delay:0ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#35ed7e] [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#35ed7e] [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#0a0d3a]/50 border-t border-white/5">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents…"
              disabled={loading}
              className="flex-1 h-14 rounded-[16px] border-white/10 bg-[#1e2353] pl-5 pr-14 text-white placeholder:text-white/30 focus:border-[#5865f2] focus:ring-[#5865f2]/30"
              autoComplete="off"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5865f2] text-white hover:bg-[#4752c4] transition-colors disabled:opacity-50 disabled:hover:bg-[#5865f2]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
