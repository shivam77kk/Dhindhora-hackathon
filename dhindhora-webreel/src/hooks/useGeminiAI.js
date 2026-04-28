'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function useGeminiAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async (topic, category) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/ai/generate-webreel-content', { topic, category });
      return data.data;
    } catch (e) {
      setError(e.response?.data?.message || 'AI generation failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const chat = async (message, persona, history) => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message, persona, history });
      return data.data.reply;
    } catch (e) {
      return 'AI is taking a break. Try again!';
    } finally {
      setLoading(false);
    }
  };

  return { generateContent, chat, loading, error };
}
