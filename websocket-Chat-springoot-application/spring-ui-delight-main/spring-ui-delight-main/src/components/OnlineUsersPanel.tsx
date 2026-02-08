import { motion, AnimatePresence } from 'framer-motion';
import { Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from './UserAvatar';
import { User } from '@/types/websocket';
import { cn } from '@/lib/utils';

interface OnlineUsersPanelProps {
  users: User[];
  onRefresh: () => void;
  currentUsername?: string | null;
  title?: string;
  icon?: React.ReactNode;
}

export function OnlineUsersPanel({ 
  users, 
  onRefresh, 
  currentUsername, 
  title = "Online Users",
  icon = <Users className="h-4 w-4 text-primary" />
}: OnlineUsersPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            {icon}
            {title}
            <span className="ml-1 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-success/20 text-success text-xs font-medium">
              {users.length}
            </span>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-60px)] px-4 pb-4">
          <AnimatePresence mode="popLayout">
            {users.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground text-center py-8"
              >
                No users online
              </motion.p>
            ) : (
              <div className="space-y-2">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg transition-colors',
                      user.username === currentUsername
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                    )}
                  >
                    <UserAvatar
                      username={user.username}
                      status={user.status}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.username}
                        {user.username === currentUsername && (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        )}
                      </p>
                      {user.currentRoom && (
                        <p className="text-xs text-muted-foreground truncate">
                          In: {user.currentRoom}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
