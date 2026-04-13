'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import GlowButton from '@/components/ui/GlowButton';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('All fields required');
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back! 🚀');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-anti-gravity opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="portal-ring w-[500px] h-[500px] opacity-10" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center text-xl font-bold">D</div>
            <span className="font-display text-2xl font-bold gradient-text">Dhindhora</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/40">Enter the galaxy</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-heavy rounded-2xl p-8 glow-border space-y-5">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 transition-colors" placeholder="you@email.com" />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-2 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 transition-colors" placeholder="••••••••" />
            </div>
          </div>
          <GlowButton type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Login →'}
          </GlowButton>
          <p className="text-center text-white/40 text-sm">
            No account? <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors">Create one</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
