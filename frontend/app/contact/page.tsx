'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
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
        <h1 className="text-5xl font-extrabold uppercase font-display mb-8 text-[#5865f2]">Contact / Support</h1>
        <p className="text-lg text-white/80 font-medium mb-12">
          Have a question or need help setting up your AnswerBase agent? We're here for you. Reach out to us through any of the channels below.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-[#1e2353] rounded-[24px] p-8 border border-white/10 flex flex-col items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#5865f2] flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold uppercase font-display text-white mb-1">General Support</h3>
              <a href="mailto:support@answerbase.nexusmod.works" className="text-[#35ed7e] hover:underline font-medium">support@answerbase.nexusmod.works</a>
            </div>
          </div>

          <div className="bg-[#1e2353] rounded-[24px] p-8 border border-white/10 flex flex-col items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#ec48bd] flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold uppercase font-display text-white mb-1">Legal & Privacy</h3>
              <a href="mailto:legal@answerbase.nexusmod.works" className="text-white/70 hover:text-white transition-colors block mb-1">legal@answerbase.nexusmod.works</a>
              <a href="mailto:privacy@answerbase.nexusmod.works" className="text-white/70 hover:text-white transition-colors block">privacy@answerbase.nexusmod.works</a>
            </div>
          </div>

          <div className="bg-[#1e2353] rounded-[24px] p-8 border border-white/10 flex flex-col items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#35ed7e] flex items-center justify-center">
              <Phone className="h-6 w-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold uppercase font-display text-white mb-1">Phone Support</h3>
              <a href="tel:+918660705620" className="text-white/80 font-medium">+91 86607 05620</a>
            </div>
          </div>

          <div className="bg-[#1e2353] rounded-[24px] p-8 border border-white/10 flex flex-col items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
              <MapPin className="h-6 w-6 text-[#5865f2]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold uppercase font-display text-white mb-1">Address</h3>
              <p className="text-white/80 font-medium leading-relaxed">
                Mangalore<br />
                Karnataka<br />
                India
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
