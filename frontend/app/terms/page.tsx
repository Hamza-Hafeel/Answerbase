'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
        <h1 className="text-5xl font-extrabold uppercase font-display mb-8 text-[#5865f2]">Terms of Service</h1>
        
        <div className="space-y-8 text-white/80 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using AnswerBase ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Service, you shall be subject to any posted guidelines or rules applicable to such services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Provision of Services</h2>
            <p>AnswerBase provides an AI-powered customer support chatbot platform. We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice at any time. You agree that AnswerBase shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
            <p>You agree to not use the Service to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.</li>
              <li>Harm minors in any way.</li>
              <li>Impersonate any person or entity.</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are owned by AnswerBase and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p className="mt-2 text-[#35ed7e]">legal@answerbase.nexusmod.works</p>
          </section>
        </div>
      </main>
    </div>
  );
}
