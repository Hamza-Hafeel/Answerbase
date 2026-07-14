'use client';

import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Check, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const PLANS = [
  {
    key: 'free',
    name: 'STARTER',
    price: 0,
    features: ['50 messages / month', '5 documents', 'Playground chat', 'Basic analytics'],
  },
  {
    key: 'pro',
    name: 'PRO',
    price: 29,
    features: ['2,000 messages / month', 'Unlimited documents', 'Embeddable widget', 'API access', 'Priority support'],
    popular: true,
  },
  {
    key: 'business',
    name: 'BUSINESS',
    price: 99,
    features: [
      '10,000 messages / month', 'Unlimited everything', 'Custom branding',
      'Advanced analytics', 'Dedicated manager', 'SLA guarantee',
    ],
  },
];

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#5865f2]" /></div>}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const { user, refresh } = useAuth();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      api('/billing/confirm', {
        method: 'POST',
        body: { session_id: sessionId },
      })
        .then(() => {
          toast.success('Subscription upgraded successfully!');
          refresh();
          router.replace('/dashboard/billing');
        })
        .catch((err) => {
          toast.error(err instanceof ApiError ? err.message : 'Failed to confirm upgrade');
        });
    }
  }, [searchParams, refresh, router]);

  const currentPlan = user?.plan || 'free';
  const used = user?.messages_used || 0;
  const limit = user?.monthly_message_limit || 50;
  const usagePercent = Math.min((used / limit) * 100, 100);

  async function handleUpgrade(planKey: string) {
    if (planKey === 'free' || planKey === currentPlan) return;
    setUpgrading(planKey);
    try {
      const data = await api<{ url: string }>('/billing/checkout', {
        method: 'POST',
        body: { plan: planKey, return_url: window.location.href },
      });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to start checkout');
      setUpgrading(null);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white uppercase font-display">Billing</h1>
        <p className="mt-2 text-sm md:text-base text-white/50">
          Manage your subscription and monitor usage.
        </p>
      </div>

      {/* Current plan & usage */}
      <div className="rounded-[16px] bg-[#1e2353] border border-white/5 p-5 md:p-6">
        <h3 className="text-xs md:text-sm font-bold text-white uppercase font-display tracking-wide mb-6">Current Plan</h3>
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-3">
            <span className="rounded-[8px] bg-[#ec48bd] px-3 py-1 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">
              {currentPlan}
            </span>
            {user?.subscription_status && (
              <span className="rounded-[8px] bg-[#35ed7e]/20 px-3 py-1 text-[10px] md:text-xs font-bold text-[#35ed7e] uppercase tracking-wider">
                {user.subscription_status}
              </span>
            )}
          </div>
          <div>
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs md:text-sm font-bold text-white/50 uppercase tracking-wider">Messages this month</span>
              <span className="text-base md:text-lg font-bold text-white font-display">{used} / {limit}</span>
            </div>
            <div className="h-2.5 md:h-3 w-full rounded-full bg-[#0a0d3a] overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-[#ed4245]' : 'bg-[#5865f2]'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div
              key={plan.key}
              className={`relative rounded-[16px] p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] ${
                plan.popular
                  ? 'bg-white text-black'
                  : 'bg-[#1e2353] border border-white/5'
              } ${isCurrent ? 'ring-2 ring-[#5865f2]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[8px] bg-[#ec48bd] px-4 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              
              <h3 className={`text-xs md:text-sm font-bold uppercase tracking-[0.15em] font-display ${
                plan.popular ? 'text-[#5865f2]' : 'text-[#5865f2]'
              }`}>{plan.name}</h3>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-4xl md:text-5xl font-extrabold font-display ${plan.popular ? 'text-black' : 'text-white'}`}>${plan.price}</span>
                <span className={`text-xs md:text-sm font-medium ${plan.popular ? 'text-black/40' : 'text-white/40'}`}>/mo</span>
              </div>
              
              <ul className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-xs md:text-sm">
                    <Check className={`h-4 w-4 md:h-5 md:w-5 shrink-0 ${
                      plan.popular ? 'text-[#5865f2]' : 'text-[#35ed7e]'
                    }`} />
                    <span className={`font-medium ${plan.popular ? 'text-black/80' : 'text-white/70'}`}>{f}</span>
                  </li>
                ))}
              </ul>
              
              <button
                disabled={isCurrent || upgrading !== null}
                onClick={() => handleUpgrade(plan.key)}
                className={`mt-6 md:mt-8 w-full flex items-center justify-center gap-2 rounded-[12px] py-3 md:py-3.5 text-xs md:text-sm font-bold transition-all disabled:opacity-50 ${
                  isCurrent 
                    ? plan.popular 
                      ? 'bg-black/5 text-black/50 cursor-default' 
                      : 'bg-white/5 text-white/50 cursor-default border border-white/10'
                    : plan.popular
                      ? 'bg-[#5865f2] text-white hover:bg-[#4752c4] shadow-lg shadow-[#5865f2]/20'
                      : 'bg-[#5865f2] text-white hover:bg-[#4752c4]'
                }`}
              >
                {upgrading === plan.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  'Current Plan'
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    {plan.key === 'free' ? 'Downgrade' : 'Upgrade'}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
