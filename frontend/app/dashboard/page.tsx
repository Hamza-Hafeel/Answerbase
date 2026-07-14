'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, MessagesSquare, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface Analytics {
  daily: { day: string; messages: number }[];
  totals: { documents: number; conversations: number; total_messages: number };
  top_questions: { content: string; times: number }[];
  plan: string;
  limit: number;
  used: number;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR<Analytics>('/analytics', swrFetcher);

  const usagePercent = data ? Math.min((data.used / data.limit) * 100, 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Dashboard</h1>
        <p className="mt-2 text-white/50">
          Welcome back{user?.name ? `, ${user.name}` : ''}. Here&apos;s your overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Documents',
            value: data?.totals.documents ?? '—',
            icon: FileText,
            color: 'text-[#5865f2]',
            bg: 'bg-[#5865f2]/10',
          },
          {
            label: 'Conversations',
            value: data?.totals.conversations ?? '—',
            icon: MessagesSquare,
            color: 'text-[#ec48bd]',
            bg: 'bg-[#ec48bd]/10',
          },
          {
            label: 'Total Messages',
            value: data?.totals.total_messages ?? '—',
            icon: MessageSquare,
            color: 'text-[#35ed7e]',
            bg: 'bg-[#35ed7e]/10',
          },
          {
            label: 'Usage This Month',
            value: data ? `${data.used} / ${data.limit}` : '—',
            icon: TrendingUp,
            color: 'text-[#00b0f4]',
            bg: 'bg-[#00b0f4]/10',
          },
        ].map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-[16px] bg-[#1e2353] border border-white/5 p-5 sm:p-6">
            <div className="flex flex-row items-center justify-between pb-4">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                {stat.label}
              </h3>
              <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white font-display">
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse rounded-[8px] bg-white/10" />
              ) : (
                stat.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Usage + Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message Chart */}
        <div className="lg:col-span-2 rounded-[16px] bg-[#1e2353] border border-white/5 min-w-0">
          <div className="p-5 sm:p-6 pb-2">
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Messages (Last 14 Days)</h3>
          </div>
          <div className="p-5 sm:p-6 pt-0 sm:pt-4">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-[12px] bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(d: string) => d.slice(5)}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      background: '#0a0d3a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Bar dataKey="messages" fill="#5865f2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Plan & Usage */}
        <div className="rounded-[16px] bg-[#1e2353] border border-white/5 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide mb-6">Plan & Usage</h3>
          
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/50">Current Plan</span>
                <div className="rounded-[8px] bg-[#ec48bd] px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  {data?.plan || user?.plan || 'free'}
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/50">Messages Used</span>
                <span className="text-sm font-bold text-white">{data?.used ?? 0} / {data?.limit ?? 50}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#0a0d3a] overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-[#ed4245]' : 'bg-[#35ed7e]'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usagePercent >= 80 && (
                <p className="mt-3 text-xs font-bold text-[#ed4245] uppercase tracking-wider">
                  ⚠️ Approaching monthly limit
                </p>
              )}
            </div>

            {/* Top Questions */}
            <div className="pt-2 border-t border-white/5">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Top Questions</h4>
              {data?.top_questions && data.top_questions.length > 0 ? (
                <ul className="space-y-3">
                  {data.top_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 mt-0.5 rounded bg-[#5865f2]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#5865f2]">
                        {q.times}×
                      </span>
                      <span className="text-white/70 line-clamp-2 leading-snug">{q.content}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/40 italic">No questions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
