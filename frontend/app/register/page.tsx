'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as apiRegister, googleLogin as apiGoogleLogin, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRegister(email, password, name, company);
      await refresh();
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      await apiGoogleLogin(credentialResponse.credential);
      await refresh();
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Google Login failed');
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "rounded-[12px] border-white/10 bg-[#1e2353] text-white placeholder:text-white/25 focus:border-[#5865f2] focus:ring-[#5865f2]/30 h-12";

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0d3a' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center gradient-mesh">
        <div className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-[#ec48bd]/15 blur-[120px]" />
        <div className="absolute left-1/3 top-1/4 h-60 w-60 rounded-full bg-[#5865f2]/20 blur-[100px]" />
        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#5865f2] animate-glow-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-8 text-4xl font-extrabold text-white uppercase font-display tracking-tight">
            LET&apos;S BUILD YOUR<br />
            <span className="gradient-text-blurple">AI AGENT</span>
          </h2>
          <p className="mt-4 text-white/50 leading-relaxed">
            Create your AI chatbot in minutes. Upload docs and let AI handle customer support around the clock.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#5865f2]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-display">AnswerBase</span>
            </Link>
          </div>

          <h1 className="text-3xl font-extrabold text-white uppercase font-display">CREATE ACCOUNT</h1>
          <p className="mt-2 text-sm text-white/40">
            Set up your organization and start building your AI chatbot
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/70 text-xs font-bold uppercase tracking-wider">Your Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white/70 text-xs font-bold uppercase tracking-wider">Company</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70 text-xs font-bold uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70 text-xs font-bold uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClasses}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[12px] bg-[#5865f2] py-3.5 text-sm font-bold text-white hover:bg-[#4752c4] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Create Account
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 text-white/30" style={{ background: '#0a0d3a' }}>Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className="relative flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors shadow-lg overflow-hidden group">
              <svg className="h-[24px] w-[24px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <div className="absolute inset-0 opacity-[0.01] z-10 cursor-pointer flex items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Login failed')}
                  type="icon"
                  shape="circle"
                />
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#5865f2] hover:text-[#35ed7e] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
