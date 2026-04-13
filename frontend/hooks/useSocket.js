'use client';
import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import useSocketStore from '@/store/socketStore';

export default function useSocket(webreelId, username) {
  const { socket, setSocket, setViewers } = useSocketStore();

  useEffect(() => {
    // Only connect if not already connected or if we have a new ID
    const socketInstance = connectSocket();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      if (webreelId) socketInstance.emit('join:webreel', { webreelId, username });
    });

    socketInstance.on('viewers:update', ({ count }) => setViewers(count));

    return () => {
      if (webreelId) socketInstance.emit('leave:webreel', { webreelId });
    };
  }, [webreelId, username, setSocket, setViewers]);

  return { socket };
}
