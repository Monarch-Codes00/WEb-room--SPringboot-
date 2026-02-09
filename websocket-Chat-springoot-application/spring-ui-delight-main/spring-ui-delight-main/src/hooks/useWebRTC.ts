import { useState, useCallback, useEffect, useRef } from 'react';
import { MessageType, WebSocketMessage } from '@/types/websocket';

export function useWebRTC(username: string | null, sendMessage: (type: MessageType, payload: any) => void) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ from: string; type: 'audio' | 'video' } | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setIncomingCall(null);
  }, [localStream]);

  const initPeerConnection = useCallback(() => {
    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage(MessageType.ICE_CANDIDATE, event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, localStream);
      });
    }
  }, [localStream, sendMessage]);

  const startCall = useCallback(async (to: string, type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      setLocalStream(stream);
      setIsCalling(true);
      
      sendMessage(MessageType.CALL_REQUEST, { to, from: username, type });
    } catch (err) {
      console.error('Failed to get media stream', err);
    }
  }, [username, sendMessage]);

  const handleSignal = useCallback(async (message: WebSocketMessage) => {
    switch (message.type) {
      case MessageType.CALL_REQUEST:
        setIncomingCall({ from: message.payload.from, type: message.payload.type });
        break;

      case MessageType.CALL_RESPONSE:
        if (message.payload.accepted) {
          initPeerConnection();
          const offer = await peerConnection.current?.createOffer();
          await peerConnection.current?.setLocalDescription(offer);
          sendMessage(MessageType.OFFER, offer);
        } else {
          cleanup();
        }
        break;

      case MessageType.OFFER:
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.payload));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          sendMessage(MessageType.ANSWER, answer);
        }
        break;

      case MessageType.ANSWER:
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.payload));
        }
        break;

      case MessageType.ICE_CANDIDATE:
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(message.payload));
        }
        break;

      case MessageType.CALL_HANGUP:
        cleanup();
        break;
    }
  }, [initPeerConnection, sendMessage, cleanup]);

  useEffect(() => {
    const onSignal = (e: any) => handleSignal(e.detail);
    window.addEventListener('webrtc-signal', onSignal);
    return () => window.removeEventListener('webrtc-signal', onSignal);
  }, [handleSignal]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.type === 'video',
      });
      setLocalStream(stream);
      setIsCalling(true);
      sendMessage(MessageType.CALL_RESPONSE, { to: incomingCall.from, accepted: true });
      initPeerConnection();
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to get media stream', err);
    }
  }, [incomingCall, sendMessage, initPeerConnection]);

  const declineCall = useCallback(() => {
    if (!incomingCall) return;
    sendMessage(MessageType.CALL_RESPONSE, { to: incomingCall.from, accepted: false });
    setIncomingCall(null);
  }, [incomingCall, sendMessage]);

  const endCall = useCallback(() => {
    sendMessage(MessageType.CALL_HANGUP, {});
    cleanup();
  }, [sendMessage, cleanup]);

  return {
    localStream,
    remoteStream,
    isCalling,
    incomingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
  };
}
