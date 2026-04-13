'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Local command map — matched instantly without API call
const LOCAL_COMMANDS = {
  'next':       { action: 'scroll-next',      emoji: '⏭️' },
  'forward':    { action: 'scroll-next',      emoji: '⏭️' },
  'back':       { action: 'scroll-back',      emoji: '⏮️' },
  'previous':   { action: 'scroll-back',      emoji: '⏮️' },
  'wow':        { action: 'confetti',         emoji: '🎉' },
  'celebrate':  { action: 'confetti',         emoji: '🎉' },
  'stop':       { action: 'stop-music',       emoji: '⏹️' },
  'mute':       { action: 'stop-music',       emoji: '⏹️' },
  'play':       { action: 'play-music',       emoji: '▶️' },
  'music':      { action: 'play-music',       emoji: '▶️' },
  'roast':      { action: 'navigate-roast',   emoji: '🔥' },
  'draw':       { action: 'navigate-draw',    emoji: '🎨' },
  'canvas':     { action: 'navigate-draw',    emoji: '🎨' },
  'story':      { action: 'navigate-story',   emoji: '📖' },
  'home':       { action: 'navigate-home',    emoji: '🏠' },
  'avatar':     { action: 'navigate-avatar',  emoji: '🧬' },
};

function executeAction(action, router) {
  switch (action) {
    case 'scroll-next':
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
      break;
    case 'scroll-back':
      window.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' });
      break;
    case 'confetti': {
      // Use canvas-confetti if available, else fallback
      if (typeof window !== 'undefined' && window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        // Dynamic import fallback
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }).catch(() => {});
      }
      toast.success('🎉 WOW!!!', { style: { background: '#1a0530', color: '#fff' } });
      break;
    }
    case 'stop-music':
      document.dispatchEvent(new CustomEvent('audio:stop'));
      break;
    case 'play-music':
      document.dispatchEvent(new CustomEvent('audio:play'));
      break;
    case 'navigate-roast':    router.push('/roast-me'); break;
    case 'navigate-draw':     router.push('/air-canvas'); break;
    case 'navigate-story':    router.push('/story-control'); break;
    case 'navigate-home':     router.push('/'); break;
    case 'navigate-avatar':   router.push('/avatar-mirror'); break;
    default: break;
  }
}

export default function VoiceController({ onCommand, enabled = true }) {
  const [listening, setListening]     = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [flash, setFlash]             = useState(null);  // { emoji, action }
  const [showHUD, setShowHUD]         = useState(false);
  const [supported, setSupported]     = useState(true);
  const recognitionRef  = useRef(null);
  const listeningRef    = useRef(false); // ref version to avoid stale closure
  const router = useRouter();

  // Check browser support on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const handleFinalTranscript = useCallback(async (text) => {
    const lower = text.toLowerCase().trim();
    setTranscript(lower);

    // 1. Try local match first (instant, no API)
    for (const [keyword, cmd] of Object.entries(LOCAL_COMMANDS)) {
      if (lower.includes(keyword)) {
        setFlash(cmd);
        setTimeout(() => setFlash(null), 2000);
        executeAction(cmd.action, router);
        if (onCommand) onCommand(cmd.action, lower);
        // Speak back
        if (window.speechSynthesis) {
          const phrases = {
            'confetti': 'Woooo!', 'scroll-next': 'Next!', 'scroll-back': 'Going back!',
            'navigate-roast': 'Opening roast!', 'navigate-draw': 'Opening canvas!',
            'stop-music': 'Music stopped.', 'play-music': 'Music on!',
          };
          const utt = new SpeechSynthesisUtterance(phrases[cmd.action] || 'Got it!');
          utt.rate = 1.15;
          utt.volume = 0.7;
          window.speechSynthesis.speak(utt);
        }
        return;
      }
    }

    // 2. Fallback: AI interpretation for complex/natural language commands
    try {
      const { data } = await api.post('/voice/interpret', {
        transcript: lower,
        currentPage: window.location.pathname,
      });
      const res = data.data;
      if (res && res.confidence >= 0.65 && res.action !== 'unknown') {
        setFlash({ emoji: res.emoji, action: res.action });
        setTimeout(() => setFlash(null), 2000);
        executeAction(res.action, router);
        if (onCommand) onCommand(res.action, lower);
        if (window.speechSynthesis && res.responseText) {
          const utt = new SpeechSynthesisUtterance(res.responseText);
          utt.rate = 1.1;
          window.speechSynthesis.speak(utt);
        }
      }
    } catch {
      // Silently fail — voice commands are a bonus feature
    }
  }, [router, onCommand]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Voice control not supported in this browser. Try Chrome!');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Works for Indian English + standard English
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (interim) setTranscript(interim.toLowerCase());
      if (final) handleFinalTranscript(final);
    };

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are expected — don't show errors for these
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied!');
        setListening(false);
        listeningRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (listeningRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      listeningRef.current = true;
      setListening(true);
      toast.success('🎤 Voice control ON! Try "next", "wow", or "roast"', {
        duration: 3500,
        style: { background: '#1a0530', color: '#fff' },
      });
    } catch (err) {
      toast.error('Could not start microphone: ' + err.message);
    }
  }, [handleFinalTranscript]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setTranscript('');
  }, []);

  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  // Cleanup on unmount
  useEffect(() => () => stopListening(), [stopListening]);

  if (!enabled || !supported) return null;

  return (
    <>
      {/* Floating mic button */}
      <motion.div
        className="fixed bottom-24 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      >
        <div className="relative">
          {/* Ripple rings when listening */}
          {listening && [0.8, 1.6, 2.4].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-red-400"
              animate={{ scale: [1, 2.8], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay, ease: 'easeOut' }}
            />
          ))}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { toggleListening(); if (!showHUD) setShowHUD(true); }}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all ${
              listening
                ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/50'
                : 'bg-gradient-to-br from-brand-500 to-violet-600 shadow-brand-500/40'
            }`}
            title={listening ? 'Stop voice control' : 'Start voice control'}
          >
            {listening ? '🎤' : '🎙️'}
          </motion.button>
        </div>
      </motion.div>

      {/* HUD panel */}
      <AnimatePresence>
        {showHUD && (
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            className="fixed bottom-[9.5rem] right-6 z-50 w-72 glass rounded-2xl p-4 border border-white/10 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">🎤 Voice Commands</span>
                <span className={`w-2 h-2 rounded-full ${listening ? 'bg-red-400 animate-pulse' : 'bg-white/20'}`} />
              </div>
              <button onClick={() => setShowHUD(false)} className="text-white/30 hover:text-white/70 text-xs">✕</button>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-3 glass rounded-lg px-3 py-2 text-white/55 text-xs italic border border-white/5">
                "{transcript}"
              </div>
            )}

            {/* Flash indicator */}
            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mb-3 glass rounded-lg p-3 border border-brand-500/50 text-center"
                >
                  <span className="text-3xl">{flash.emoji}</span>
                  <p className="text-brand-400 text-xs font-bold mt-1">{flash.action}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Command grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
              {[
                { say: '"next"',    emoji: '⏭️', does: 'Scroll down' },
                { say: '"back"',    emoji: '⏮️', does: 'Scroll up' },
                { say: '"wow"',     emoji: '🎉', does: 'Confetti!' },
                { say: '"stop"',    emoji: '⏹️', does: 'Stop music' },
                { say: '"play"',    emoji: '▶️', does: 'Play music' },
                { say: '"roast"',   emoji: '🔥', does: 'Roast page' },
                { say: '"draw"',    emoji: '🎨', does: 'Air Canvas' },
                { say: '"home"',    emoji: '🏠', does: 'Go home' },
                { say: '"story"',   emoji: '📖', does: 'Story page' },
                { say: '"avatar"',  emoji: '🧬', does: 'Avatar page' },
              ].map(c => (
                <div key={c.say} className="glass rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{c.emoji}</span>
                    <div>
                      <div className="text-white text-xs font-bold">{c.say}</div>
                      <div className="text-white/35 text-xs">{c.does}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
