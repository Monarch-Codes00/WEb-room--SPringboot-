import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageType, WebSocketMessage, User, Room, ConnectionState, SystemNotification } from '@/types/websocket';

const WEBSOCKET_URL = 'ws://localhost:8080/ws'; // Update this to your Spring Boot WebSocket URL
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(username: string | null) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    lastPing: null,
    reconnectAttempts: 0,
  });
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'general', name: 'General', description: 'General discussion room', userCount: 0, users: [] },
    { id: 'tech', name: 'Technology', description: 'Tech talk and discussions', userCount: 0, users: [] },
    { id: 'random', name: 'Random', description: 'Off-topic conversations', userCount: 0, users: [] },
    { id: 'announcements', name: 'Announcements', description: 'Important updates', userCount: 0, users: [] },
  ]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addNotification = useCallback((message: string, type: SystemNotification['type'] = 'info') => {
    const notification: SystemNotification = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  }, []);

  const sendMessage = useCallback((type: MessageType, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date(),
        senderId: username || undefined,
        senderName: username || undefined,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }, [username]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN && username) {
        sendMessage(MessageType.PING, { username });
        setConnectionState(prev => ({ ...prev, lastPing: new Date() }));
      }
    }, HEARTBEAT_INTERVAL);
  }, [sendMessage, username]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case MessageType.ONLINE_USERS:
          setOnlineUsers(message.payload.users || []);
          break;
        
        case MessageType.ROOM_PRESENCE:
          const roomId = message.payload.roomId;
          const roomUsers = message.payload.users || [];
          setRooms(prev => prev.map(room => 
            room.id === roomId 
              ? { ...room, users: roomUsers, userCount: roomUsers.length }
              : room
          ));
          break;
        
        case MessageType.SYSTEM:
          addNotification(message.payload.message, message.payload.notificationType || 'info');
          break;
        
        case MessageType.JOIN:
          addNotification(`${message.payload.username} joined ${message.payload.roomName || 'the room'}`, 'success');
          break;
        
        case MessageType.LEAVE:
          addNotification(`${message.payload.username} left ${message.payload.roomName || 'the room'}`, 'warning');
          break;
        
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [addNotification]);

  const connect = useCallback(() => {
    if (!username) return;

    try {
      wsRef.current = new WebSocket(WEBSOCKET_URL);

      wsRef.current.onopen = () => {
        setConnectionState({
          isConnected: true,
          lastPing: new Date(),
          reconnectAttempts: 0,
        });
        addNotification('Connected to server', 'success');
        startHeartbeat();
        
        // Request online users after connection
        sendMessage(MessageType.ONLINE_USERS, { username });
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = () => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
        }));
        
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }

        // Attempt reconnection
        if (connectionState.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionState(prev => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
            }));
            connect();
          }, RECONNECT_DELAY);
        }
      };

      wsRef.current.onerror = () => {
        addNotification('Connection error occurred', 'error');
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      addNotification('Failed to connect to server', 'error');
    }
  }, [username, handleMessage, startHeartbeat, sendMessage, addNotification, connectionState.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState({
      isConnected: false,
      lastPing: null,
      reconnectAttempts: 0,
    });
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (currentRoom) {
      sendMessage(MessageType.LEAVE, { roomId: currentRoom, username });
    }
    sendMessage(MessageType.JOIN, { roomId, username });
    setCurrentRoom(roomId);
    sendMessage(MessageType.ROOM_PRESENCE, { roomId });
  }, [currentRoom, sendMessage, username]);

  const leaveRoom = useCallback(() => {
    if (currentRoom) {
      sendMessage(MessageType.LEAVE, { roomId: currentRoom, username });
      setCurrentRoom(null);
    }
  }, [currentRoom, sendMessage, username]);

  const requestOnlineUsers = useCallback(() => {
    sendMessage(MessageType.ONLINE_USERS, { username });
  }, [sendMessage, username]);

  const requestRoomPresence = useCallback((roomId: string) => {
    sendMessage(MessageType.ROOM_PRESENCE, { roomId });
  }, [sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    onlineUsers,
    rooms,
    currentRoom,
    notifications,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    requestOnlineUsers,
    requestRoomPresence,
    sendMessage,
  };
}
