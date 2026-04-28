'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Play, X, Heart, MessageCircle, Share2, Compass, TrendingUp, Clock, Eye } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'creative', label: 'Creative', icon: Sparkles },
];

function ReelViewer({ reel, onClose }) {
  // Simple immersive viewer
  const [activeSection, setActiveSection] = useState(0);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  // Fake sections for immersive scrolling experience
  const sections = Array.isArray(reel.content?.sections) && reel.content.sections.length > 0 
    ? reel.content.sections 
    : [
        { title: reel.title, text: typeof reel.content === 'string' ? reel.content : (reel.content?.heroText || reel.tagline || 'Explore this creation.') },
        { title: 'The Detail', text: 'Immerse yourself in the story behind the art.' },
        { title: 'The Climax', text: 'Where imagination meets reality.' }
      ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 1000);
      toast.success('You liked this reel!');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleComment = () => {
    toast('Comments coming soon!', { icon: '💬' });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed creator.' : 'Following creator!');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-md p-4 sm:p-8"
      >
        {/* Giant popping heart animation */}
        <AnimatePresence>
          {showHeartPop && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1.5, 1], opacity: [1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            >
              <Heart size={120} className="text-rose-500 fill-rose-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-white text-neutral-900 shadow-soft hover:scale-105 transition-transform z-10"
        >
          <X size={24} />
        </button>

        <div className="w-full max-w-md h-full max-h-[850px] bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
          {/* Viewer Content Area - simulating vertical reels */}
          <div className="flex-1 relative overflow-y-auto snap-y snap-mandatory scrollbar-none bg-neutral-50">
            {sections.map((sec, idx) => (
              <div 
                key={idx}
                className="w-full h-full snap-start snap-always relative flex flex-col justify-center p-8 shrink-0"
              >
                {/* Background visual placeholder */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{ 
                    background: `linear-gradient(${135 + idx * 45}deg, ${reel.colorPalette?.[0] || '#6366F1'}, ${reel.colorPalette?.[1] || '#F59E0B'})` 
                  }}
                />
                
                <div className="relative z-10 text-center">
                  <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4 tracking-tight">
                    {sec.title || reel.title}
                  </h2>
                  <p className="text-lg text-neutral-600 leading-relaxed font-light">
                    {typeof sec === 'string' 
                      ? sec 
                      : (sec.text || sec.content || sec.description || sec.narrative || 'Explore this section.')
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reel Actions overlay */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-4 z-20">
            <button 
              onClick={handleLike}
              className={`p-3 rounded-full backdrop-blur-md shadow-soft transition-colors ${isLiked ? 'bg-rose-50 text-rose-500' : 'bg-white/80 text-neutral-800 hover:text-rose-500'}`}
            >
              <Heart size={24} className={isLiked ? 'fill-rose-500' : ''} />
            </button>
            <button 
              onClick={handleComment}
              className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-soft text-neutral-800 hover:text-brand-500 transition-colors"
            >
              <MessageCircle size={24} />
            </button>
            <button 
              onClick={handleShare}
              className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-soft text-neutral-800 hover:text-blue-500 transition-colors"
            >
              <Share2 size={24} />
            </button>
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-md">
                {reel.creator?.avatar ? <img src={reel.creator.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : (reel.creator?.name?.[0] || '?')}
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 leading-tight">@{reel.creator?.username || 'creator'}</h4>
                <p className="text-xs text-neutral-500">{reel.title}</p>
              </div>
              <button 
                onClick={handleFollow}
                className={`ml-auto px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
                  isFollowing 
                    ? 'bg-neutral-100 border-transparent text-neutral-600 hover:bg-neutral-200' 
                    : 'border-brand-200 text-brand-600 hover:bg-brand-50'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ReelTile({ reel, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const title = reel.title || 'Untitled Creation';
  const c1 = reel.colorPalette?.[0] || '#6366F1';
  const c2 = reel.colorPalette?.[1] || '#F59E0B';
  
  // Randomize tile height slightly for masonry effect
  const heightClass = useMemo(() => {
    const h = [
      'h-[250px]', 'h-[280px]', 'h-[320px]', 'h-[350px]', 'h-[400px]'
    ];
    return h[Math.floor(Math.random() * h.length)];
  }, []);

  const textContent = typeof reel.content === 'string' 
      ? reel.content 
      : (reel.content?.heroText || reel.content?.topic || reel.tagline || 'Creative WebReel');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(reel)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-soft-hover transition-all duration-300 group mb-6 inline-block`}
    >
      {/* Thumbnail or Gradient Fallback */}
      <div 
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${c1}15, ${c2}20)`,
          backgroundColor: '#fff'
        }}
      >
        {reel.thumbnailUrl ? (
          <img src={reel.thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
             {/* Abstract shape placeholder */}
             <div className="absolute w-32 h-32 rounded-full blur-2xl opacity-40 mix-blend-multiply" style={{ background: c1, top: '20%', left: '20%' }} />
             <div className="absolute w-40 h-40 rounded-full blur-2xl opacity-40 mix-blend-multiply" style={{ background: c2, bottom: '10%', right: '10%' }} />
             
             {/* Text Content Overlay */}
             <div className="relative z-10 w-full">
               <Sparkles size={24} className="mx-auto mb-4 opacity-50" style={{ color: c1 }} />
               <p className="text-neutral-700 font-display font-medium text-lg md:text-xl leading-relaxed line-clamp-4">
                 "{textContent}"
               </p>
             </div>
          </div>
        )}
      </div>

      {/* Hover Play Icon */}
      <div className={`absolute inset-0 bg-neutral-900/10 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-brand-500 pl-1">
          <Play size={20} className="fill-current" />
        </div>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-neutral-900/60 to-transparent">
        <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md truncate">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm">
               {reel.creator?.avatar && <img src={reel.creator.avatar} className="w-full h-full object-cover" alt="" />}
            </div>
            <span className="text-xs text-white/90 font-medium drop-shadow">
              {reel.creator?.username || 'user'}
            </span>
          </div>
          <span className="text-xs text-white/80 flex items-center gap-1 drop-shadow">
            <Eye size={12} /> {reel.views || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function WebReelPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingReel, setViewingReel] = useState(null);

  useEffect(() => {
    fetchReels();
  }, [activeTab]);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'creative') params.category = 'creative';
      else if (activeTab === 'trending') params.sort = 'views';
      // simple logic for demo
      const { data } = await api.get('/webreels', { params });
      setReels(data.data?.webreels || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reels.filter(r => (r.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()));

  return (
    <div className="min-h-screen">
      {/* ── Split Hero Section ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left: Copy */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 font-semibold text-sm mb-6 border border-brand-100">
              <Sparkles size={16} /> Discover Ideas
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-neutral-900 tracking-tight leading-[1.1] mb-6">
              Explore the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Creative</span> Web
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 font-light max-w-xl mx-auto lg:mx-0">
              Immerse yourself in scrollable, interactive stories and concepts built by the community.
            </p>
          </motion.div>

          {/* Right: Abstract Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="flex-1 w-full max-w-md relative perspective-1000"
          >
            <div className="relative w-full aspect-[4/5] rounded-[2rem] bg-white shadow-2xl overflow-hidden border border-neutral-100 transform rotate-y-[-10deg] rotate-x-[5deg]">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50 opacity-50" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-brand-500 to-accent-500 rounded-full blur-3xl opacity-30 animate-pulse" />
               {/* Rich Featured Reel Content */}
               <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                 {/* Top Badge */}
                 <div className="flex justify-between items-start">
                   <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-brand-600 border border-brand-100 shadow-sm flex items-center gap-1.5">
                     <TrendingUp size={14} /> Featured Concept
                   </div>
                   <div className="w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-brand-500">
                     <Play className="fill-brand-500 ml-1" size={20} />
                   </div>
                 </div>

                 {/* Center Visual Art / Abstract shapes */}
                 <div className="flex-1 flex items-center justify-center relative">
                   <motion.div 
                     animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                     className="w-48 h-48 rounded-full border-2 border-dashed border-brand-300/40 absolute"
                   />
                   <motion.div 
                     animate={{ scale: [1, 1.05, 1], rotate: [12, 15, 12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                     className="w-28 h-28 bg-gradient-to-tr from-brand-500 to-accent-500 rounded-3xl shadow-xl z-10 flex items-center justify-center"
                   >
                     <Sparkles className="text-white opacity-50" size={40} />
                   </motion.div>
                   <motion.div 
                     animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                     className="w-36 h-36 border border-accent-300/30 rounded-2xl absolute"
                   />
                 </div>

                 {/* Bottom Populated Details */}
                 <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl border border-neutral-100 shadow-xl relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-500 to-accent-500" />
                   <h3 className="text-xl font-display font-bold text-neutral-900 mb-1.5 leading-tight">
                     The Interactive Canvas
                   </h3>
                   <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                     Experience the future of storytelling. A scrollable journey merging code, art, and vibrant aesthetics.
                   </p>
                   
                   <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-400 to-orange-400 shadow-inner border border-white" />
                       <span className="text-xs font-semibold text-neutral-700">@dhindhora_studio</span>
                     </div>
                     <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                       Open Reel
                     </span>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Navigation & Search ────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-neutral-50/80 backdrop-blur-xl border-b border-neutral-200/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-neutral-900 text-white shadow-md' 
                      : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-neutral-900'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts..."
              className="w-full bg-white border border-neutral-200 rounded-full pl-11 pr-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Masonry Grid ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`w-full bg-white rounded-2xl mb-6 shadow-sm border border-neutral-100 animate-pulse ${i%2 === 0 ? 'h-[300px]' : 'h-[250px]'}`} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {filtered.map(reel => (
                <div key={reel._id} className="break-inside-avoid">
                  <ReelTile reel={reel} onClick={setViewingReel} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="text-neutral-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No reels found</h3>
            <p className="text-neutral-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Immersive Viewer */}
      {viewingReel && (
        <ReelViewer reel={viewingReel} onClose={() => setViewingReel(null)} />
      )}
    </div>
  );
}
