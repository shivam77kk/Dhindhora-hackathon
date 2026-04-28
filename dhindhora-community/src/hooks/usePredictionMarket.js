'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import usePredictionStore from '@/store/predictionStore';

export default function usePredictionMarket(webreelId) {
  const [loading, setLoading] = useState(true);
  const { markets, setMarket } = usePredictionStore();

  useEffect(() => {
    if (webreelId) fetchMarket();
  }, [webreelId]);

  const fetchMarket = async () => {
    try {
      const { data } = await api.get(`/predictions/${webreelId}`);
      if (data.data) setMarket(webreelId, data.data);
    } catch (e) {  }
    finally { setLoading(false); }
  };

  return { market: markets[webreelId], loading, refetch: fetchMarket };
}
