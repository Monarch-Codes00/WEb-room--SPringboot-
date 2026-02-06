import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketContextType {
  username: string | null;
  setUsername: (name: string | null) => void;
  isLoggedIn: boolean;
  login: (name: string) => void;
  logout: () => void;
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
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const websocket = useWebSocket(username);

  const login = useCallback((name: string) => {
    setUsername(name);
  }, []);

  const logout = useCallback(() => {
    websocket.disconnect();
    setUsername(null);
  }, [websocket]);

  return (
    <WebSocketContext.Provider
      value={{
        username,
        setUsername,
        isLoggedIn: !!username,
        login,
        logout,
        ...websocket,
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
