import { motion } from 'framer-motion';
import { Zap, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './UserAvatar';
import { ConnectionStatus } from './ConnectionStatus';
import { ConnectionState } from '@/types/websocket';

interface DashboardHeaderProps {
  username: string;
  connectionState: ConnectionState;
  onReconnect: () => void;
  onLogout: () => void;
  onSettingsClick?: () => void;
}

export function DashboardHeader({ 
  username, 
  connectionState, 
  onReconnect, 
  onLogout,
  onSettingsClick
}: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:inline">Presence</span>
          </div>
          
          <div className="hidden md:block">
            <ConnectionStatus 
              connectionState={connectionState} 
              onReconnect={onReconnect} 
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
            <UserAvatar 
              username={username} 
              status={connectionState.isConnected ? 'online' : 'offline'} 
              size="sm"
            />
            <span className="text-sm font-medium hidden sm:inline">{username}</span>
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9" title="Settings" onClick={onSettingsClick}>
            <Settings className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive" 
            onClick={onLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Mobile connection status */}
      <div className="md:hidden px-4 pb-2">
        <ConnectionStatus 
          connectionState={connectionState} 
          onReconnect={onReconnect} 
        />
      </div>
    </motion.header>
  );
}
