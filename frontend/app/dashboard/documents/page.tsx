'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { useDropzone } from 'react-dropzone';
import { api, swrFetcher, ApiError } from '@/lib/api';
import { Upload, FileText, Trash2, Loader2, AlertCircle, CheckCircle2, Clock, Image } from 'lucide-react';
import { toast } from 'sonner';

interface Doc {
  id: number;
  filename: string;
  status: string;
  error: string | null;
  chunk_count: number;
  created_at: string;
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return Image;
  return FileText;
}

function getFileColor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return { icon: 'text-[#ed4245]', bg: 'bg-[#ed4245]/10' };
    case 'png': case 'jpg': case 'jpeg': return { icon: 'text-[#ec48bd]', bg: 'bg-[#ec48bd]/10' };
    case 'csv': return { icon: 'text-[#35ed7e]', bg: 'bg-[#35ed7e]/10' };
    default: return { icon: 'text-[#5865f2]', bg: 'bg-[#5865f2]/10' };
  }
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
        toast.error(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
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
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  async function handleDelete(id: number) {
    try {
      await api(`/documents/${id}`, { method: 'DELETE' });
      toast.success('Document deleted');
      mutate('/documents');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete document. Please try again.');
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ready': 
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#35ed7e]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#35ed7e] uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </span>
        );
      case 'processing': 
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ec48bd]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#ec48bd] uppercase tracking-wider">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </span>
        );
      case 'failed': 
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ed4245]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#ed4245] uppercase tracking-wider">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default: 
        return <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">{status}</span>;
    }
  };

  const readyCount = docs?.filter(d => d.status === 'ready').length ?? 0;
  const processingCount = docs?.filter(d => d.status === 'processing').length ?? 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Documents</h1>
          <p className="mt-2 text-white/50">
            Upload your knowledge base. We&apos;ll chunk, embed, and index it for AI search.
          </p>
        </div>
        {docs && docs.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#35ed7e]" />
              {readyCount} ready
            </span>
            {processingCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ec48bd] animate-pulse" />
                {processingCount} processing
              </span>
            )}
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div className="rounded-[16px] bg-[#1e2353]/80 backdrop-blur-sm border border-white/[0.06] overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div
            {...getRootProps()}
            className={`relative flex flex-col items-center justify-center gap-4 cursor-pointer rounded-[14px] border-2 border-dashed py-10 sm:py-14 px-4 transition-all duration-300 ${
              isDragActive 
                ? 'bg-[#5865f2]/10 border-[#5865f2] scale-[1.01]' 
                : 'border-white/10 hover:border-[#5865f2]/50 hover:bg-[#5865f2]/[0.03]'
            }`}
          >
            <input {...getInputProps()} />
            <div className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-[14px] transition-all duration-300 ${
              isDragActive 
                ? 'bg-[#5865f2] text-white shadow-lg shadow-[#5865f2]/30 scale-110' 
                : 'bg-gradient-to-br from-[#5865f2]/20 to-[#5865f2]/10 text-[#5865f2]'
            }`}>
              {uploading ? (
                <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin" />
              ) : (
                <Upload className="h-7 w-7 sm:h-8 sm:w-8" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base font-bold text-white font-display uppercase tracking-wide">
                {isDragActive ? 'Drop files here…' : 'Drag & drop files here, or click to browse'}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-white/35">
                PDF, TXT, MD, CSV, PNG, JPG — up to 10 MB each
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="rounded-[16px] bg-[#1e2353]/80 backdrop-blur-sm border border-white/[0.06]">
        <div className="p-4 sm:p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-display tracking-wide">Your Documents</h3>
          {docs && docs.length > 0 && (
            <span className="text-[11px] text-white/30 tabular-nums">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[72px] animate-pulse rounded-[12px] bg-white/[0.03]" />
              ))}
            </div>
          ) : !docs || docs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/[0.04] mb-4">
                <FileText className="h-8 w-8 text-white/15" />
              </div>
              <p className="font-bold text-white font-display uppercase tracking-wide">No documents yet</p>
              <p className="text-sm mt-2 text-white/35">Upload your first document to start training your chatbot.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => {
                const FileIcon = getFileIcon(doc.filename);
                const fileColor = getFileColor(doc.filename);
                return (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-3 sm:gap-4 rounded-[12px] border border-white/[0.04] bg-[#0a0d3a]/30 p-3 sm:p-4 transition-all duration-200 hover:bg-[#5865f2]/[0.06] hover:border-white/[0.08]"
                  >
                    <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-[10px] ${fileColor.bg} transition-transform duration-200 group-hover:scale-105`}>
                      <FileIcon className={`h-5 w-5 sm:h-5.5 sm:w-5.5 ${fileColor.icon}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{doc.filename}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                        {statusBadge(doc.status)}
                        {doc.chunk_count > 0 && (
                          <span className="text-[11px] font-medium text-white/30 tabular-nums">{doc.chunk_count} chunks</span>
                        )}
                        <span className="text-[11px] font-medium text-white/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.error && (
                        <div className="flex items-start gap-1.5 mt-2 text-xs text-[#ed4245]/80">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="break-all line-clamp-2">{doc.error}</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-[8px] text-white/20 hover:bg-[#ed4245]/10 hover:text-[#ed4245] transition-all duration-200 opacity-0 group-hover:opacity-100"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
