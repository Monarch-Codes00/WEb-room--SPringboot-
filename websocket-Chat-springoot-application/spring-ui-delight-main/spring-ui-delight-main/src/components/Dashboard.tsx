import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardHeader } from './DashboardHeader';
import { RoomCard } from './RoomCard';
import { OnlineUsersPanel } from './OnlineUsersPanel';
import { NotificationsFeed } from './NotificationsFeed';
import { useWebSocketContext } from '@/context/WebSocketContext';
import { Users } from 'lucide-react';

export function Dashboard() {
  const {
    username,
    logout,
    connectionState,
    connect,
    onlineUsers,
    rooms,
    currentRoom,
    notifications,
    joinRoom,
    leaveRoom,
    requestOnlineUsers,
  } = useWebSocketContext();

  useEffect(() => {
    if (username && !connectionState.isConnected) {
      connect();
    }
  }, [username, connect, connectionState.isConnected]);

  if (!username) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        username={username}
        connectionState={connectionState}
        onReconnect={connect}
        onLogout={logout}
      />

      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rooms Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Rooms</h2>
              <p className="text-muted-foreground">Join a room to see who's there</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <RoomCard
                    room={room}
                    isCurrentRoom={currentRoom === room.id}
                    onJoin={() => joinRoom(room.id)}
                    onLeave={leaveRoom}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6"
          >
            <div className="h-[300px]">
              <OnlineUsersPanel
                users={onlineUsers}
                onRefresh={requestOnlineUsers}
                currentUsername={username}
                title="Global Online Users"
              />
            </div>

            {currentRoom && (
              <div className="h-[300px]">
                <OnlineUsersPanel
                  users={rooms.find(r => r.id === currentRoom)?.users || []}
                  onRefresh={() => {}}
                  currentUsername={username}
                  title="Room Members"
                  icon={<Users className="h-4 w-4 text-success" />}
                />
              </div>
            )}

            <div className="h-[350px] md:col-span-2 xl:col-span-1">
              <NotificationsFeed notifications={notifications} />
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
