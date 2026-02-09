import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  connectionState: ReturnType<typeof useWebSocket>['connectionState'];
  onlineUsers: ReturnType<typeof useWebSocket>['onlineUsers'];
  rooms: ReturnType<typeof useWebSocket>['rooms'];
  currentRoom: ReturnType<typeof useWebSocket>['currentRoom'];
  notifications: ReturnType<typeof useWebSocket>['notifications'];
  connect: ReturnType<typeof useWebSocket>['connect'];
  disconnect: ReturnType<typeof useWebSocket>['disconnect'];
  joinRoom: ReturnType<typeof useWebSocket>['joinRoom'];
  leaveRoom: ReturnType<typeof useWebSocket>['leaveRoom'];
  requestOnlineUsers: ReturnType<typeof useWebSocket>['requestOnlineUsers'];
  requestRoomPresence: ReturnType<typeof useWebSocket>['requestRoomPresence'];
  sendMessage: ReturnType<typeof useWebSocket>['sendMessage'];
  messages: ReturnType<typeof useWebSocket>['messages'];
  rtc: ReturnType<typeof useWebRTC>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const websocket = useWebSocket(user?.username || null);
  const rtc = useWebRTC(user?.username || null, websocket.sendMessage);

  useEffect(() => {
    if (user?.username) {
      websocket.connect();
    }
    return () => {
      websocket.disconnect();
    };
  }, [user?.username]);

  return (
    <WebSocketContext.Provider
      value={{
        ...websocket,
        rtc,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
