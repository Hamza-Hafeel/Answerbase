'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, FileText, MessageSquare, MessagesSquare,
  Key, Settings, CreditCard, LogOut, Sparkles, ChevronRight, Loader2, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/documents', icon: FileText, label: 'Documents' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat Playground' },
  { href: '/dashboard/conversations', icon: MessagesSquare, label: 'Conversations' },
  { href: '/dashboard/keys', icon: Key, label: 'API Keys' },
  { href: '/dashboard/widget', icon: Settings, label: 'Widget Settings' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#0a0d3a' }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#5865f2]" />
      </div>
    );
  }

  if (!user) return null;

  const SidebarContent = () => (
    <>
      <div className="px-4 py-3">
        <div className="rounded-[12px] bg-[#0a0d3a]/30 px-3 py-2 border border-white/5">
          <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.15em]">Organization</div>
          <div className="text-sm font-semibold text-white truncate mt-0.5">{user.org_name || (user.name ? `${user.name}'s Organization` : 'My Organization')}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-[#5865f2] text-white'
                  : 'text-white/50 hover:bg-[#1e2353] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5865f2]/20 text-[#5865f2] text-xs font-bold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{user.name}</div>
            <div className="text-xs text-white/30 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 rounded-[12px] bg-[#0a0d3a]/30 border border-white/5 px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-[#252a60] transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0d3a' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5" style={{ background: '#1e2353' }}>
        <div className="flex h-16 items-center gap-2 px-6 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5865f2]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white font-display">AnswerBase</span>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex w-72 max-w-[80vw] flex-col border-r border-white/5 h-full z-50 animate-slide-right" style={{ background: '#1e2353' }}>
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5865f2]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white font-display">AnswerBase</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#0a0d3a' }}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between border-b border-white/5 px-4 py-3 sticky top-0 z-40" style={{ background: '#1e2353' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="text-white">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#5865f2]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white font-display tracking-tight">AnswerBase</span>
          </div>
          <button onClick={signOut} className="text-white/40 hover:text-white transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
