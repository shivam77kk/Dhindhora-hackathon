import { create } from 'zustand';
import api from '@/lib/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),

  register: async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      set({ user: res.data.data, error: null });
      if (typeof window !== 'undefined' && res.data.data.token) localStorage.setItem('dhindhora_token', res.data.data.token);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || 'Registration failed';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  login: async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      set({ user: res.data.data, error: null });
      if (typeof window !== 'undefined' && res.data.data.token) localStorage.setItem('dhindhora_token', res.data.data.token);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || 'Login failed';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {  }
    if (typeof window !== 'undefined') localStorage.removeItem('dhindhora_token');
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));

export default useAuthStore;
