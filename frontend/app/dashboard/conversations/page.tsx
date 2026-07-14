'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api, swrFetcher } from '@/lib/api';
import { MessagesSquare, ChevronRight, ArrowLeft, Bot, User } from 'lucide-react';

interface Conversation {
  id: number;
  source: string;
  visitor_id: string | null;
  created_at: string;
  message_count: number;
  first_question: string | null;
}

interface ConvDetail {
  id: number;
  source: string;
  visitor_id: string | null;
  created_at: string;
  messages: { role: string; content: string; created_at: string }[];
}

export default function ConversationsPage() {
  const { data: convos, isLoading } = useSWR<Conversation[]>('/conversations', swrFetcher);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: detail } = useSWR<ConvDetail>(
    selectedId ? `/conversations/${selectedId}` : null,
    swrFetcher
  );

  if (selectedId && detail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedId(null)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#1e2353] text-white/50 hover:bg-[#2a2f6e] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white font-display uppercase tracking-wide">Conversation #{detail.id}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="rounded-[8px] bg-[#ec48bd]/20 px-2 py-0.5 text-[10px] font-bold text-[#ec48bd] uppercase tracking-wider">{detail.source}</span>
              <span className="text-xs text-white/40">
                {new Date(detail.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[16px] bg-[#1e2353] border border-white/5 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {detail.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                  <div className={`text-[10px] mt-2 opacity-50 font-medium ${msg.role === 'user' ? 'text-right text-white/70' : 'text-white/40'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0a0d3a] border border-white/10 mt-1">
                    <User className="h-5 w-5 text-white/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Conversations</h1>
        <p className="mt-2 text-white/50">
          Review customer conversations. Spot gaps in your documentation.
        </p>
      </div>

      <div className="rounded-[16px] bg-[#1e2353] border border-white/5">
        <div className="p-4 sm:p-6 border-b border-white/5">
          <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Recent Conversations</h3>
        </div>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-[12px] bg-white/5" />
              ))}
            </div>
          ) : !convos || convos.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-white/40">
              <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/5 mb-4">
                <MessagesSquare className="h-8 w-8 text-white/20" />
              </div>
              <p className="font-bold text-white font-display uppercase tracking-wide">No conversations yet</p>
              <p className="text-sm mt-2">Conversations will appear here after users start chatting.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {convos.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className="w-full flex items-center gap-4 rounded-[12px] border border-white/5 bg-[#0a0d3a]/30 p-4 text-left transition-all hover:bg-[#ec48bd]/10 hover:border-[#ec48bd]/30 group"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#ec48bd]/20 transition-colors group-hover:bg-[#ec48bd] group-hover:shadow-lg group-hover:shadow-[#ec48bd]/20">
                    <MessagesSquare className="h-6 w-6 text-[#ec48bd] group-hover:text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">
                      {conv.first_question || 'No messages'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="rounded-[8px] bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">{conv.source}</span>
                      <span className="text-[11px] font-medium text-white/40">
                        {conv.message_count} messages
                      </span>
                      <span className="text-[11px] font-medium text-white/40">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-white/30 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
