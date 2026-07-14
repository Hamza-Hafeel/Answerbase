'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Save, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function WidgetSettingsPage() {
  const { user, refresh } = useAuth();
  const [widgetName, setWidgetName] = useState('');
  const [widgetWelcome, setWidgetWelcome] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setWidgetName(user.widget_name || 'Support Assistant');
      setWidgetWelcome(user.widget_welcome || 'Hi! Ask me anything about our product.');
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/widget/settings', {
        method: 'PATCH',
        body: { widget_name: widgetName, widget_welcome: widgetWelcome },
      });
      await refresh();
      toast.success('Widget settings saved');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const inputClasses = "rounded-[12px] border-white/10 bg-[#0a0d3a] text-white placeholder:text-white/25 focus:border-[#5865f2] focus:ring-[#5865f2]/30";

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Widget Settings</h1>
        <p className="mt-2 text-white/50">
          Customize how your chat widget appears to customers.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Settings form */}
        <div className="rounded-[16px] bg-[#1e2353] border border-white/5 h-fit">
          <div className="p-4 sm:p-6 border-b border-white/5">
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Appearance</h3>
            <p className="mt-1 text-xs text-white/50">These settings affect the embedded chat widget on your site.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="widget-name" className="text-white/70 text-xs font-bold uppercase tracking-wider">Bot Name</Label>
                <Input
                  id="widget-name"
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder="Support Assistant"
                  maxLength={60}
                  className={`${inputClasses} h-12`}
                />
                <p className="text-[11px] text-white/40">Shown in the chat header and messages.</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="widget-welcome" className="text-white/70 text-xs font-bold uppercase tracking-wider">Welcome Message</Label>
                <Textarea
                  id="widget-welcome"
                  value={widgetWelcome}
                  onChange={(e) => setWidgetWelcome(e.target.value)}
                  placeholder="Hi! Ask me anything about our product."
                  maxLength={300}
                  rows={4}
                  className={`${inputClasses} resize-none pt-3`}
                />
                <p className="text-[11px] text-white/40">First message customers see when they open the widget.</p>
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-[12px] bg-[#5865f2] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#4752c4] transition-colors w-full disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </button>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-[16px] bg-[#1e2353] border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#0a0d3a]/50">
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Preview</h3>
          </div>
          <div className="p-8 bg-gradient-to-b from-[#1e2353] to-[#0a0d3a] flex items-center justify-center min-h-[400px]">
            <div className="w-full max-w-[320px] rounded-[24px] border border-white/10 bg-[#0a0d3a] shadow-2xl overflow-hidden flex flex-col h-[400px]">
              {/* Widget header */}
              <div className="bg-[#5865f2] px-5 py-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/20 shadow-inner">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold text-white font-display">
                    {widgetName || 'Support Assistant'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-[#35ed7e] shadow-[0_0_8px_#35ed7e]" />
                    <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>

              {/* Widget body */}
              <div className="flex-1 p-5 overflow-y-auto bg-[#0a0d3a]">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#35ed7e]">
                    <Bot className="h-4 w-4 text-black" />
                  </div>
                  <div className="rounded-[16px] rounded-tl-sm bg-[#1e2353] border border-white/5 px-4 py-3 text-sm text-white/90 max-w-[85%] leading-relaxed shadow-sm">
                    {widgetWelcome || 'Hi! Ask me anything about our product.'}
                  </div>
                </div>
              </div>

              {/* Widget input */}
              <div className="border-t border-white/10 p-4 bg-[#0a0d3a]">
                <div className="relative flex items-center">
                  <div className="flex-1 rounded-[14px] bg-[#1e2353] border border-white/5 px-4 py-3 text-sm text-white/30 truncate">
                    Type a message…
                  </div>
                  <div className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5865f2] text-white">
                    <Send className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
