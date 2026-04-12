'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import CursorEffect from '@/components/ui/CursorEffect';
import ScrollProgress from '@/components/ui/ScrollProgress';
import GlowButton from '@/components/ui/GlowButton';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MessageSquare, Send } from 'lucide-react';

const NOTE_COLORS = ['#6C63FF', '#EC4899', '#06B6D4', '#10B981', '#F97316', '#8B5CF6'];

export default function CommunityPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => { api.get('/community/notes').then(res => setNotes(res.data.data || [])).catch(() => {}); }, []);

  const addNote = async () => {
    if (!newNote.trim()) return toast.error('Write something!');
    try {
      const color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
      const { data } = await api.post('/community/notes', { content: newNote, author: author || 'Anonymous', color, position: { x: Math.random() * 70 + 10, y: Math.random() * 60 + 10 } });
      setNotes(prev => [data.data, ...prev]);
      setNewNote('');
      toast.success('Note added! 📝');
    } catch (e) { toast.error('Failed to add note'); }
  };

  return (
    <div className="min-h-screen bg-[#050510]">
      <CursorEffect /><ScrollProgress />
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center font-bold">D</div><span className="font-display text-xl font-bold gradient-text">Dhindhora</span></Link>
          <div className="flex items-center gap-3"><Link href="/login" className="text-white/70 text-sm px-4 py-2">Login</Link><GlowButton href="/register">Get Started</GlowButton></div>
        </div>
      </nav>
      <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <MessageSquare className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold mb-4"><span className="gradient-text">Community</span> Wall</h1>
          <p className="text-white/40 text-lg">Leave a note on the galaxy wall</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-heavy rounded-2xl p-6 glow-border mb-8">
          <div className="flex gap-3 mb-3">
            <input value={author} onChange={e => setAuthor(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 w-40" placeholder="Your name" />
            <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50" placeholder="Write a note..." />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addNote} className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white"><Send size={16} /></motion.button>
          </div>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div key={note._id || i} initial={{ opacity: 0, scale: 0.9, rotate: -2 + Math.random() * 4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, rotate: 0, y: -5 }}
              className="rounded-2xl p-5 shadow-lg cursor-default" style={{ background: `${note.color}15`, border: `1px solid ${note.color}33` }}>
              <p className="text-white/80 text-sm mb-3 leading-relaxed">{note.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: note.color }}>{note.author}</span>
                <span className="text-xs text-white/30">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
