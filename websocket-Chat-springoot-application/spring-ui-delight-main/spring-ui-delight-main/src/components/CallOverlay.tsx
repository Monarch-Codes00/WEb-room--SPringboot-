import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebSocketContext } from '@/context/WebSocketContext';
import { useEffect, useRef } from 'react';

export function CallOverlay() {
  const { rtc } = useWebSocketContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && rtc.localStream) {
      localVideoRef.current.srcObject = rtc.localStream;
    }
  }, [rtc.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && rtc.remoteStream) {
      remoteVideoRef.current.srcObject = rtc.remoteStream;
    }
  }, [rtc.remoteStream]);

  if (!rtc.isCalling && !rtc.incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <AnimatePresence>
        {rtc.incomingCall && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-sm text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-full bg-primary/20 animate-pulse">
                <Phone className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1">Incoming Call</h2>
            <p className="text-muted-foreground mb-6">from {rtc.incomingCall.from}</p>
            <div className="flex gap-4 justify-center">
              <Button variant="destructive" size="icon" className="w-12 h-12 rounded-full" onClick={rtc.declineCall}>
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button variant="success" size="icon" className="w-12 h-12 rounded-full" onClick={rtc.acceptCall}>
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        )}

        {rtc.isCalling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 right-4 w-48 aspect-video bg-muted rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10">
              <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                <Mic className="w-5 h-5" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full w-12 h-12" onClick={rtc.endCall}>
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
