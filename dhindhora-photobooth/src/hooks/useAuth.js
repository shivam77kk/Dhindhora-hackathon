'use client';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export default function useAuth() {
  const { user, loading, checkAuth, login, register, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, login, register, logout, isAuthenticated: !!user };
}
