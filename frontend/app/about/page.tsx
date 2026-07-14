'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden font-sans" style={{ background: '#0a0d3a' }}>
      <nav className="border-b border-white/10 bg-[#1e2353]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#5865f2]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-display text-white">AnswerBase</span>
          </Link>
          <Link href="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-20 text-white">
        <h1 className="text-5xl font-extrabold uppercase font-display mb-8 text-[#5865f2]">About Us</h1>
        <div className="space-y-6 text-lg leading-relaxed text-white/80 font-medium">
          <p>
            Welcome to <span className="font-bold text-white">AnswerBase</span>. We believe that customer support should be instant, accurate, and completely frictionless.
          </p>
          <p>
            Too often, companies force their customers to wait in long queues or deal with unhelpful, hallucinating chatbots that don't actually know the product. We set out to fix that by building an AI agent that grounds every single response in your actual documentation.
          </p>
          <p>
            AnswerBase was built to empower teams to turn their existing knowledge base, help articles, and PDFs into a 24/7 support powerhouse. With zero coding required, you can embed a world-class AI agent directly into your website.
          </p>
          <p>
            We are based in <span className="font-bold text-white">Mangalore, Karnataka, India</span> and are constantly working to push the boundaries of what automated customer support can do.
          </p>
        </div>
      </main>
    </div>
  );
}
