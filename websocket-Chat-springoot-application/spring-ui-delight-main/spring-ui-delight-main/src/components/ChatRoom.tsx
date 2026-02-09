import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebSocketContext } from '@/context/WebSocketContext';
import { MessageType } from '@/types/websocket';
import { UserAvatar } from './UserAvatar';
import { format } from 'date-fns';

interface ChatRoomProps {
  roomId: string;
  onBack: () => void;
}

export function ChatRoom({ roomId, onBack }: ChatRoomProps) {
  const { messages, sendMessage, rooms, username } = useWebSocketContext();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const room = rooms.find(r => r.id === roomId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    sendMessage(MessageType.CHAT, {
      content: inputValue,
      roomId: roomId
    });
    setInputValue('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-[600px] border rounded-2xl bg-card shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{room?.name || 'Chat Room'}</h3>
            <p className="text-xs text-muted-foreground">{room?.userCount || 0} participants</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe = msg.senderName === username;
              return (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <UserAvatar username={msg.senderName} size="sm" className="mt-1" />
                    <div>
                      {!isMe && (
                        <p className="text-xs font-semibold mb-1 ml-1 text-muted-foreground">
                          {msg.senderName}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all ${
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-[10px] mt-1 text-muted-foreground ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {format(msg.timestamp, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-muted/20">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="rounded-xl border-none bg-background shadow-inner"
          />
          <Button type="submit" size="icon" className="rounded-xl shadow-lg shadow-primary/20 shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
