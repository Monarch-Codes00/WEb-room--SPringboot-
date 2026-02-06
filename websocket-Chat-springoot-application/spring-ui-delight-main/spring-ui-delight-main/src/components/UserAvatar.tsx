import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PresenceIndicator } from './PresenceIndicator';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  username: string;
  status?: 'online' | 'away' | 'offline';
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ 
  username, 
  status = 'offline', 
  showStatus = true,
  size = 'md',
  className 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const statusPositionClasses = {
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-0.5 -right-0.5',
    lg: '-bottom-1 -right-1',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-warning',
      'bg-destructive',
      'bg-accent-foreground',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarFallback className={cn(getAvatarColor(username), 'text-primary-foreground font-medium')}>
          {getInitials(username)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span className={cn('absolute', statusPositionClasses[size])}>
          <PresenceIndicator status={status} size="sm" />
        </span>
      )}
    </div>
  );
}
