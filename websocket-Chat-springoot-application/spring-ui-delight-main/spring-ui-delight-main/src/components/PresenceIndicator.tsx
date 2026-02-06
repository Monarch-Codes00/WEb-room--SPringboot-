import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  status: 'online' | 'away' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export function PresenceIndicator({ 
  status, 
  size = 'md', 
  showPulse = true,
  className 
}: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const statusClasses = {
    online: 'bg-online',
    away: 'bg-away',
    offline: 'bg-offline',
  };

  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'rounded-full',
          sizeClasses[size],
          statusClasses[status]
        )}
      />
      {status === 'online' && showPulse && (
        <span
          className={cn(
            'absolute rounded-full bg-online opacity-75 animate-pulse-ring',
            sizeClasses[size]
          )}
        />
      )}
    </span>
  );
}
