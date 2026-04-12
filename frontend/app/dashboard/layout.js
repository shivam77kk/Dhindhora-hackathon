'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { LayoutDashboard, PlusCircle, Film, User, Trophy, Users, TrendingUp, DollarSign, LogOut, Menu, X, Music } from 'lucide-react';
import ScrollProgress from '@/components/ui/ScrollProgress';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#6C63FF' },
  { href: '/dashboard/create', icon: PlusCircle, label: 'Create Webreel', color: '#EC4899' },
  { href: '/dashboard/my-reels', icon: Film, label: 'My Reels', color: '#06B6D4' },
  { href: '/dashboard/predictions', icon: DollarSign, label: 'Predictions', color: '#F97316' },
  { href: '/explore', icon: TrendingUp, label: 'Explore', color: '#10B981' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: '#8B5CF6' },
  { href: '/community', icon: Users, label: 'Community', color: '#EC4899' },
  { href: '/dashboard/profile', icon: User, label: 'Profile', color: '#6C63FF' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, checkAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [hydrated, user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="portal-ring w-16 h-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen dashboard-bg">
      <ScrollProgress />
      <motion.aside animate={{ width: collapsed ? 72 : 260 }} transition={{ duration: 0.3 }} className="fixed left-0 top-0 h-full z-40 glass-heavy sidebar-glow flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center font-bold text-lg shrink-0 animate-glow-pulse">D</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="font-display font-bold gradient-text leading-none">Dhindhora</div>
                <div className="text-white/30 text-xs">Black Clovers Dhindhora</div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-white/40 hover:text-white transition-colors shrink-0">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                  {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                  <div className="text-xs text-white/40 truncate">@{user.username}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 glass rounded-lg p-2 text-center">
                  <div className="text-neon-orange font-bold text-sm">🪙 {user.dhinCoins || 100}</div>
                  <div className="text-white/40 text-xs">DhinCoins</div>
                </div>
                <div className="flex-1 glass rounded-lg p-2 text-center">
                  <div className="gradient-text font-bold text-sm">{user.points || 0}</div>
                  <div className="text-white/40 text-xs">Points</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div whileHover={{ x: collapsed ? 0 : 4 }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${isActive ? 'glass glow-border text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  <item.icon size={20} style={{ color: isActive ? item.color : undefined }} className="shrink-0" />
                  <AnimatePresence>
                    {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium truncate">{item.label}</motion.span>}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={20} className="shrink-0" />
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Logout</motion.span>}</AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <motion.main animate={{ marginLeft: collapsed ? 72 : 260 }} transition={{ duration: 0.3 }} className="flex-1 min-h-screen relative z-10">
        <div className="sticky top-0 z-30 glass-heavy border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="text-white/40 text-sm font-mono">{pathname.replace('/dashboard', '') || '/'}</div>
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5">
            <Music size={14} className="text-neon-green" />
            <div className="flex gap-0.5 items-end h-4">
              {[1,2,3,4,5].map(i => <div key={i} className="music-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </motion.main>
    </div>
  );
}
