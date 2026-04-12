'use client';
import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import useSocketStore from '@/store/socketStore';

export default function useSocket(webreelId, username) {
  const { setSocket, setViewers } = useSocketStore();

  useEffect(() => {
    const socket = connectSocket();
    setSocket(socket);

    socket.on('connect', () => {
      if (webreelId) socket.emit('join:webreel', { webreelId, username });
    });

    socket.on('viewers:update', ({ count }) => setViewers(count));

    return () => {
      if (webreelId) socket.emit('leave:webreel', { webreelId });
    };
  }, [webreelId, username]);
}
