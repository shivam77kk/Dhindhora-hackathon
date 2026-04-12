'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import GlowButton from '@/components/ui/GlowButton';
import MusicVisualizer from '@/components/ui/MusicVisualizer';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Upload, Brain, Wand2, Loader2, CheckCircle, Music } from 'lucide-react';

const CATEGORIES = ['startup', 'story', 'portfolio', 'campaign', 'product', 'personal'];

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMultimodal = searchParams.get('mode') === 'multimodal';
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState(isMultimodal ? 'multimodal' : 'text');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const [form, setForm] = useState({
    title: '', tagline: '', category: 'personal',
    colorPalette: ['#6C63FF', '#EC4899', '#06B6D4'],
    musicMood: 'ambient', uploadedFile: null, uploadedFileType: null,
    marketQuestion: '', marketOptions: ['', ''], addMarket: false,
  });

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('image/') ? 'photo' : file.type.startsWith('video/') ? 'video' : 'voice';
    setForm(f => ({ ...f, uploadedFile: file, uploadedFileType: type }));
    toast.success(`${type} ready for AI analysis!`);
  };

  const runMultimodalCreate = async () => {
    if (!form.uploadedFile) return toast.error('Upload a file first');
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', form.uploadedFile);
      formData.append('type', form.uploadedFileType);
      const { data } = await api.post('/ai/multimodal-create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const content = data.data.content;
      setGeneratedContent(content);
      setForm(f => ({ ...f, title: content.title || '', tagline: content.tagline || '', category: content.category || 'personal', colorPalette: content.colorPalette || f.colorPalette, musicMood: content.musicMood || 'ambient' }));
      toast.success('✨ AI has built your webreel!');
    } catch (e) { toast.error('Multimodal creation failed'); }
    finally { setAiLoading(false); }
  };

  const runAIGenerate = async () => {
    if (!form.title) return toast.error('Enter a topic first');
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-webreel-content', { topic: form.title, category: form.category });
      const result = data.data;
      setGeneratedContent(result);
      setForm(f => ({ ...f, tagline: result.tagline || f.tagline, colorPalette: result.colorPalette || f.colorPalette, musicMood: result.musicMood || f.musicMood }));
      toast.success('AI content generated!');
    } catch (e) { toast.error('AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category) return toast.error('Title and category are required');
    setLoading(true);
    try {
      const { data } = await api.post('/weboreels', { title: form.title, tagline: form.tagline, category: form.category, content: generatedContent || {}, colorPalette: form.colorPalette, musicMood: form.musicMood, createdFrom: mode === 'multimodal' ? form.uploadedFileType || 'photo' : 'manual' });
      const reelId = data.data._id;

      if (form.addMarket && form.marketQuestion) {
        const validOpts = form.marketOptions.filter(o => o.trim());
        if (validOpts.length >= 2) {
          await api.post('/predictions', { webreelId: reelId, question: form.marketQuestion, options: validOpts }).catch(() => {});
        }
      }

      await api.post('/music/generate', { emotion: generatedContent?.emotion || 'excited', topic: form.title, colorPalette: form.colorPalette, musicMood: form.musicMood, webreelId: reelId }).catch(() => {});
      await api.post(`/weboreels/${reelId}/publish`);
      await api.post('/leaderboard/score', { webreelScore: 50 }).catch(() => {});

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6C63FF', '#EC4899', '#06B6D4'] });
      toast.success('🎉 Webreel published!');
      setTimeout(() => router.push(`/webreel/${reelId}`), 1500);
    } catch (e) { toast.error(e.response?.data?.message || 'Creation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Create Webreel</h1>
        <p className="text-white/40">Text mode · AI mode · Multimodal (photo/voice/video)</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {[{ id: 'text', icon: Brain, label: 'Text', sub: 'Write manually' }, { id: 'ai', icon: Wand2, label: 'AI Generate', sub: 'Topic → AI builds it' }, { id: 'multimodal', icon: Upload, label: 'Upload', sub: 'Photo · Voice · Video' }].map(m => (
          <motion.button key={m.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setMode(m.id)}
            className={`glass rounded-2xl p-4 text-left transition-all ${mode === m.id ? 'glow-border text-white' : 'border border-white/10 text-white/50'}`}>
            <m.icon size={20} className="mb-2" /><div className="font-semibold text-sm">{m.label}</div><div className="text-xs opacity-60">{m.sub}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(mode === 'text' || mode === 'ai') && (
          <motion.div key="textmode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="glass rounded-2xl p-6 glow-border space-y-5">
              <div><label className="text-sm text-white/60 mb-2 block">Title / Topic *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50" placeholder="My startup journey..." /></div>
              <div><label className="text-sm text-white/60 mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">{CATEGORIES.map(cat => (<button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))} className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${form.category === cat ? 'bg-brand-500 text-white' : 'glass text-white/50 border border-white/10'}`}>{cat}</button>))}</div></div>
              <div><label className="text-sm text-white/60 mb-2 block">Tagline</label>
                <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50" placeholder="One powerful line..." /></div>
              {mode === 'ai' && <GlowButton onClick={runAIGenerate}>{aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Wand2 size={16} /> Generate with AI</>}</GlowButton>}
              {generatedContent && <div className="glass-dark rounded-xl p-4 border border-neon-green/30"><div className="text-neon-green text-sm font-semibold">✅ AI Content Generated</div></div>}
            </div>
            <div className="glass rounded-2xl p-6 glow-border space-y-4">
              <div className="flex items-center justify-between"><div><h3 className="font-semibold">Prediction Market</h3><p className="text-white/40 text-sm">Let viewers bet DhinCoins</p></div>
                <button onClick={() => setForm(f => ({ ...f, addMarket: !f.addMarket }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.addMarket ? 'bg-brand-500' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.addMarket ? 'translate-x-7' : 'translate-x-1'}`} /></button></div>
              <AnimatePresence>{form.addMarket && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                <input value={form.marketQuestion} onChange={e => setForm(f => ({ ...f, marketQuestion: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-neon-orange/50" placeholder="Will this startup succeed?" />
                {form.marketOptions.map((opt, i) => (<input key={i} value={opt} onChange={e => { const opts = [...form.marketOptions]; opts[i] = e.target.value; setForm(f => ({ ...f, marketOptions: opts })); }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/30 text-sm" placeholder={`Option ${i + 1}`} />))}
                <button onClick={() => setForm(f => ({ ...f, marketOptions: [...f.marketOptions, ''] }))} className="text-sm text-brand-400">+ Add option</button>
              </motion.div>)}</AnimatePresence>
            </div>
            <GlowButton onClick={handleSubmit} size="lg">{loading ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <>🚀 Publish Webreel</>}</GlowButton>
          </motion.div>
        )}

        {mode === 'multimodal' && (
          <motion.div key="multimodal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className={`glass rounded-2xl p-8 border-2 border-dashed transition-all cursor-pointer ${dragOver ? 'border-brand-500 bg-brand-500/5' : form.uploadedFile ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/20 hover:border-white/40'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*" className="hidden" onChange={handleFileDrop} />
              {form.uploadedFile ? (<div className="text-center"><CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-3" /><div className="text-white font-semibold">{form.uploadedFile.name}</div><div className="text-white/40 text-sm capitalize mt-1">Type: {form.uploadedFileType}</div></div>
              ) : (<div className="text-center"><div className="flex justify-center gap-6 mb-4 text-4xl">📸 🎤 🎥</div><div className="text-white/60 font-semibold mb-1">Drop photo, voice note, or video</div><div className="text-white/30 text-sm">AI builds your entire webreel</div></div>)}
            </div>
            {form.uploadedFile && !generatedContent && <GlowButton onClick={runMultimodalCreate}>{aiLoading ? <><Loader2 size={16} className="animate-spin" /> AI is working...</> : <><Brain size={16} /> Analyze & Build</>}</GlowButton>}
            {aiLoading && (<div className="glass rounded-2xl p-5 glow-border space-y-2"><div className="text-sm font-semibold text-white/70 mb-3">Black Clovers Dhindhora at work...</div>
              {['📸 Uploading file...', '🧠 Gemini Vision analyzing...', '🎨 Detecting emotion & colors...', '✍️ Writing title and copy...', '✅ Building webreel...'].map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }} className="flex items-center gap-3 text-sm text-white/60"><div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />{step}</motion.div>))}</div>)}
            {generatedContent && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6 glow-border-cyan space-y-5">
              <div className="flex items-center gap-2"><CheckCircle className="text-neon-green" size={20} /><span className="font-semibold text-white">AI Generated Content</span></div>
              <div className="space-y-3">
                <div><div className="text-xs text-white/40 mb-1">TITLE</div><div className="text-white font-bold text-lg">{form.title}</div></div>
                <div><div className="text-xs text-white/40 mb-1">TAGLINE</div><div className="text-white/80 italic">&quot;{form.tagline}&quot;</div></div>
                <div><div className="text-xs text-white/40 mb-2">COLOR PALETTE</div><div className="flex gap-2">{form.colorPalette.map((c, i) => <div key={i} className="w-8 h-8 rounded-lg border border-white/20" style={{ background: c }} />)}</div></div>
                <div className="flex items-center gap-2"><MusicVisualizer bars={5} /><span className="text-white/60 text-sm capitalize">{form.musicMood}</span></div>
              </div>
              <GlowButton onClick={handleSubmit} size="lg">{loading ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <>🚀 Publish to Galaxy</>}</GlowButton>
            </motion.div>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
