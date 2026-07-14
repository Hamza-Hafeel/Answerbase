'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { api, swrFetcher, ApiError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Key, Plus, Trash2, Copy, Check, Code } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: number;
  key_prefix: string;
  name: string;
  active: boolean;
  created_at: string;
}

export default function ApiKeysPage() {
  const { data: keys, isLoading } = useSWR<ApiKey[]>('/keys', swrFetcher);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const data = await api<ApiKey & { key: string }>('/keys', {
        method: 'POST',
        body: { name: name.trim() },
      });
      setNewKey(data.key);
      setName('');
      mutate('/keys');
      toast.success('API key created');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: number) {
    try {
      await api(`/keys/${id}`, { method: 'DELETE' });
      toast.success('Key revoked');
      mutate('/keys');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to revoke key');
    }
  }

  function copyKey(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  }

  const embedSnippet = newKey
    ? `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js" data-api-key="${newKey}"></script>`
    : '';

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">API Keys</h1>
        <p className="mt-2 text-white/50">
          Create API keys to embed the chat widget on your website.
        </p>
      </div>

      {/* Create key */}
      <div className="rounded-[16px] bg-[#1e2353] border border-white/5">
        <div className="p-4 sm:p-6 border-b border-white/5">
          <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Create New Key</h3>
          <p className="mt-1 text-xs text-white/50">Give your key a memorable name so you can identify it later.</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="key-name" className="sr-only">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Production Widget"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-[12px] border-white/10 bg-[#0a0d3a] text-white placeholder:text-white/25 focus:border-[#5865f2] focus:ring-[#5865f2]/30"
              />
            </div>
            <button 
              onClick={handleCreate} 
              disabled={creating || !name.trim()}
              className="flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#5865f2] px-6 text-sm font-bold text-white hover:bg-[#4752c4] transition-colors disabled:opacity-50 disabled:hover:bg-[#5865f2]"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>

          {/* Show new key */}
          {newKey && (
            <div className="mt-6 space-y-4 rounded-[12px] border border-[#35ed7e]/30 bg-[#35ed7e]/5 p-5">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#35ed7e]" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">Your new API key</span>
              </div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">⚠️ Copy this key now — it won&apos;t be shown again.</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 overflow-x-auto rounded-[8px] bg-[#0a0d3a] px-4 py-3 text-xs font-mono text-white/90 border border-white/10">
                  {newKey}
                </code>
                <button 
                  onClick={() => copyKey(newKey)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#1e2353] border border-white/10 text-white hover:bg-[#2a2f6e] transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-[#35ed7e]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Embed snippet */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-[#0a0d3a] px-4 py-2.5 text-xs font-bold text-white hover:bg-white/5 transition-colors">
                    <Code className="h-4 w-4" />
                    Get Embed Code
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#1e2353] border-white/10 text-white sm:rounded-[20px]">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold uppercase font-display">Embed Code</DialogTitle>
                    <DialogDescription className="text-white/50">
                      Paste this script tag before the closing &lt;/body&gt; tag of your website.
                    </DialogDescription>
                  </DialogHeader>
                  <pre className="mt-4 overflow-x-auto rounded-[12px] bg-[#0a0d3a] p-4 text-xs font-mono border border-white/10 text-white/90">
                    {embedSnippet}
                  </pre>
                  <DialogFooter className="mt-6">
                    <button 
                      onClick={() => copyKey(embedSnippet)}
                      className="flex items-center justify-center gap-2 rounded-[10px] bg-[#5865f2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#4752c4] transition-colors w-full sm:w-auto"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Key list */}
      <div className="rounded-[16px] bg-[#1e2353] border border-white/5">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-bold text-white uppercase font-display tracking-wide">Your API Keys</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-[12px] bg-white/5" />
              ))}
            </div>
          ) : !keys || keys.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-white/40">
              <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/5 mb-4">
                <Key className="h-8 w-8 text-white/20" />
              </div>
              <p className="font-bold text-white font-display uppercase tracking-wide">No API keys yet</p>
              <p className="text-sm mt-2">Create your first key above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-4 rounded-[12px] border border-white/5 bg-[#0a0d3a]/30 p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#00b0f4]/20">
                    <Key className="h-6 w-6 text-[#00b0f4]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-white">{k.name}</p>
                      {!k.active && <span className="rounded-[8px] bg-[#ed4245]/20 px-2 py-0.5 text-[10px] font-bold text-[#ed4245] uppercase tracking-wider">Revoked</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <code className="rounded-[6px] bg-[#0a0d3a] px-2 py-1 text-[11px] text-white/70 font-mono border border-white/10">
                        {k.key_prefix}…
                      </code>
                      <span className="text-[11px] font-medium text-white/40">
                        Created {new Date(k.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {k.active && (
                    <button
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-white/30 hover:bg-[#ed4245]/10 hover:text-[#ed4245] transition-colors"
                      onClick={() => handleRevoke(k.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
