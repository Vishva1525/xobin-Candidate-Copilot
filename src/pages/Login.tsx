import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/use-local-storage';

import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Brain, Compass, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import xobinLogo from '@/assets/xobin-logo.png';
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
      className={`absolute rounded-full blur-3xl opacity-10 pointer-events-none ${className}`}
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
  const [authReady, setAuthReady] = useState(false);
  const [, setStoredEmail] = useLocalStorage<string | null>('candidateos_email', null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const handleUser = (userEmail: string) => {
      window.localStorage.setItem('candidateos_email', JSON.stringify(userEmail));
      setStoredEmail(userEmail);
      navigate('/dashboard', { replace: true });
    };

    // First restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        handleUser(session.user.email || session.user.user_metadata?.email || '');
      } else {
        setAuthReady(true);
      }
    });

    // Then listen for future auth changes (Google OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        handleUser(session.user.email || session.user.user_metadata?.email || '');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, setStoredEmail]);

  // Show nothing while checking existing session to prevent flash
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    window.localStorage.setItem('candidateos_email', JSON.stringify(email.trim()));
    setStoredEmail(email.trim());
    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating gradient orbs using theme tokens */}
      <FloatingOrb className="w-96 h-96 top-[-10%] left-[10%] bg-primary" delay={0} />
      <FloatingOrb className="w-[500px] h-[500px] bottom-[-15%] right-[5%] bg-info" delay={3} />
      <FloatingOrb className="w-72 h-72 top-[40%] left-[50%] bg-primary" delay={6} />
      <FloatingOrb className="w-80 h-80 top-[10%] right-[30%] bg-info" delay={9} />

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
            className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={xobinLogo} alt="xobin" className="h-10 w-10 object-contain" />
          </motion.div>
          <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            xobin
          </span>
        </motion.div>

        {/* Hero */}
        <div className="max-w-lg">
          <motion.h1
            variants={item}
            className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            You are the pilot.
            <br />
            We're your{' '}
            <span className="text-gradient">CoPilot.</span>
          </motion.h1>
          <motion.p variants={item} className="mt-5 text-base text-muted-foreground leading-relaxed max-w-md">
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
                className="group flex items-start gap-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p variants={item} className="text-xs text-muted-foreground/50">
          © 2026 xobin. All rights reserved.
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
          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 backdrop-blur-xl shadow-lg">
            {/* Brand inside card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={xobinLogo} alt="xobin" className="h-14 w-14 object-contain" />
              </motion.div>
              <h2
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                xobin{' '}
                <span className="text-gradient">CoPilot</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5">Sign in to your candidate dashboard</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Username
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-ring/30 transition-all"
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
                    Password
                  </label>
                  <button type="button" className="text-[11px] text-primary hover:text-primary/80 transition-colors">
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
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-ring/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-70 glow-primary-sm"
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

          </div>
        </motion.div>
      </div>
    </div>
  );
}
