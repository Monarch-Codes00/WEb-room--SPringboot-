import { motion } from 'framer-motion';
import { Users, DoorOpen, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { Room } from '@/types/websocket';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  isCurrentRoom: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export function RoomCard({ room, isCurrentRoom, onJoin, onLeave }: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          isCurrentRoom 
            ? 'border-primary shadow-glow ring-2 ring-primary/20' 
            : 'hover:shadow-card-hover hover:border-primary/30'
        )}
      >
        {isCurrentRoom && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
            <Badge 
              variant={isCurrentRoom ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              <Users className="h-3 w-3" />
              {room.userCount}
            </Badge>
          </div>
          {room.description && (
            <CardDescription>{room.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {room.users.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Active users:</p>
              <div className="flex flex-wrap gap-1">
                {room.users.slice(0, 5).map((user) => (
                  <UserAvatar
                    key={user.id}
                    username={user.username}
                    status={user.status}
                    size="sm"
                  />
                ))}
                {room.users.length > 5 && (
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs text-muted-foreground">
                    +{room.users.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}

          {isCurrentRoom ? (
            <Button 
              variant="outline" 
              className="w-full group"
              onClick={onLeave}
            >
              <DoorOpen className="mr-2 h-4 w-4 group-hover:text-destructive transition-colors" />
              Leave Room
            </Button>
          ) : (
            <Button 
              className="w-full"
              onClick={onJoin}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Join Room
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
