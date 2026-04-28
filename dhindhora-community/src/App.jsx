import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import CursorEffect from '@/components/ui/CursorEffect';
import PaperBackground from '@/components/ui/PaperBackground';
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { Globe, Send, User } from 'lucide-react';

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => { 
    api.get('/community/notes').then(res => setNotes(res.data.data || [])).catch(() => {}); 
  }, []);

  const addNote = async () => {
    if (!newNote.trim()) return toast.error('Write a message to broadcast!');
    try {
      // Pick a random glowing color for the note marker
      const colors = ['#6C63FF', '#06B6D4', '#EC4899', '#10B981', '#F59E0B'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const { data } = await api.post('/community/notes', { 
        content: newNote, 
        author: author || 'Anonymous Explorer', 
        color, 
        position: { x: Math.random() * 70 + 10, y: Math.random() * 60 + 10 } 
      });
      setNotes(prev => [data.data, ...prev]);
      setNewNote('');
      toast.success('Broadcast sent! 📡');
    } catch (e) { toast.error('Failed to broadcast'); }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-slate-200 relative overflow-hidden">
      <CursorEffect />
      {/* Background is now a sleek 3D network, but the component is still named PaperBackground to avoid renaming files */}
      <PaperBackground />
      
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#06B6D4] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(108,99,255,0.5)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">D</div>
            <span className="font-display text-2xl font-black text-white tracking-tight">Dhindhora</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <Link to="/dashboard" className="flex items-center gap-3 glass-card px-4 py-2 rounded-full text-sm hover:bg-white/5 transition-all font-semibold">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#6C63FF] flex items-center justify-center text-xs font-bold overflow-hidden text-white shadow-inner">
                  {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User size={14} />}
                </div>
                <span>Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-12 px-6 max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#06B6D4]/20 border border-[#06B6D4]/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] mb-6">
            <Globe className="w-12 h-12 text-[#06B6D4]" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black mb-4 text-white tracking-tighter">
            Global <span className="gradient-text">Visitor Node</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">Connect with other explorers across the Dhindhora network. Broadcast your presence to the globe.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: "spring", delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8 mb-16 max-w-4xl mx-auto relative overflow-hidden"
        >
          {/* Decorative glow inside card */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#6C63FF] rounded-full mix-blend-screen opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-4">
            <input 
              value={author} 
              onChange={e => setAuthor(e.target.value)} 
              className="glass-input rounded-xl px-5 py-4 text-lg placeholder-slate-500 md:w-64" 
              placeholder="Your Callsign" 
            />
            <input 
              value={newNote} 
              onChange={e => setNewNote(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && addNote()} 
              className="flex-1 glass-input rounded-xl px-5 py-4 text-lg placeholder-slate-500" 
              placeholder="Broadcast a message to the network..." 
            />
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={addNote} 
              className="px-8 py-4 rounded-xl glow-btn text-white font-bold flex items-center justify-center gap-2"
            >
              <span>Transmit</span>
              <Send size={20} className="ml-1" />
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note, i) => (
            <motion.div 
              key={note._id || i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ type: "spring", stiffness: 100, delay: i * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card rounded-2xl p-6 flex flex-col h-[200px] relative overflow-hidden group" 
            >
              {/* Colored Node Glow */}
              <div 
                className="absolute top-0 left-0 w-full h-1 opacity-80" 
                style={{ background: `linear-gradient(90deg, ${note.color || '#06B6D4'}, transparent)` }} 
              />
              <div 
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full mix-blend-screen blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500"
                style={{ background: note.color || '#06B6D4' }}
              />
              
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-xl font-medium leading-relaxed line-clamp-4">{note.content}</p>
              </div>
              
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: note.color || '#06B6D4', boxShadow: `0 0 8px ${note.color || '#06B6D4'}` }}></div>
                  <span className="text-sm font-bold text-slate-300">{note.author}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono tracking-wider">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
