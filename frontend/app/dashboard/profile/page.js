'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import GlowButton from '@/components/ui/GlowButton';
import toast from 'react-hot-toast';
import { User, Mail, Link as LinkIcon, Camera, Trophy, Medal } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    socialLinks: { twitter: '', linkedin: '', website: '' }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        socialLinks: user.socialLinks || { twitter: '', linkedin: '', website: '' }
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', formData);
      setUser(res.data.data);
      toast.success('Profile updated successfully! ✨');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-heavy rounded-3xl p-8 glow-border relative overflow-hidden">
        <div className="absolute inset-0 bg-anti-gravity opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full border-4 border-brand-500/30 overflow-hidden bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center text-4xl font-bold">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" /> : user.name?.[0].toUpperCase()}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" />
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="font-display text-3xl font-bold mb-1">{user.name}</h1>
            <p className="text-white/50 text-sm mb-4">@{user.username} • Level {user.level || 1} Creator</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="glass px-4 py-2 rounded-xl text-center glow-border-cyan">
                <div className="text-xs text-white/40 mb-1">SCORE</div>
                <div className="font-bold text-neon-cyan">{user.points || 0}</div>
              </div>
              <div className="glass px-4 py-2 rounded-xl text-center glow-border-pink">
                <div className="text-xs text-white/40 mb-1">DHINCOINS</div>
                <div className="font-bold text-neon-orange">🪙 {user.dhinCoins || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6 glow-border">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-4">
              <Medal size={18} className="text-neon-pink" /> Achievements
            </h3>
            <div className="space-y-3">
              {(user.badges || ['Early Adopter', 'First Webreel']).map((badge, i) => (
                <div key={i} className="flex items-center gap-3 glass p-3 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-lg">🏆</div>
                  <span className="text-sm font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 glow-border space-y-6">
            <h2 className="font-display text-xl font-bold">Edit Profile</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/60 mb-2 flex items-center gap-2"><User size={14} /> Full Name</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 flex items-center gap-2"><Mail size={14} /> Email (Read Only)</label>
                <input value={user.email} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Bio</label>
              <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 transition-colors resize-none"
                placeholder="Tell your story..." />
            </div>

            <div>
              <label className="text-sm text-white/60 mb-3 flex items-center gap-2"><LinkIcon size={14} /> Social Links</label>
              <div className="space-y-3">
                {['twitter', 'linkedin', 'website'].map((platform) => (
                  <div key={platform} className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-white/40 text-sm capitalize w-24">
                      {platform}
                    </span>
                    <input type="text" value={formData.socialLinks[platform] || ''} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [platform]: e.target.value } })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-r-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 transition-colors text-sm"
                      placeholder={`https://${platform}.com/username`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <GlowButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes ✨'}
              </GlowButton>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
