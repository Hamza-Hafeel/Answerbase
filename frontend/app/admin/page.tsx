'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, FileText, MessageSquare, DollarSign, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface AdminStats {
  orgs: number;
  users: number;
  documents: number;
  messages: number;
  paying_orgs: number;
  mrr_cents: number;
  daily: { day: string; messages: number }[];
}

interface Org {
  id: number;
  name: string;
  slug: string;
  plan: string;
  subscription_status: string | null;
  monthly_message_limit: number;
  created_at: string;
  user_count: number;
  doc_count: number;
  messages_used: number;
}

export default function AdminPage() {
  const { data: stats, isLoading: loadingStats } = useSWR<AdminStats>('/admin/stats', swrFetcher);
  const { data: orgs, isLoading: loadingOrgs } = useSWR<Org[]>('/admin/orgs', swrFetcher);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Admin</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of all tenants, usage, and revenue.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Organizations', value: stats?.orgs, icon: Building2, color: 'text-chart-1', bg: 'bg-chart-1/10' },
          { label: 'Users', value: stats?.users, icon: Users, color: 'text-chart-2', bg: 'bg-chart-2/10' },
          { label: 'Documents', value: stats?.documents, icon: FileText, color: 'text-chart-3', bg: 'bg-chart-3/10' },
          { label: 'Messages', value: stats?.messages, icon: MessageSquare, color: 'text-chart-4', bg: 'bg-chart-4/10' },
          {
            label: 'MRR',
            value: stats ? `$${(stats.mrr_cents / 100).toFixed(0)}` : undefined,
            icon: DollarSign,
            color: 'text-chart-5',
            bg: 'bg-chart-5/10',
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? <div className="h-7 w-16 animate-pulse rounded bg-muted" /> : (s.value ?? '—')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform message chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Platform Messages (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="h-64 animate-pulse rounded bg-muted" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 270)" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d: string) => d.slice(5)}
                  tick={{ fill: 'oklch(0.65 0.02 270)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'oklch(0.65 0.02 270)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(0.17 0.02 270)',
                    border: '1px solid oklch(0.28 0.03 270)',
                    borderRadius: '8px',
                    color: 'oklch(0.95 0.01 270)',
                  }}
                />
                <Bar dataKey="messages" fill="oklch(0.65 0.25 270)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Org table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrgs ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium text-right">Users</th>
                    <th className="pb-3 font-medium text-right">Docs</th>
                    <th className="pb-3 font-medium text-right">Messages</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(orgs || []).map((org) => (
                    <tr key={org.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                      <td className="py-3 font-medium">
                        <div>{org.name}</div>
                        <div className="text-xs text-muted-foreground">{org.slug}</div>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary" className="capitalize">{org.plan}</Badge>
                      </td>
                      <td className="py-3 text-right">{org.user_count}</td>
                      <td className="py-3 text-right">{org.doc_count}</td>
                      <td className="py-3 text-right">
                        {org.messages_used} / {org.monthly_message_limit}
                      </td>
                      <td className="py-3">
                        {org.subscription_status ? (
                          <Badge variant="success" className="capitalize">{org.subscription_status}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
