'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, MessagesSquare, TrendingUp, ArrowUpRight, Zap, Crown } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
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

  const planColors: Record<string, string> = {
    free: 'from-white/10 to-white/5 text-white/80',
    pro: 'from-[#5865f2] to-[#7c3aed] text-white',
    business: 'from-[#ec48bd] to-[#f97316] text-white',
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Dashboard</h1>
          <p className="mt-2 text-white/50">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Here&apos;s your overview.
          </p>
        </div>
        <Link
          href="/dashboard/documents"
          className="flex items-center gap-2 rounded-[12px] bg-[#5865f2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#4752c4] transition-all hover:shadow-lg hover:shadow-[#5865f2]/25 shrink-0"
        >
          <Zap className="h-4 w-4" />
          Upload Documents
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Documents',
            value: data?.totals.documents ?? '—',
            icon: FileText,
            gradient: 'from-[#5865f2]/20 to-[#5865f2]/5',
            color: 'text-[#5865f2]',
            iconBg: 'bg-[#5865f2]/15',
            glow: 'shadow-[#5865f2]/10',
            href: '/dashboard/documents',
          },
          {
            label: 'Conversations',
            value: data?.totals.conversations ?? '—',
            icon: MessagesSquare,
            gradient: 'from-[#ec48bd]/20 to-[#ec48bd]/5',
            color: 'text-[#ec48bd]',
            iconBg: 'bg-[#ec48bd]/15',
            glow: 'shadow-[#ec48bd]/10',
            href: '/dashboard/conversations',
          },
          {
            label: 'Total Messages',
            value: data?.totals.total_messages ?? '—',
            icon: MessageSquare,
            gradient: 'from-[#35ed7e]/20 to-[#35ed7e]/5',
            color: 'text-[#35ed7e]',
            iconBg: 'bg-[#35ed7e]/15',
            glow: 'shadow-[#35ed7e]/10',
            href: '/dashboard/chat',
          },
          {
            label: 'Usage This Month',
            value: data ? `${data.used} / ${data.limit}` : '—',
            icon: TrendingUp,
            gradient: 'from-[#00b0f4]/20 to-[#00b0f4]/5',
            color: 'text-[#00b0f4]',
            iconBg: 'bg-[#00b0f4]/15',
            glow: 'shadow-[#00b0f4]/10',
            href: '/dashboard/billing',
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group relative overflow-hidden rounded-[16px] bg-gradient-to-br ${stat.gradient} border border-white/[0.06] p-5 sm:p-6 transition-all duration-300 hover:border-white/15 hover:shadow-xl ${stat.glow} hover:scale-[1.02]`}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex flex-row items-center justify-between pb-4">
                <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">
                  {stat.label}
                </h3>
                <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl md:text-3xl font-extrabold text-white font-display">
                  {isLoading ? (
                    <div className="h-8 w-24 animate-pulse rounded-[8px] bg-white/10" />
                  ) : (
                    stat.value
                  )}
                </div>
                <ArrowUpRight className={`h-4 w-4 ${stat.color} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + Plan */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message Chart */}
        <div className="lg:col-span-2 rounded-[16px] bg-[#1e2353]/80 backdrop-blur-sm border border-white/[0.06] min-w-0">
          <div className="p-5 sm:p-6 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Message Volume</h3>
              <p className="text-[11px] text-white/40 mt-1">Last 14 days</p>
            </div>
            {data && (
              <div className="text-right">
                <div className="text-xl font-extrabold text-white font-display">{data.totals.total_messages}</div>
                <div className="text-[11px] text-white/40">total messages</div>
              </div>
            )}
          </div>
          <div className="p-5 sm:p-6 pt-2">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-[12px] bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data?.daily || []}>
                  <defs>
                    <linearGradient id="msgGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5865f2" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#5865f2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(d: string) => d.slice(5)}
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    width={30}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(88,101,242,0.3)', strokeWidth: 1 }}
                    contentStyle={{
                      background: 'rgba(10,13,58,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(12px)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#5865f2"
                    strokeWidth={2.5}
                    fill="url(#msgGradient)"
                    dot={{ fill: '#5865f2', strokeWidth: 0, r: 3 }}
                    activeDot={{ fill: '#5865f2', strokeWidth: 2, stroke: '#fff', r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Plan & Usage */}
        <div className="rounded-[16px] bg-[#1e2353]/80 backdrop-blur-sm border border-white/[0.06] p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Plan & Usage</h3>
            <Link href="/dashboard/billing" className="text-[11px] text-[#5865f2] font-bold uppercase tracking-wider hover:text-[#7c8af2] transition-colors">
              Upgrade →
            </Link>
          </div>
          
          <div className="space-y-6 flex-1">
            {/* Current Plan Badge */}
            <div className="rounded-[12px] bg-[#0a0d3a]/50 border border-white/[0.06] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br ${planColors[data?.plan || 'free'] || planColors.free}`}>
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider">Current Plan</div>
                    <div className="text-base font-bold text-white capitalize">{data?.plan || user?.plan || 'Free'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Usage Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Messages Used</span>
                <span className="text-sm font-bold text-white tabular-nums">{data?.used ?? 0} <span className="text-white/30 font-normal">/ {data?.limit ?? 50}</span></span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#0a0d3a]/80 overflow-hidden border border-white/[0.04]">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    usagePercent >= 90 
                      ? 'bg-gradient-to-r from-[#ed4245] to-[#f97316]' 
                      : usagePercent >= 60 
                        ? 'bg-gradient-to-r from-[#f97316] to-[#fbbf24]'
                        : 'bg-gradient-to-r from-[#35ed7e] to-[#00b0f4]'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usagePercent >= 80 && (
                <p className="mt-2 text-[11px] font-bold text-[#ed4245] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ed4245] animate-pulse" />
                  Approaching monthly limit
                </p>
              )}
            </div>

            {/* Top Questions */}
            <div className="pt-4 border-t border-white/[0.06] flex-1">
              <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.12em] mb-4">Top Questions</h4>
              {data?.top_questions && data.top_questions.length > 0 ? (
                <ul className="space-y-2.5">
                  {data.top_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm group">
                      <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#5865f2]/10 text-[10px] font-bold text-[#5865f2] tabular-nums">
                        {q.times}×
                      </span>
                      <span className="text-white/60 line-clamp-2 leading-snug group-hover:text-white/80 transition-colors">{q.content}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <MessageSquare className="h-8 w-8 text-white/10 mb-2" />
                  <p className="text-sm text-white/30">No questions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
