'use client';
import { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useSocketStore from '@/store/socketStore';
import { connectSocket } from '@/lib/socket';
import GlowButton from '@/components/ui/GlowButton';
import MusicVisualizer from '@/components/ui/MusicVisualizer';
import LiveViewerCount from '@/components/realtime/LiveViewerCount';
import ScrollProgress from '@/components/ui/ScrollProgress';
import CursorEffect from '@/components/ui/CursorEffect';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, Star, ArrowLeft, Music, DollarSign, Users, Share2, Heart, Flame, Rocket, PartyPopper, Zap } from 'lucide-react';

const GalaxyScene = dynamic(() => import('@/components/three/GalaxyScene'), { ssr: false });
const GaussianSplatViewer = dynamic(() => import('@/components/three/GaussianSplatViewer'), { ssr: false });
const WormholeTransition = dynamic(() => import('@/components/three/WormholeTransition'), { ssr: false });
const ScrollCamera = dynamic(() => import('@/components/three/ScrollCamera'), { ssr: false });
const MusicGenerator = dynamic(() => import('@/components/ai/MusicGenerator'), { ssr: false });
const FeatureDrawer = dynamic(() => import('@/components/webreel/FeatureDrawer'), { ssr: false });
import Navbar from '@/components/layout/Navbar';

const EMOJIS = [
  { emoji: '🔥', icon: Flame, color: '#F97316' },
  { emoji: '❤️', icon: Heart, color: '#EF4444' },
  { emoji: '🚀', icon: Rocket, color: '#6C63FF' },
  { emoji: '🎉', icon: PartyPopper, color: '#10B981' },
  { emoji: '⚡', icon: Zap, color: '#F59E0B' },
];

export default function WebreelViewerPage({ params }) {
  const id = params?.id;
  const { user } = useAuthStore();
  const { setSocket, setViewers } = useSocketStore();
  const [webreel, setWebreel] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState(null);
  const [odds, setOdds] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [betting, setBetting] = useState(false);

  useEffect(() => { fetchWebreel(); fetchReactions(); fetchMarket(); setupSocket(); }, [id]);

  const fetchWebreel = async () => {
    try {
      const { data } = await api.get(`/webreels/${id}`);
      setWebreel(data.data);
    } catch (e) { toast.error('Webreel not found'); }
    finally { setLoading(false); }
  };
  const fetchReactions = async () => { try { const { data } = await api.get(`/reactions/${id}`); setReactions(data.data || []); } catch {} };
  const fetchMarket = async () => { try { const { data } = await api.get(`/predictions/${id}`); if (data.data) { setMarket(data.data.market); setOdds(data.data.odds || []); } } catch {} };

  const setupSocket = () => {
    const socket = connectSocket();
    setSocket(socket);
    socket.emit('join:webreel', { webreelId: id, username: user?.username || 'anonymous' });
    socket.on('viewers:update', ({ count }) => setViewers(count));
    socket.on('reaction:new', (data) => {
      setFloatingEmojis(prev => [...prev, { ...data, id: Math.random() }]);
      setTimeout(() => setFloatingEmojis(prev => prev.slice(1)), 3000);
    });
    socket.on('prediction:update', (updatedMarket) => setMarket(updatedMarket));
    return () => { socket.emit('leave:webreel', { webreelId: id }); };
  };

  const sendReaction = (emoji) => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.emit('reaction:send', { webreelId: id, emoji, username: user?.username || 'anonymous', position: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 10 } });
    }
  };

  const placeBet = async (optionIndex) => {
    if (!user) return toast.error('Login to bet');
    if (!market) return;
    setBetting(true);
    try {
      const { data } = await api.post(`/predictions/${market._id}/bet`, { optionIndex, coins: betAmount });
      toast.success(`Bet placed! ${betAmount} DC wagered 🎰`);
      fetchMarket();
    } catch (e) { toast.error(e.response?.data?.message || 'Bet failed'); }
    finally { setBetting(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="portal-ring w-20 h-20 animate-spin" /></div>;
  if (!webreel) return <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white/40">Webreel not found</div>;

  const palette = webreel.colorPalette || ['#6C63FF', '#EC4899', '#06B6D4'];

  return (
    <div className="min-h-screen bg-[#050510] relative overflow-hidden">
      <CursorEffect /><ScrollProgress />
      <WormholeTransition />
      <div className="fixed inset-0 z-0 opacity-60">
        <GalaxyScene />
      </div>

      <AnimatePresence>{floatingEmojis.map(fe => (
        <motion.div key={fe.id} initial={{ opacity: 1, y: '50vh', x: `${fe.position?.x || 50}vw`, scale: 0.5 }} animate={{ opacity: 0, y: '-10vh', scale: 2 }} transition={{ duration: 3 }} className="fixed z-50 text-4xl pointer-events-none">{fe.emoji}</motion.div>
      ))}</AnimatePresence>

      <Navbar />
      <FeatureDrawer webreelId={id} />

      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl w-full text-center relative z-20">
          <div className="h-2 w-48 mx-auto rounded-full mb-8" style={{ background: `linear-gradient(90deg, ${palette.join(', ')})` }} />
          
          {webreel.splatUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="w-full h-80 mb-6 -mt-10 mx-auto relative cursor-move">
              <GaussianSplatViewer splatUrl={webreel.splatUrl} />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 mb-4 inline-block`}>{webreel.category}</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold gradient-text mb-4 leading-tight">{webreel.title}</h1>
            {webreel.tagline && <p className="text-xl md:text-2xl text-white/60 mb-8 italic">&quot;{webreel.tagline}&quot;</p>}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40 mb-8">
            <span className="flex items-center gap-1"><Eye size={14} /> {webreel.views}</span>
            <span className="flex items-center gap-1"><Star size={14} /> {webreel.score}</span>
            {webreel.musicStatus === 'ready' && <span className="flex items-center gap-1 text-neon-green"><Music size={14} /> AI Music</span>}
            {market && <span className="flex items-center gap-1 text-neon-orange"><DollarSign size={14} /> Market Open</span>}
            {webreel.splatUrl && <span className="flex items-center gap-1 text-neon-cyan"><Star size={14} /> 3DGS</span>}
          </motion.div>
          {webreel.creator && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center font-bold text-sm overflow-hidden">
                {webreel.creator.avatar ? <img src={webreel.creator.avatar} alt="" className="w-full h-full object-cover" /> : webreel.creator.name?.[0]}
              </div>
              <div className="text-left"><div className="text-white font-semibold text-sm">{webreel.creator.name}</div><div className="text-white/40 text-xs">@{webreel.creator.username}</div></div>
            </motion.div>
          )}
        </div>
      </section>

      {webreel.content?.sections?.length > 0 && (
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            {webreel.content.sections.map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-heavy rounded-3xl p-8 glow-border section-portal">
                <div className="h-1 w-16 rounded-full mb-6" style={{ background: palette[i % palette.length] }} />
                <h2 className="font-display text-2xl font-bold text-white mb-4">{section.title}</h2>
                <p className="text-white/60 leading-relaxed text-lg">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {market && (
        <section className="relative z-10 py-20 px-6 section-portal">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-heavy rounded-3xl p-8 glow-border-pink">
              <div className="flex items-center justify-between mb-6">
                <div><span className="text-neon-orange text-xs font-mono uppercase tracking-widest">PREDICTION MARKET</span><h2 className="font-display text-2xl font-bold text-white mt-1">{market.question}</h2></div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${market.isOpen ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'}`}>{market.isOpen ? '🔴 LIVE' : 'CLOSED'}</span>
              </div>
              <div className="space-y-3 mb-6">{odds.map((opt, i) => (
                <div key={i} className="glass rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all" onClick={() => market.isOpen && placeBet(i)}>
                  <div className="flex justify-between items-center mb-2"><span className="text-white font-medium text-sm">{opt.text}</span><span className="text-white/50 text-sm">{opt.percentage}% · {opt.multiplier}x</span></div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-pink" initial={{ width: 0 }} whileInView={{ width: `${opt.percentage}%` }} transition={{ duration: 1 }} /></div>
                  <div className="text-xs text-white/30 mt-1">{opt.votes} votes · {opt.coins} DC</div>
                </div>
              ))}</div>
              {market.isOpen && user && (
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <span className="text-white/40 text-sm">Bet amount:</span>
                  <div className="flex gap-2">{[10, 25, 50].map(amt => (<button key={amt} onClick={() => setBetAmount(amt)} className={`px-3 py-1 rounded-lg text-sm ${betAmount === amt ? 'bg-brand-500 text-white' : 'glass text-white/50'}`}>{amt} DC</button>))}</div>
                </div>
              )}
              <div className="mt-4 text-xs text-white/30 text-center">{market.totalVotes} total bets · {market.totalCoins} DC wagered</div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div className="glass-heavy rounded-full px-6 py-3 flex items-center gap-3 glow-border" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }}>
          {EMOJIS.map(({ emoji, color }) => (
            <motion.button key={emoji} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.8 }} onClick={() => sendReaction(emoji)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-xl">{emoji}</motion.button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-1" />
          <motion.button whileHover={{ scale: 1.1 }} className="text-white/40 hover:text-white transition-colors"><Share2 size={18} /></motion.button>
        </motion.div>
      </section>
    </div>
  );
}
