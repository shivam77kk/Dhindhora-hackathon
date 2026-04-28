import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import WebreelCard from '@/components/webreel/WebreelCard';
import GlowButton from '@/components/ui/GlowButton';
import CursorEffect from '@/components/ui/CursorEffect';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { Search, Filter } from 'lucide-react';
import { Link } from "react-router-dom";

import useAuthStore from '@/store/authStore';

const CATEGORIES = ['all', 'startup', 'story', 'portfolio', 'campaign', 'product', 'personal'];

export default function ExplorePage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchReels(); }, [category]);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const params = category !== 'all' ? `?category=${category}` : '';
      const { data } = await api.get(`/webreels${params}`);
      setReels(data.data?.webreels || []);
    } catch (e) { setReels([]); }
    finally { setLoading(false); }
  };

  const filtered = reels.filter(r => !search || r.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050510]">
      <CursorEffect /><ScrollProgress />
      
      <div className="pt-16 sm:pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4"><span className="gradient-text">Explore</span> the Galaxy</h1>
          <p className="text-white/40 text-base sm:text-lg px-4 sm:px-0">Discover stunning AI-powered weboreels from creators worldwide</p>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 w-full"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 text-sm sm:text-base" placeholder="Search weboreels..." /></div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">{CATEGORIES.map(cat => (<button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm capitalize transition-all whitespace-nowrap ${category === cat ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'glass text-white/50 border border-white/10 hover:text-white'}`}>{cat}</button>))}</div>
        </div>
        {loading ? <div className="flex justify-center py-20"><div className="portal-ring w-12 h-12 sm:w-16 sm:h-16 animate-spin" /></div> : filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-20"><div className="text-5xl sm:text-6xl mb-4">🌌</div><h2 className="font-display text-xl sm:text-2xl font-bold mb-2">No weboreels found</h2><p className="text-white/40 text-sm sm:text-base">Be the first to create one!</p></div>
        ) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{filtered.map((reel, i) => <WebreelCard key={reel._id} webreel={reel} index={i} />)}</div>)}
      </div>
    </div>
  );
}


