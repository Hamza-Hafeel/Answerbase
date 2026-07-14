'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { useDropzone } from 'react-dropzone';
import { api, swrFetcher, ApiError } from '@/lib/api';
import { Upload, FileText, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Doc {
  id: number;
  filename: string;
  status: string;
  error: string | null;
  chunk_count: number;
  created_at: string;
}

export default function DocumentsPage() {
  const { data: docs, isLoading } = useSWR<Doc[]>('/documents', swrFetcher, { refreshInterval: 3000 });
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    for (const file of files) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', file);
        await api('/documents', { method: 'POST', body: form });
        toast.success(`"${file.name}" uploaded — processing…`);
        mutate('/documents');
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  async function handleDelete(id: number) {
    try {
      await api(`/documents/${id}`, { method: 'DELETE' });
      toast.success('Document deleted');
      mutate('/documents');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ready': 
        return <span className="rounded-[8px] bg-[#35ed7e]/20 px-2 py-0.5 text-[10px] font-bold text-[#35ed7e] uppercase tracking-wider">Ready</span>;
      case 'processing': 
        return <span className="rounded-[8px] bg-[#ec48bd]/20 px-2 py-0.5 text-[10px] font-bold text-[#ec48bd] uppercase tracking-wider">Processing</span>;
      case 'failed': 
        return <span className="rounded-[8px] bg-[#ed4245]/20 px-2 py-0.5 text-[10px] font-bold text-[#ed4245] uppercase tracking-wider">Failed</span>;
      default: 
        return <span className="rounded-[8px] bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Documents</h1>
        <p className="mt-2 text-white/50">
          Upload your knowledge base. We&apos;ll chunk, embed, and index it for AI search.
        </p>
      </div>

      {/* Drop zone */}
      <div className="rounded-[16px] bg-[#1e2353] border border-white/5 overflow-hidden">
        <div className="p-8">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-4 cursor-pointer rounded-[12px] border-2 border-dashed border-[#5865f2]/30 py-16 transition-all hover:border-[#5865f2] hover:bg-[#5865f2]/5 ${
              isDragActive ? 'bg-[#5865f2]/10 border-[#5865f2]' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className={`flex h-16 w-16 items-center justify-center rounded-[16px] transition-colors ${isDragActive ? 'bg-[#5865f2] text-white' : 'bg-[#5865f2]/20 text-[#5865f2]'}`}>
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white font-display uppercase tracking-wide">
                {isDragActive ? 'Drop files here…' : 'Drag & drop files here, or click to browse'}
              </p>
              <p className="mt-2 text-sm text-white/40">
                PDF, TXT, MD, CSV — up to 10 MB each
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="rounded-[16px] bg-[#1e2353] border border-white/5">
        <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-display tracking-wide">Your Documents</h3>
        </div>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-[12px] bg-white/5" />
              ))}
            </div>
          ) : !docs || docs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-white/40">
              <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/5 mb-4">
                <FileText className="h-8 w-8 text-white/20" />
              </div>
              <p className="font-bold text-white font-display uppercase tracking-wide">No documents yet</p>
              <p className="text-sm mt-2">Upload your first document to start training your chatbot.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-[12px] border border-white/5 bg-[#0a0d3a]/30 p-4 transition-all hover:bg-[#5865f2]/10 hover:border-[#5865f2]/30"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#5865f2]/20">
                    <FileText className="h-6 w-6 text-[#5865f2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{doc.filename}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {statusBadge(doc.status)}
                      {doc.chunk_count > 0 && (
                        <span className="text-[11px] font-medium text-white/40">{doc.chunk_count} chunks</span>
                      )}
                      <span className="text-[11px] font-medium text-white/40">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {doc.error && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-[#ed4245]">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {doc.error}
                      </div>
                    )}
                  </div>
                  <button
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-white/30 hover:bg-[#ed4245]/10 hover:text-[#ed4245] transition-colors"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
