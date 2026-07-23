// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://api.societesmartbusiness.com/";  // ← URL directe, pas de proxy

let socketInstance: Socket | null = null;

export function getSocket(token: string | null | undefined): Socket | null {
  if (!token) {
    console.warn('[useSocket] Aucun token fourni → connexion socket annulée');
    return null;
  }

  if (!socketInstance || !socketInstance.connected) {
    console.log('[useSocket] Création nouvelle connexion Socket.IO');

    socketInstance = io(SOCKET_URL, {
      auth: {
        token: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      forceNew: false,
      autoConnect: true,
      timeout: 10000,
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO] Connecté → ID:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (err: Error) => {
      console.error('[Socket.IO] Erreur de connexion :', err.message);
    });

    socketInstance.on('disconnect', (reason: string) => {
      console.log('[Socket.IO] Déconnexion → raison:', reason);
      if (reason === 'io server disconnect') {
        console.warn('→ Déconnexion forcée par le serveur (token invalide ?)');
      }
    });
  }

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function useSocketEvent<T = unknown>(
  token: string | null | undefined,
  event: string,
  handler: (data: T) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    if (!socket) return;

    const wrappedHandler = (data: T) => {
      try {
        handlerRef.current(data);
      } catch (err) {
        console.error(`Erreur dans le handler de l'événement ${event}:`, err);
      }
    };

    socket.on(event, wrappedHandler);

    if (event === 'notification' || event.includes('unread')) {
      socket.emit('get-unread-count');
    }

    return () => {
      socket.off(event, wrappedHandler);
    };
  }, [token, event]);
}