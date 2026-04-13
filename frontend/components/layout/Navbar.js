'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import GlowButton from '@/components/ui/GlowButton';

const NAV_LINKS = [
  { name: 'Explore',    href: '/explore' },
  { name: 'Community',  href: '/community' },
  { name: 'Leaderboard',href: '/leaderboard' },
];

const VIRAL_LINKS = [
  { name: '🎨 Air Canvas',   href: '/air-canvas' },
  { name: '🔥 Roast Me',     href: '/roast-me' },
  { name: '🧬 Avatar',       href: '/avatar-mirror' },
  { name: '📖 Story',        href: '/story-control' },
];

import useAuthStore from '@/store/authStore';

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'glass py-3 border-b border-white/10 shadow-lg' : 'py-5 border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center text-lg font-bold shadow-lg shadow-brand-500/20"
          >
            D
          </motion.div>
          <span className="font-display text-xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
            Dhindhora
          </span>
        </Link>

        {}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
            {NAV_LINKS.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pathname === link.href ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <div className="flex items-center gap-4">
            {VIRAL_LINKS.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-[11px] font-black uppercase tracking-wider transition-all ${
                  pathname === link.href ? 'text-brand-400' : 'text-white/30 hover:text-white/70'
                }`}
              >
                {link.name.split(' ')[1] || link.name}
              </Link>
            ))}
          </div>
        </div>

        {}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-3 glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-all border border-white/10">
              <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.[0].toUpperCase()}
              </div>
              <span className="hidden sm:block">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-white/50 hover:text-white text-sm px-4 py-2 transition-colors">
                Login
              </Link>
              <GlowButton href="/register" size="sm">
                Get Started
              </GlowButton>
            </>
          )}
          
          {}
          <button 
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <div className={`w-5 h-0.5 bg-white transition-all ${mobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${mobileMenu ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${mobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {[...NAV_LINKS, ...VIRAL_LINKS].map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setMobileMenu(false)}
                    className="p-3 rounded-xl glass border border-white/5 text-sm font-bold text-white/70 hover:text-white"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
