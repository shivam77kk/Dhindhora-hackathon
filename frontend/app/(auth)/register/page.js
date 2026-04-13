'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import GlowButton from '@/components/ui/GlowButton';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { User, Mail, Lock, AtSign, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) return toast.error('All fields required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6C63FF', '#EC4899', '#06B6D4'] });
      toast.success('Welcome to Dhindhora! 🌌');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'John Doe' },
    { key: 'username', label: 'Username', icon: AtSign, type: 'text', placeholder: 'johndoe' },
    { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@email.com' },
    { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-anti-gravity opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="portal-ring w-[600px] h-[600px] opacity-10" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center text-xl font-bold">D</div>
            <span className="font-display text-2xl font-bold gradient-text">Dhindhora</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Join the galaxy</h1>
          <p className="text-white/40">Create your Black Clovers Dhindhora account</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-heavy rounded-2xl p-8 glow-border space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-sm text-white/60 mb-1.5 block">{f.label}</label>
              <div className="relative">
                <f.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={f.type} value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 transition-colors" placeholder={f.placeholder} />
              </div>
            </div>
          ))}
          <GlowButton type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Account 🚀'}
          </GlowButton>
          <p className="text-center text-white/40 text-sm">
            Already a member? <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
