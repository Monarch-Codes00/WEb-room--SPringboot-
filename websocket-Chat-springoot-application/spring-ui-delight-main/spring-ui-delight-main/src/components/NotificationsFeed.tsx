import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SystemNotification } from '@/types/websocket';
import { cn } from '@/lib/utils';

interface NotificationsFeedProps {
  notifications: SystemNotification[];
}

export function NotificationsFeed({ notifications }: NotificationsFeedProps) {
  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getBackgroundClass = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success/5 border-l-success';
      case 'warning':
        return 'bg-warning/5 border-l-warning';
      case 'error':
        return 'bg-destructive/5 border-l-destructive';
      default:
        return 'bg-primary/5 border-l-primary';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bell className="h-4 w-4 text-primary" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-60px)] px-4 pb-4">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground text-center py-8"
              >
                No recent activity
              </motion.p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border-l-2',
                      getBackgroundClass(notification.type)
                    )}
                  >
                    <span className="mt-0.5">{getIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
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
