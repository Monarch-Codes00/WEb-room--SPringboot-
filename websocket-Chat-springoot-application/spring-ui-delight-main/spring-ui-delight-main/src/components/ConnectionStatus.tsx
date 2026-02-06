import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConnectionState } from '@/types/websocket';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  onReconnect: () => void;
}

export function ConnectionStatus({ connectionState, onReconnect }: ConnectionStatusProps) {
  const { isConnected, lastPing, reconnectAttempts } = connectionState;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-2',
        isConnected 
          ? 'bg-success/10 text-success' 
          : 'bg-destructive/10 text-destructive'
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Connected</span>
          {lastPing && (
            <span className="text-xs text-muted-foreground">
              Last ping: {new Date(lastPing).toLocaleTimeString()}
            </span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Disconnected</span>
          {reconnectAttempts > 0 && (
            <span className="text-xs">Attempt {reconnectAttempts}/5</span>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReconnect}
            className="ml-2 h-7 px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        </>
      )}
    </motion.div>
  );
}
