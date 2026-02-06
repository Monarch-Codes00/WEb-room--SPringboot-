// WebSocket message types matching Spring Boot backend
export enum MessageType {
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  PING = 'PING',
  SYSTEM = 'SYSTEM',
  ROOM_PRESENCE = 'ROOM_PRESENCE',
  ONLINE_USERS = 'ONLINE_USERS',
}

export interface User {
  id: string;
  username: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentRoom?: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  userCount: number;
  users: User[];
}

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: Date;
  senderId?: string;
  senderName?: string;
}

export interface JoinRoomPayload {
  roomId: string;
  username: string;
}

export interface LeaveRoomPayload {
  roomId: string;
  username: string;
}

export interface HeartbeatPayload {
  username: string;
}

export interface SystemNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

export interface ConnectionState {
  isConnected: boolean;
  lastPing: Date | null;
  reconnectAttempts: number;
}
