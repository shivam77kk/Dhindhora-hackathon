import { useState, useRef, useEffect } from 'react';
import api from '../lib/api';

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [trackInfo, setTrackInfo] = useState(null);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    api.get('/v1/music/track/hub')
      .then(res => {
        if (res.data?.data) setTrackInfo(res.data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const tryPlay = () => {
      if (!hasInteracted.current && audioRef.current && trackInfo) {
        hasInteracted.current = true;
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    };
    window.addEventListener('click', tryPlay, { once: true });
    window.addEventListener('keydown', tryPlay, { once: true });
    return () => {
      window.removeEventListener('click', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
  }, [trackInfo, volume]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  if (!trackInfo) return null;

  return (
    <div className="music-player glass">
      <audio ref={audioRef} src={trackInfo.trackUrl} loop preload="auto" />
      <div className="music-bars">
        {[1, 2, 3, 4].map(i => (
          <span key={i} style={{ animationPlayState: playing ? 'running' : 'paused' }} />
        ))}
      </div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {trackInfo.title}
      </span>
      <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleVolume}
        style={{ width: 50, accentColor: 'var(--primary)', cursor: 'pointer' }}
        aria-label="Volume"
      />
    </div>
  );
}
