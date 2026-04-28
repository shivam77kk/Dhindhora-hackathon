import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  musicPlaying: false,
  currentEmotion: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMusicPlaying: (playing) => set({ musicPlaying: playing }),
  setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
}));

export default useUIStore;
