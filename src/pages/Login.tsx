import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { lovable } from '@/integrations/lovable/index';
import { Plane, ArrowRight, Brain, Compass, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const features = [
  { icon: Brain, title: 'AI-Powered Prep', desc: 'Personalized interview coaching and resume tailoring powered by AI.' },
  { icon: Compass, title: 'Stage Navigation', desc: 'Real-time visibility into where you stand and what comes next.' },
  { icon: Shield, title: 'You Stay in Control', desc: 'Your data, your pace. We guide — you decide.' },
];

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 5, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setStoredEmail] = useLocalStorage<string | null>('candidateos_email', null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate brief loading
    await new Promise(r => setTimeout(r, 600));
    window.localStorage.setItem('candidateos_email', JSON.stringify(email.trim()));
    setStoredEmail(email.trim());
    navigate('/dashboard');
  };

  return (
    <div
      className="relative flex min-h-screen overflow-hidden"
      style={{ background: 'hsl(222, 47%, 6%)' }}
    >
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(199, 89%, 48%) 1px, transparent 1px), linear-gradient(90deg, hsl(199, 89%, 48%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating gradient orbs */}
      <FloatingOrb className="w-96 h-96 top-[-10%] left-[10%] bg-[hsl(199,89%,48%)]" delay={0} />
      <FloatingOrb className="w-[500px] h-[500px] bottom-[-15%] right-[5%] bg-[hsl(262,83%,58%)]" delay={3} />
      <FloatingOrb className="w-72 h-72 top-[40%] left-[50%] bg-[hsl(199,89%,48%)]" delay={6} />
      <FloatingOrb className="w-80 h-80 top-[10%] right-[30%] bg-[hsl(262,83%,58%)]" delay={9} />

      {/* LEFT PANEL — Branding (hidden on mobile) */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-16 relative z-10"
      >
        {/* Logo */}
        <motion.div variants={item} className="flex items-center gap-2.5">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, hsl(199, 89%, 48%), hsl(262, 83%, 58%))' }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Plane className="h-5 w-5 text-white" />
          </motion.div>
          <span className="text-lg font-semibold text-white/90" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Xobin
          </span>
        </motion.div>

        {/* Hero */}
        <div className="max-w-lg">
          <motion.h1
            variants={item}
            className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            You are the pilot.
            <br />
            We're your{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, hsl(199, 89%, 48%), hsl(262, 83%, 58%))' }}
            >
              CoPilot.
            </span>
          </motion.h1>
          <motion.p variants={item} className="mt-5 text-base text-white/50 leading-relaxed max-w-md">
            Your AI-powered companion for the entire hiring journey — from application tracking to interview prep. We navigate together.
          </motion.p>

          {/* Feature cards */}
          <motion.div variants={item} className="mt-10 space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                className="group flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4 hover:border-[hsl(199,89%,48%)]/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'linear-gradient(135deg, hsl(199, 89%, 48%, 0.15), hsl(262, 83%, 58%, 0.15))' }}
                >
                  <f.icon className="h-5 w-5" style={{ color: 'hsl(199, 89%, 48%)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{f.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p variants={item} className="text-xs text-white/25">
          © 2026 Xobin. All rights reserved.
        </motion.p>
      </motion.div>

      {/* RIGHT PANEL — Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          {/* Glassmorphic card */}
          <div
            className="rounded-2xl border border-white/[0.08] p-8 sm:p-10 backdrop-blur-xl"
            style={{ background: 'linear-gradient(145deg, hsla(222, 47%, 11%, 0.8), hsla(222, 47%, 8%, 0.9))' }}
          >
            {/* Brand inside card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(199, 89%, 48%), hsl(262, 83%, 58%))',
                  boxShadow: '0 0 30px hsl(199, 89%, 48%, 0.3)',
                }}
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Plane className="h-7 w-7 text-white" />
              </motion.div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Xobin{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, hsl(199, 89%, 48%), hsl(262, 83%, 58%))' }}
                >
                  CoPilot
                </span>
              </h2>
              <p className="text-xs text-white/40 mt-1.5">Sign in to your candidate dashboard</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-xs font-medium text-white/50 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[hsl(199,89%,48%)]/50 focus:outline-none focus:ring-1 focus:ring-[hsl(199,89%,48%)]/30 transition-all"
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-white/50">
                    Password
                  </label>
                  <button type="button" className="text-[11px] text-[hsl(199,89%,48%)] hover:text-[hsl(199,89%,58%)] transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white placeholder:text-white/25 focus:border-[hsl(199,89%,48%)]/50 focus:outline-none focus:ring-1 focus:ring-[hsl(199,89%,48%)]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, hsl(199, 89%, 48%), hsl(199, 89%, 38%))',
                    boxShadow: '0 0 20px hsl(199, 89%, 48%, 0.3), 0 4px 15px hsl(199, 89%, 48%, 0.15)',
                  }}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Sign in to CoPilot
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 my-6"
            >
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-white/30">or continue with</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </motion.div>

            {/* Google sign-in */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                type="button"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                    extraParams: { prompt: "select_account" },
                  });
                  if (error) console.error("Google sign-in error:", error);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.9 10.9 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
                </svg>
                Sign in with Google
              </button>
            </motion.div>

            {/* Create account */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center text-xs text-white/30 mt-6"
            >
              New to Xobin?{' '}
              <button type="button" className="text-[hsl(199,89%,48%)] hover:text-[hsl(199,89%,58%)] font-medium transition-colors">
                Create an account
              </button>
            </motion.p>

            {/* Demo hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-[10px] text-white/20 mt-3"
            >
              Demo mode — enter any email to explore
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
