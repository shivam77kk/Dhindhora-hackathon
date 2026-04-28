'use client';
import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ src, autoPlay = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      const playAudio = () => {
        audioRef.current.volume = 0.15;
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
        document.removeEventListener('click', playAudio);
      };
      document.addEventListener('click', playAudio, { once: true });
      return () => document.removeEventListener('click', playAudio);
    }
  }, [autoPlay]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.volume = 0.15; audioRef.current.play(); setPlaying(true); }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button onClick={toggle} className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full glass glow-border flex items-center justify-center text-white/60 hover:text-white transition-colors" title={playing ? 'Mute' : 'Play music'}>
        {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </>
  );
}
