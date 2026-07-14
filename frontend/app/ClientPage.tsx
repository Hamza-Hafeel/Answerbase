'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Check, ChevronRight, ChevronDown,
  FileText, MessageCircle, Code2, BarChart3, Shield, Zap,
  Clock, Users, Globe, Upload, Bot, Sparkles, Menu, X
} from 'lucide-react';

/* ─── Data ─── */

const STEPS = [
  {
    num: '01',
    title: 'UPLOAD YOUR DOCS',
    desc: 'Drop in PDFs, help articles, product manuals, return policies — anything your customers ask about.',
    icon: Upload,
  },
  {
    num: '02',
    title: 'AI LEARNS YOUR CONTENT',
    desc: 'Our RAG engine chunks, embeds, and indexes every document. Answers are grounded in your actual content — never fabricated.',
    icon: Bot,
  },
  {
    num: '03',
    title: 'EMBED & GO LIVE',
    desc: 'Copy one script tag. Paste it on your site. Your AI agent starts answering customer questions instantly, 24/7.',
    icon: Code2,
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'MULTI-TENANT ISOLATION',
    desc: 'Every organization gets a sandboxed environment. Your data never touches another customer\'s context window.',
  },
  {
    icon: MessageCircle,
    title: 'CONVERSATION MEMORY',
    desc: 'Your chatbot remembers context within a session. Customers ask follow-ups naturally — the AI picks up right where they left off.',
  },
  {
    icon: BarChart3,
    title: 'REAL-TIME ANALYTICS',
    desc: 'Track message volume, top questions, coverage gaps, and peak hours. See what your customers actually need.',
  },
  {
    icon: Zap,
    title: 'SUB-SECOND RESPONSES',
    desc: 'Optimized vector search ensures answers land in under one second. Fast, responsive, and always ready.',
  },
  {
    icon: Globe,
    title: 'WORKS EVERYWHERE',
    desc: 'Shopify, WordPress, Webflow, custom React apps — one script tag, zero configuration, mobile-responsive.',
  },
  {
    icon: Clock,
    title: '24/7 WITHOUT HEADCOUNT',
    desc: 'Your AI agent never sleeps, never misquotes your refund policy. Consistent, accurate support around the clock.',
  },
];

const STATS = [
  { val: '2,400+', label: 'ACTIVE TEAMS' },
  { val: '<0.8s', label: 'AVG RESPONSE' },
  { val: '99.7%', label: 'ACCURACY' },
  { val: '4.2M+', label: 'MESSAGES HANDLED' },
];

const PLANS = [
  {
    name: 'STARTER',
    price: '$0',
    period: '/mo',
    desc: 'Test the waters.',
    features: ['50 messages / month', '5 documents', 'Playground chat', 'Basic analytics'],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    name: 'PRO',
    price: '$29',
    period: '/mo',
    desc: 'For teams who need a real support agent.',
    features: ['2,000 messages / month', 'Unlimited documents', 'Embeddable widget', 'Full API access', 'Priority support', 'Conversation exports'],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'BUSINESS',
    price: '$99',
    period: '/mo',
    desc: 'For companies that demand the best.',
    features: ['10,000 messages / month', 'Unlimited everything', 'Custom branding', 'Advanced analytics', 'Dedicated manager', 'SLA guarantee'],
    cta: 'Contact Sales',
    featured: false,
  },
];

const FAQ = [
  {
    q: 'How accurate are the responses?',
    a: 'AnswerBase uses Retrieval-Augmented Generation (RAG). Every answer is pulled directly from your uploaded documents. If the answer isn\'t in your docs, the chatbot says so — it never guesses or fabricates.',
  },
  {
    q: 'What file formats do you support?',
    a: 'PDF, TXT, Markdown, and CSV. Each file up to 10 MB. We\'re adding Notion imports, Google Docs, and web crawling soon.',
  },
  {
    q: 'Can I customize the chat widget?',
    a: 'Yes. On Pro and above, customize the widget name, colors, greeting, and avatar. Business plans get full white-label branding.',
  },
  {
    q: 'Is my data secure?',
    a: 'We organize your docs into instant, accurate answers inside isolated environments. Your data is encrypted at rest and in transit.',
  },
  {
    q: 'How long does setup take?',
    a: 'Under two minutes. Create an account, upload a document, and you\'re chatting. Embedding the widget takes one copy-paste.',
  },
  {
    q: 'Can I try before I buy?',
    a: 'Starter is completely free — no credit card required. 50 messages/month and 5 documents. The full product, just with lower limits.',
  },
];

/* ─── Page ─── */

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden font-sans" style={{ background: '#5865f2' }}>

      {/* ═══════════════════ NAV ═══════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 relative z-[60]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#5865f2]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-extrabold tracking-tight font-display ${scrolled || mobileMenuOpen ? 'text-black' : 'text-white'}`}>AnswerBase</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className={`text-[15px] font-bold transition-colors ${
                  scrolled 
                    ? 'text-black/80 hover:text-black hover:underline' 
                    : 'text-white hover:underline'
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <Link href="/dashboard">
                <button className={`rounded-[24px] px-4 py-2 text-[14px] font-bold transition-colors ${
                  scrolled
                    ? 'bg-[#5865f2] text-white hover:bg-[#4752c4]'
                    : 'bg-white text-black hover:text-[#5865f2]'
                }`}>
                  Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button className={`rounded-[24px] px-4 py-2 text-[14px] font-bold transition-colors ${
                  scrolled
                    ? 'bg-[#5865f2] text-white hover:bg-[#4752c4]'
                    : 'bg-white text-black hover:text-[#5865f2]'
                }`}>
                  Log In
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden relative z-[60]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-7 w-7 text-black" />
            ) : (
              <Menu className={`h-7 w-7 ${scrolled ? 'text-black' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col justify-center items-center gap-6 px-6 pt-20 pb-10">
            {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold uppercase tracking-wide text-black hover:text-[#5865f2] transition-colors"
              >
                {item}
              </Link>
            ))}
            
            <div className="mt-8 flex flex-col gap-4 w-full max-w-sm">
              {!loading && user ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full rounded-[24px] bg-[#5865f2] px-6 py-3 text-[16px] font-bold text-white hover:bg-[#4752c4] transition-colors shadow-lg">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-[24px] border-2 border-[#5865f2] px-6 py-3 text-[16px] font-bold text-[#5865f2] hover:bg-[#5865f2] hover:text-white transition-colors">
                      Log In
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-[24px] bg-[#5865f2] px-6 py-3 text-[16px] font-bold text-white hover:bg-[#4752c4] transition-colors shadow-lg">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden" style={{ background: '#5865f2' }}>
        {/* Floating background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] h-[200px] w-[200px] rounded-[40px] rotate-12 bg-black/5" />
          <div className="absolute top-[30%] right-[10%] h-[300px] w-[300px] rounded-full bg-white/5" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center mt-12">
          <h1 className="animate-slide-up font-display text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight text-white uppercase" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            YOUR DOCS BECOME
            <br />
            A SUPPORT AGENT
          </h1>

          <p className="mx-auto mt-10 max-w-3xl animate-slide-up text-[20px] leading-[1.6] text-white font-medium [animation-delay:100ms]">
            Upload your help articles, product guides, and policies. AnswerBase builds an AI agent that answers customer questions with pinpoint accuracy — ready to embed on your site in under two minutes.
          </p>

          <div className="mt-10 flex animate-slide-up flex-wrap items-center justify-center gap-6 [animation-delay:200ms]">
            <Link href="/register">
              <button className="flex items-center gap-3 rounded-[28px] bg-white px-8 py-4 text-[20px] font-bold text-black hover:text-[#5865f2] transition-colors hover:shadow-xl">
                <Upload className="h-6 w-6" /> Upload Docs & Try Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" className="py-28 sm:py-36" style={{ background: '#f6f6f6' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="mt-4 text-4xl sm:text-[48px] font-extrabold text-black uppercase font-display leading-[1.05]">
              BUILT FOR PRODUCTION
            </h2>
            <p className="mt-6 text-xl text-black/70 max-w-3xl mx-auto font-medium">
              Everything you need to deliver world-class automated support, right out of the box.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <div key={i} className="rounded-[24px] bg-white p-8 shadow-sm border border-black/5 hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 rounded-[16px] bg-[#5865f2]/10 flex items-center justify-center text-[#5865f2] mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-[20px] font-extrabold text-black uppercase font-display mb-3">{feature.title}</h3>
                <p className="text-[16px] leading-relaxed text-black/70 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="py-28 sm:py-36" style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="mt-4 text-4xl sm:text-[48px] font-extrabold text-black uppercase font-display leading-[1.05]">
              THREE STEPS.<br />ZERO COMPLEXITY.
            </h2>
            <p className="mt-6 text-xl text-black/70 max-w-3xl mx-auto font-medium">
              You don't need a dev team to build world-class AI support. Just drop in your files, grab the snippet, and you're ready to go.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mt-20">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="rounded-[24px] p-10 bg-[#f6f6f6] text-black"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-14 w-14 rounded-[16px] bg-[#5865f2]/10 flex items-center justify-center text-[#5865f2]">
                    <step.icon className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-[28px] font-extrabold text-black font-display uppercase leading-tight mb-4">{step.title}</h3>
                <p className="text-[16px] leading-relaxed text-black/70 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SHOWCASE BAND (BLACK) ═══════════════════ */}
      <section className="py-32" style={{ background: '#f6f6f6' }}>
        <div className="mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl sm:text-[48px] font-extrabold text-black uppercase font-display leading-[1.05]">
              NOT JUST ANOTHER<br />CHATBOT
            </h2>
            <p className="mt-6 text-xl text-black/70 font-medium leading-[1.6]">
              Most AI bots hallucinate policies that don't exist. AnswerBase retrieves answers directly from your actual documents. If it's not in your docs, the bot won't say it.
            </p>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="rounded-[40px] bg-[#1e2353] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-[#ec48bd]/20 blur-[100px]" />
                <div className="absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full bg-[#35ed7e]/20 blur-[80px]" />
                
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-full bg-white flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#5865f2]" />
                    </div>
                    <div className="bg-[#5865f2] rounded-[24px] rounded-tl-none p-5 text-white shadow-lg">
                      <p className="font-medium text-[16px]">What's your return policy for opened items?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 flex-row-reverse">
                    <div className="shrink-0 h-12 w-12 rounded-full bg-[#35ed7e] flex items-center justify-center">
                      <Bot className="h-6 w-6 text-black" />
                    </div>
                    <div className="bg-[#2a2f6e] border border-white/10 rounded-[24px] rounded-tr-none p-5 text-white shadow-lg max-w-[80%]">
                      <p className="font-medium text-[16px]">Based on the internal guide: Go to settings &gt; security &gt; click reset. An email will be sent immediately.</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-[8px] bg-black/20 px-3 py-1.5 text-xs text-white/70">
                        <FileText className="h-3.5 w-3.5" />
                        <span>return-policy.pdf</span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="py-28 sm:py-36" style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="mt-4 text-4xl sm:text-[48px] font-extrabold text-black uppercase font-display leading-[1.05]">
              SIMPLE PRICING
            </h2>
            <p className="mt-6 text-xl text-black/70 max-w-3xl mx-auto font-medium">
              Start for free, scale when you need to.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div 
                key={plan.name} 
                className={`rounded-[24px] p-8 flex flex-col ${
                  plan.featured 
                    ? 'bg-[#1e2353] text-white shadow-2xl scale-105 relative z-10' 
                    : 'bg-[#f6f6f6] text-black border border-black/5'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#5865f2] px-4 py-1 text-xs font-bold text-white uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className="text-[24px] font-extrabold uppercase font-display mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold font-display">{plan.price}</span>
                  <span className={plan.featured ? 'text-white/60' : 'text-black/60'}>{plan.period}</span>
                </div>
                <p className={`font-medium mb-8 ${plan.featured ? 'text-white/80' : 'text-black/70'}`}>
                  {plan.desc}
                </p>
                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 shrink-0 ${plan.featured ? 'text-[#35ed7e]' : 'text-[#5865f2]'}`} />
                      <span className={`font-medium ${plan.featured ? 'text-white/90' : 'text-black/80'}`}>{feat}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="w-full mt-auto">
                  <button className={`w-full rounded-[16px] py-4 text-[16px] font-bold transition-all ${
                    plan.featured
                      ? 'bg-[#5865f2] text-white hover:bg-[#4752c4]'
                      : 'bg-white border-2 border-black/10 text-black hover:border-[#5865f2] hover:text-[#5865f2]'
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section id="faq" className="py-28 sm:py-36" style={{ background: '#f6f6f6' }}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <h2 className="mt-4 text-4xl sm:text-[48px] font-extrabold text-black uppercase font-display leading-[1.05]">
              FREQUENTLY ASKED
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-[16px] bg-white border border-black/5 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="text-[18px] font-bold text-black">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 text-black/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 pt-0 text-[16px] font-medium text-black/70 leading-relaxed">
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA BAND ═══════════════════ */}
      <section className="py-28" style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="relative overflow-hidden">
            <h2 className="text-4xl sm:text-[56px] font-extrabold text-black uppercase font-display leading-[1.05]">
              STOP LOSING CUSTOMERS TO SLOW SUPPORT
            </h2>
            <p className="mt-8 text-xl text-black/70 max-w-3xl mx-auto font-medium leading-[1.6]">
              Your help docs are already written. Let AnswerBase turn them into an always-on support agent. Embed it anywhere with just one line of code.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <button className="w-full sm:w-auto rounded-[28px] bg-[#5865f2] px-12 py-5 text-[20px] font-bold text-white hover:bg-[#4752c4] transition-colors shadow-xl">
                  Get Started For Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="pt-20 pb-10" style={{ background: '#23272a' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5 border-b border-[#5865f2] pb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h2 className="text-[32px] font-extrabold text-[#5865f2] uppercase font-display mb-6">
                ANSWER<br />BASE
              </h2>
              <div className="flex items-center gap-6 text-white">
                <a href="https://www.linkedin.com/in/hamzahafeel" target="_blank" rel="noopener noreferrer" className="hover:text-[#5865f2] transition-colors">LinkedIn</a>
                <a href="https://github.com/Hamza-Hafeel" target="_blank" rel="noopener noreferrer" className="hover:text-[#5865f2] transition-colors">GitHub</a>
              </div>
            </div>

            <div>
              <h4 className="text-[16px] text-[#5865f2] mb-5">Product</h4>
              <ul className="space-y-4 text-[15px] text-white">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li><Link href="#pricing" className="hover:underline">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[16px] text-[#5865f2] mb-5">Company</h4>
              <ul className="space-y-4 text-[15px] text-white">
                <li><Link href="/about" className="hover:underline">About</Link></li>
                <li><Link href="/contact" className="hover:underline">Contact / Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[16px] text-[#5865f2] mb-5">Legal</h4>
              <ul className="space-y-4 text-[15px] text-white">
                <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:underline">Refund &amp; Cancellation Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#5865f2]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-display text-white">AnswerBase</span>
            </Link>
            
            <Link href="/register">
              <button className="rounded-[24px] bg-[#5865f2] px-6 py-2.5 text-[14px] font-bold text-white hover:bg-[#4752c4] transition-colors">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
