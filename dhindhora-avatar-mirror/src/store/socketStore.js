import { create } from 'zustand';

const useSocketStore = create((set) => ({
  socket: null,
  connected: false,
  viewers: 0,
  setSocket: (socket) => set({ socket, connected: !!socket }),
  setViewers: (viewers) => set({ viewers }),
  disconnect: () => set({ socket: null, connected: false, viewers: 0 }),
}));

export default useSocketStore;
