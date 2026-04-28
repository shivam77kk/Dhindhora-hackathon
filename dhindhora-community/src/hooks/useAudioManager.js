'use client';
import { useRef, useState } from 'react';

export default function useAudioManager() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);

  const play = () => { if (audioRef.current) { audioRef.current.play(); setPlaying(true); } };
  const pause = () => { if (audioRef.current) { audioRef.current.pause(); setPlaying(false); } };
  const toggle = () => playing ? pause() : play();
  const setVolume = (v) => { if (audioRef.current) { audioRef.current.volume = v; setVolumeState(v); } };

  return { audioRef, playing, volume, play, pause, toggle, setVolume };
}
