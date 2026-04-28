'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function useMusicGenerator() {
  const [loading, setLoading] = useState(false);
  const [musicData, setMusicData] = useState(null);

  const generate = async ({ emotion, topic, colorPalette, musicMood, webreelId }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/music/generate', { emotion, topic, colorPalette, musicMood, webreelId });
      setMusicData(data.data);
      return data.data;
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, musicData, loading };
}
