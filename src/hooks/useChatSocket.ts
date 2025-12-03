import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export function useChatSocket(
  socketUrl: string,
  token: string,
  userId: string
) {
  const socketRef = useRef<Socket>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(socketUrl, {
      auth: { token, userId, userModel: 'Student' },
      transports: ['websocket'],
      reconnection: true
    });
    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));
    return () => {
      socketRef.current?.disconnect();
    };
  }, [socketUrl, token, userId]);

  const emit = useCallback((event: string, data: any, cb?: Function) => {
    socketRef.current?.emit(event, data, cb);
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  return { connected, emit, on };
}
