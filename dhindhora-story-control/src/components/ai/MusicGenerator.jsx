'use client';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';

export default function MusicGenerator({ musicMetadata, autoPlay = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const synthRef = useRef(null);
  const loopRef = useRef(null);
  const reverbRef = useRef(null);
  const toneRef = useRef(null);

  useEffect(() => {
    if (!musicMetadata || !musicMetadata.toneJsSynthesis) return;
    
    const initTone = async () => {
      
      const Tone = await import('tone');
      toneRef.current = Tone;

      
      const reverb = new Tone.Reverb({
        decay: musicMetadata.toneJsSynthesis.reverbDecay || 3,
        wet: 0.6
      }).toDestination();
      
      reverbRef.current = reverb;

      
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: musicMetadata.toneJsSynthesis.oscillatorType || 'sine' },
        envelope: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 2 }
      }).connect(reverb);
      
      synthRef.current = synth;

      
      Tone.Transport.bpm.value = musicMetadata.bpm || 110;

      
      const sequence = musicMetadata.toneJsSynthesis.noteSequence || ['C4', 'E4', 'G4', 'B4'];
      let step = 0;
      
      const loop = new Tone.Loop((time) => {
        const note = sequence[step % sequence.length];
        const duration = musicMetadata.toneJsSynthesis.noteDuration || '8n';
        synth.triggerAttackRelease(note, duration, time, Math.random() * 0.3 + 0.5); 
        
        
        if (step % 8 === 0) {
          synth.triggerAttackRelease(note.replace('4', '2'), '1m', time, 0.4);
        }
        
        step++;
      }, '4n');

      loopRef.current = loop;
      setIsReady(true);

      if (autoPlay) {
        await Tone.start();
        Tone.Transport.start();
        loop.start(0);
        setIsPlaying(true);
      }
    };

    initTone();

    return () => {
      if (loopRef.current) loopRef.current.dispose();
      if (synthRef.current) synthRef.current.dispose();
      if (reverbRef.current) reverbRef.current.dispose();
      if (toneRef.current) toneRef.current.Transport.stop();
    };
  }, [musicMetadata, autoPlay]);

  const togglePlay = async () => {
    if (!isReady || !toneRef.current) return;
    const Tone = toneRef.current;
    
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (isPlaying) {
      Tone.Transport.stop();
    } else {
      Tone.Transport.start();
      loopRef.current.start(0);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!toneRef.current) return;
    const Tone = toneRef.current;
    Tone.Destination.mute = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!musicMetadata) return null;

  return (
    <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 w-fit">
      <button onClick={togglePlay} className="text-white hover:text-brand-400 transition-colors">
        {isPlaying ? <Square size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
      </button>
      
      <div className="flex flex-col mx-2 min-w-[120px]">
        <div className="text-xs font-semibold text-white truncate max-w-[150px]">
          {musicMetadata.mood} · {musicMetadata.instruments?.[0]}
        </div>
        <div className="flex gap-0.5 items-end h-3 mt-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full bg-brand-500 transition-all duration-300 ${isPlaying && !isMuted ? 'animate-pulse' : 'h-1'}`}
              style={{ 
                height: isPlaying && !isMuted ? `${Math.max(20, Math.random() * 100)}%` : '100%',
                animationDelay: `${i * 0.15}s`
              }} 
            />
          ))}
        </div>
      </div>

      <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors">
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}
