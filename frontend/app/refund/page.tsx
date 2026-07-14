'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function RefundPage() {
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
        <h1 className="text-5xl font-extrabold uppercase font-display mb-8 text-[#5865f2]">Refund & Cancellation Policy</h1>
        
        <div className="space-y-8 text-white/80 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Subscription Cancellations</h2>
            <p>You can cancel your AnswerBase subscription at any time. Your cancellation will take effect at the end of the current paid term. You will retain access to the Service through the end of your billing period.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Refund Policy</h2>
            <p>We stand behind our products and your satisfaction with them is important to us. However, because our products are digital goods delivered via Internet download or cloud access we generally offer no refunds.</p>
            <p className="mt-4">If you change your mind about your purchase and you have not used the service extensively, we will happily issue you a refund upon your request made within 14 days of your original purchase.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Exceptions</h2>
            <p>Refunds are not granted in the following situations:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>You have consumed a significant portion of your API credits or message limits.</li>
              <li>You are on a custom Business plan (subject to individual contract terms).</li>
              <li>You request a refund after the 14-day window has passed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Requesting a Refund</h2>
            <p>To request a refund, please contact us at:</p>
            <p className="mt-2 text-[#35ed7e]">support@answerbase.nexusmod.works</p>
            <p className="mt-4">Please include your account email and the reason for your request. We will review and process your refund request within 5-7 business days.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
