import { create } from 'zustand';

const usePredictionStore = create((set) => ({
  markets: {},
  userBets: [],
  setMarket: (webreelId, data) => set((s) => ({ markets: { ...s.markets, [webreelId]: data } })),
  setUserBets: (bets) => set({ userBets: bets }),
}));

export default usePredictionStore;
