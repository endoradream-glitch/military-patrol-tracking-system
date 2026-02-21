'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Shield, Radio, MapPin, AlertTriangle, Clock, Users, Map, Video, Phone, PhoneOff, Navigation, Wifi, WifiOff, VideoOff, Mic, MicOff, Maximize, Minimize, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';

// Dynamically import map components with SSR disabled to prevent window is not defined errors
const PatrolMap = dynamic(() => import('@/components/maps/PatrolMap').then(mod => ({ default: mod.PatrolMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  )
});

const HQMap = dynamic(() => import('@/components/maps/HQMap').then(mod => ({ default: mod.HQMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  )
});

import { VideoCallPopup } from '@/components/VideoCallPopup';
import { SuperAdminDashboard } from '@/components/SuperAdminDashboard';

type View = 'landing' | 'patrol-register' | 'patrol-dashboard' | 'hq-dashboard' | 'super-admin';
type UserRole = 'hq' | 'patrol' | null;

interface PatrolData {
  id: string;
  code: string;
  name: string;
  camp: string;
  unit: string;
  strength: number;
  status: string;
}

interface PatrolLocation {
  patrolId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Helper function for default logo (available to all components)
const DEFAULT_LOGO = '/images/logo.png';

// Helper function to get WebSocket URL based on environment
const getWebSocketUrl = () => {
  // In production, use the Railway WebSocket URL
  if (process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  }
  // In development, use the local WebSocket service with XTransformPort
  return '/?XTransformPort=3003';
};

export default function HomePage() {
  const [view, setView] = useState<View>('landing');
  const [role, setRole] = useState<UserRole>(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [patrolData, setPatrolData] = useState<PatrolData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isPatrolling, setIsPatrolling] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationHistory, setLocationHistory] = useState<PatrolLocation[]>([]);
  const [bufferedLocations, setBufferedLocations] = useState<any[]>([]);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localVideoRef, setLocalVideoRef] = useState<HTMLVideoElement | null>(null);
  const [remoteVideoRef, setRemoteVideoRef] = useState<HTMLVideoElement | null>(null);
  const [hqPatrols, setHqPatrols] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [showSosPanel, setShowSosPanel] = useState(false);
  const [showPatrolList, setShowPatrolList] = useState(false);
  const [mapMaximized, setMapMaximized] = useState(false);

  // Super Admin State
  const [superAdmin, setSuperAdmin] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState('');

  // HQ State
  const [currentHQ, setCurrentHQ] = useState<any>(null);

  // WebRTC & Call Popup State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [callPopupOpen, setCallPopupOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [callPartner, setCallPartner] = useState<string>('');
  const [currentCallId, setCurrentCallId] = useState<string>('');

  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callDurationRef = useRef<NodeJS.Timeout | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncBufferedLocations = async () => {
    if (bufferedLocations.length === 0 || !patrolData) return;
    try {
      await fetch('/api/patrol/location/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patrolId: patrolData.id,
          locations: bufferedLocations
        })
      });
      setBufferedLocations([]);
    } catch (error) {
      console.error('Failed to sync buffered locations:', error);
    }
  };

  useEffect(() => {
    if (isOnline && bufferedLocations.length > 0) {
      syncBufferedLocations();
    }
  }, [isOnline, bufferedLocations]);

  // WebRTC Helper Functions
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && currentCallId) {
        const target = role === 'hq' ? (patrolData?.id || '') : 'hq';
        socket.emit('webrtc:ice-candidate', {
          callId: currentCallId,
          target,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('Peer connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
        startCallTimer();
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall('connection lost');
      }
    };

    return pc;
  };

  const startCallTimer = () => {
    setCallDuration(0);
    if (callDurationRef.current) {
      clearInterval(callDurationRef.current);
    }
    callDurationRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callDurationRef.current) {
      clearInterval(callDurationRef.current);
      callDurationRef.current = null;
    }
  };

  const getLocalMedia = async (callType: 'video' | 'audio') => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error getting media:', error);
      throw error;
    }
  };

  const startCall = async (targetId: string, callType: 'video' | 'audio', isInitiator: boolean) => {
    try {
      console.log('Starting call:', { targetId, callType, isInitiator });
      const stream = await getLocalMedia(callType);
      const pc = createPeerConnection();

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      setPeerConnection(pc);
      setCallStatus('connecting');
      setCallPopupOpen(true);
      setCallPartner(role === 'hq' ? targetId : 'HQ Control');
      const newCallId = `call_${Date.now()}`;
      setCurrentCallId(newCallId);

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit('webrtc:offer', {
          callId: newCallId,
          target: targetId,
          offer: offer,
          callType
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      endCall('failed to start');
    }
  };

  const handleIncomingCall = async (callData: any) => {
    console.log('Incoming call:', callData);
    setIncomingCall(callData);
  };

  const acceptCall = async () => {
    if (!incomingCall || !socket || !patrolData) return;

    try {
      const stream = await getLocalMedia(incomingCall.callType);
      const pc = createPeerConnection();

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      setPeerConnection(pc);
      setCurrentCallId(incomingCall.callId);
      setCallStatus('connecting');
      setCallPopupOpen(true);
      setCallPartner('HQ Control');
      setIncomingCall(null);

      // Wait for offer
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall('failed to accept');
    }
  };

  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit('call:ended', {
        callId: incomingCall.callId,
        target: 'hq',
        reason: 'rejected'
      });
    }
    setIncomingCall(null);
  };

  const endCall = (reason: string = 'ended') => {
    console.log('Ending call:', reason);

    // Stop tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    // Notify remote
    if (socket && currentCallId) {
      const target = role === 'hq' ? (patrolData?.id || '') : 'hq';
      socket.emit('call:ended', {
        callId: currentCallId,
        target,
        reason
      });
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setCallPopupOpen(false);
    setCallStatus('connecting');
    stopCallTimer();
    setCallDuration(0);
    setCurrentCallId('');
    setActiveCall(null);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (accessCode === '92481526') {
      // Super Admin login
      if (!adminPassword) {
        setError('Password is required for Super Admin access');
        return;
      }

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: accessCode, password: adminPassword })
        });

        if (res.ok) {
          const data = await res.json();
          setSuperAdmin(data.admin);
          setView('super-admin');
        } else {
          const errorData = await res.json();
          setError(errorData.error || 'Login failed');
        }
      } catch (err) {
        setError('Login failed. Please try again.');
      }
    } else if (accessCode === '8993') {
      // HQ login - fetch HQ info by code
      try {
        const res = await fetch(`/api/hq/by-code/${accessCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.hq) {
            if (!data.hq.isApproved) {
              setError('Your HQ account is pending approval. Please contact administrator.');
              return;
            }
            if (!data.hq.isActive) {
              setError('Your HQ account has been deactivated. Please contact administrator.');
              return;
            }
            // Check subscription
            if (data.hq.currentSubscription) {
              const now = new Date();
              const endDate = new Date(data.hq.currentSubscription.endDate);
              if (endDate < now) {
                setError('Your subscription has expired. Please contact administrator.');
                return;
              }
            } else {
              setError('No active subscription found. Please contact administrator.');
              return;
            }
            setCurrentHQ(data.hq);
            setRole('hq');
            setView('hq-dashboard');
            initializeHqConnection();
          } else {
            setError('Invalid HQ code. Please try again.');
          }
        } else {
          setError('HQ not found. Please contact administrator.');
        }
      } catch (err) {
        setError('Login failed. Please try again.');
      }
    } else if (accessCode === '1526') {
      setRole('patrol');
      setView('patrol-register');
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  const handlePatrolRegister = async (data: any) => {
    setPatrolData(data);
    setView('patrol-dashboard');
    initializePatrolConnection(data.id);
  };

  const initializePatrolConnection = (patrolId: string) => {
    const wsUrl = getWebSocketUrl();
    const newSocket = io(wsUrl, {
      path: '/',
      transports: ['websocket', 'polling'],
      secure: process.env.NODE_ENV === 'production',
      forceNew: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    newSocket.on('connect', () => {
      console.log('Connected to tracking service');
      newSocket.emit('patrol:connect', { patrolId });
    });
    newSocket.on('patrol:incoming:call', handleIncomingCall);
    newSocket.on('patrol:sos:route', (data) => {
      console.log('SOS route received:', data);
    });

    // WebRTC Signaling Events
    newSocket.on('webrtc:offer', async (data: any) => {
      console.log('Received WebRTC offer:', data);
      if (!peerConnection) {
        await acceptCall();
      }
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        newSocket.emit('webrtc:answer', {
          callId: data.callId,
          target: 'hq',
          answer: answer
        });
      }
    });

    newSocket.on('webrtc:answer', async (data: any) => {
      console.log('Received WebRTC answer:', data);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    newSocket.on('webrtc:ice-candidate', async (data: any) => {
      console.log('Received ICE candidate:', data);
      if (peerConnection && data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    newSocket.on('call:ended', (data: any) => {
      console.log('Call ended:', data);
      endCall(data.reason || 'remote ended');
    });

    setSocket(newSocket);
  };

  const initializeHqConnection = () => {
    const wsUrl = getWebSocketUrl();
    const newSocket = io(wsUrl, {
      path: '/',
      transports: ['websocket', 'polling'],
      secure: process.env.NODE_ENV === 'production',
      forceNew: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    newSocket.on('connect', () => {
      console.log('HQ connected to tracking service');
      newSocket.emit('hq:connect', { role: 'hq' });
    });
    newSocket.on('patrol:location:update', (data) => {
      setHqPatrols((prev) => {
        const exists = prev.find(p => p.id === data.patrolId);
        if (exists) {
          return prev.map(p => p.id === data.patrolId 
            ? { ...p, latitude: data.latitude, longitude: data.longitude, lastUpdate: data.timestamp }
            : p
          );
        }
        return prev;
      });
    });
    newSocket.on('patrol:started', (data) => {
      setHqPatrols((prev) => prev.map(p => p.id === data.patrolId 
        ? { ...p, status: 'patrolling', sessionId: data.sessionId }
        : p
      ));
    });
    newSocket.on('patrol:stopped', (data) => {
      setHqPatrols((prev) => prev.map(p => p.id === data.patrolId 
        ? { ...p, status: 'idle' }
        : p
      ));
    });
    newSocket.on('sos:alert', (data) => {
      setSosAlerts((prev) => [data, ...prev]);
      setShowSosPanel(true);
    });
    newSocket.on('sos:status:updated', (data) => {
      setSosAlerts((prev) => prev.map(sos => sos.id === data.sosId 
        ? { ...sos, status: data.status }
        : sos
      ));
    });

    // WebRTC Signaling Events for HQ
    newSocket.on('webrtc:offer', async (data: any) => {
      console.log('HQ received WebRTC offer from patrol:', data);
      // HQ receives offer when patrol initiates call
    });

    newSocket.on('webrtc:answer', async (data: any) => {
      console.log('HQ received WebRTC answer:', data);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    newSocket.on('webrtc:ice-candidate', async (data: any) => {
      console.log('HQ received ICE candidate:', data);
      if (peerConnection && data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    newSocket.on('call:ended', (data: any) => {
      console.log('Call ended:', data);
      endCall(data.reason || 'remote ended');
    });

    setSocket(newSocket);
    loadHqData();
  };

  const loadHqData = async () => {
    try {
      // Reload HQ information if we have a code
      if (currentHQ?.code) {
        const hqRes = await fetch(`/api/hq/by-code/${currentHQ.code}`);
        if (hqRes.ok) {
          const hqData = await hqRes.json();
          if (hqData.success) {
            setCurrentHQ(hqData.hq);
          }
        }
      }

      const patrolsRes = await fetch('/api/hq/patrols');
      const patrolsData = await patrolsRes.json();
      if (patrolsData.success) {
        setHqPatrols(patrolsData.patrols);
      }
      const sosRes = await fetch('/api/hq/sos');
      const sosData = await sosRes.json();
      if (sosData.success) {
        setSosAlerts(sosData.alerts);
      }
    } catch (error) {
      console.error('Failed to load HQ data:', error);
    }
  };

  const togglePatrol = async () => {
    if (!patrolData) return;
    try {
      const action = isPatrolling ? 'stop' : 'start';
      const response = await fetch('/api/patrol/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patrolId: patrolData.id, action })
      });
      if (response.ok) {
        setIsPatrolling(!isPatrolling);
        if (!isPatrolling) {
          startGpsTracking();
          socket?.emit('patrol:start', { patrolId: patrolData.id, sessionId: `session_${Date.now()}` });
        } else {
          stopGpsTracking();
          socket?.emit('patrol:stop', { patrolId: patrolData.id, sessionId: `session_${Date.now()}` });
        }
      }
    } catch (error) {
      console.error('Failed to toggle patrol:', error);
    }
  };

  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, altitude, accuracy } = position.coords;
          const location = {
            patrolId: patrolData!.id,
            latitude,
            longitude,
            altitude,
            accuracy,
            timestamp: new Date().toISOString()
          };
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLocationHistory((prev) => [...prev, location].slice(-100));
          if (isOnline) {
            try {
              await fetch('/api/patrol/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(location)
              });
              socket?.emit('patrol:location', location);
            } catch (error) {
              console.error('Failed to send location:', error);
              setBufferedLocations((prev) => [...prev, location]);
            }
          } else {
            setBufferedLocations((prev) => [...prev, location]);
          }
        },
        (error) => {
          console.error('GPS error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }, 3000);
  };

  const stopGpsTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  const triggerSos = async () => {
    if (!patrolData || !currentLocation) return;
    try {
      const response = await fetch('/api/patrol/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patrolId: patrolData.id,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          message: 'SOS - Emergency assistance required'
        })
      });
      if (response.ok) {
        socket?.emit('patrol:sos', {
          patrolId: patrolData.id,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          message: 'SOS - Emergency assistance required'
        });
        alert('SOS alert sent! HQ and nearby patrols have been notified.');
      }
    } catch (error) {
      console.error('Failed to send SOS:', error);
    }
  };

  const handleCallResponse = async (accepted: boolean) => {
    if (accepted) {
      setActiveCall({
        ...incomingCall,
        startTime: new Date()
      });
      // Initialize WebRTC here
    }
    socket?.emit('patrol:call:response', {
      callId: incomingCall.callId,
      accepted
    });
    setIncomingCall(null);
  };

  const handleLogout = () => {
    if (isPatrolling) {
      stopGpsTracking();
    }
    socket?.disconnect();
    setView('landing');
    setRole(null);
    setAccessCode('');
    setError('');
    setPatrolData(null);
    setIsPatrolling(false);
    setCurrentLocation(null);
    setLocationHistory([]);
    setBufferedLocations([]);
    setCurrentHQ(null);
  };

  // Get background image based on view
  const getBackgroundImage = () => {
    switch (view) {
      case 'landing':
        return 'url(/images/dashboard-backgrounds/background-1.png)';
      case 'patrol-dashboard':
      case 'patrol-register':
        return 'url(/images/dashboard-backgrounds/background-2.png)';
      case 'hq-dashboard':
        return 'url(/images/dashboard-backgrounds/background-3.png)';
      case 'super-admin':
        return 'url(/images/dashboard-backgrounds/background-1.png)';
      default:
        return 'url(/images/dashboard-backgrounds/background-1.png)';
    }
  };

  // Get default logo
  const getDefaultLogo = () => DEFAULT_LOGO;

  return (
    <div 
      className="min-h-screen bg-slate-950 bg-cover bg-center bg-no-repeat bg-fixed flex flex-col"
      style={{ backgroundImage: getBackgroundImage() }}
    >
      {/* Very light overlay for background visibility */}
      <div className="absolute inset-0 bg-slate-950/15 backdrop-blur-[1px] -z-10"></div>
      {/* Header */}
      <header className="border-b border-slate-800/85 bg-slate-950/85 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {currentHQ?.logoUrl ? (
              <img
                src={currentHQ.logoUrl}
                alt={currentHQ.displayName || currentHQ.name}
                className="w-8 h-8 md:w-10 md:h-10 object-contain bg-transparent rounded-lg border border-slate-700/85 drop-shadow-lg"
              />
            ) : (
              <img
                src={getDefaultLogo()}
                alt="Military Logo"
                className="w-8 h-8 md:w-10 md:h-10 object-contain bg-transparent rounded-lg border border-slate-700/85 drop-shadow-lg"
              />
            )}
            <div>
              <h1 className="text-sm md:text-lg font-bold text-white drop-shadow-md">
                {currentHQ?.displayName || currentHQ?.name || 'Military Patrol Tracking'}
              </h1>
              <p className="text-[10px] md:text-xs text-slate-200 drop-shadow-sm hidden sm:block">
                {currentHQ ? `${currentHQ.name} • Developed by Major Wahid` : 'Military Patrol Tracking System • Developed by Major Wahid'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {role && (
              <>
                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  {isOnline ? (
                    <Wifi className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                  ) : (
                    <WifiOff className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                  )}
                  <span className={`${isOnline ? 'text-emerald-500' : 'text-red-500'} hidden sm:inline`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="border-slate-700/85 bg-slate-950/85 text-slate-100 hover:bg-slate-800/85 h-8 md:h-10 px-2 md:px-4 text-xs md:text-sm drop-shadow-md"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-8"
            >
              <LandingPage
                accessCode={accessCode}
                setAccessCode={setAccessCode}
                adminPassword={adminPassword}
                setAdminPassword={setAdminPassword}
                onSubmit={handleCodeSubmit}
                error={error}
              />
            </motion.div>
          )}

          {view === 'patrol-register' && (
            <motion.div
              key="patrol-register"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="container mx-auto px-4 py-8"
            >
              <PatrolRegistration onRegister={handlePatrolRegister} onCancel={handleLogout} />
            </motion.div>
          )}

          {view === 'patrol-dashboard' && patrolData && (
            <motion.div
              key="patrol-dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <PatrolDashboard
                patrolData={patrolData}
                currentTime={currentTime}
                isPatrolling={isPatrolling}
                isOnline={isOnline}
                currentLocation={currentLocation}
                locationHistory={locationHistory}
                bufferedLocations={bufferedLocations}
                incomingCall={incomingCall}
                activeCall={activeCall}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                onTogglePatrol={togglePatrol}
                onSos={triggerSos}
                onInitiateCall={startCall}
                onEndCall={endCall}
                onToggleVideo={toggleVideo}
                onToggleAudio={toggleAudio}
                hq={currentHQ}
              />
            </motion.div>
          )}

          {view === 'hq-dashboard' && (
            <motion.div
              key="hq-dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <HQDashboard
                currentTime={currentTime}
                patrols={hqPatrols}
                sosAlerts={sosAlerts}
                showSosPanel={showSosPanel}
                showPatrolList={showPatrolList}
                mapMaximized={mapMaximized}
                onToggleSosPanel={() => setShowSosPanel(!showSosPanel)}
                onTogglePatrolList={() => setShowPatrolList(!showPatrolList)}
                onToggleMapMaximize={() => setMapMaximized(!mapMaximized)}
                onRefresh={loadHqData}
                hq={currentHQ}
              />
            </motion.div>
          )}

          {view === 'super-admin' && (
            <motion.div
              key="super-admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <SuperAdminDashboard
                admin={superAdmin}
                onLogout={() => {
                  setSuperAdmin(null);
                  setAdminPassword('');
                  setView('landing');
                  setAccessCode('');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/85 bg-slate-950/85 backdrop-blur-sm py-2 md:py-3 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-[10px] md:text-sm text-white drop-shadow-md">
            <span>Developed by Major Wahid</span>
            <span className="text-slate-300">|</span>
            <span>10 Div HQ</span>
          </div>
        </div>
      </footer>

      {/* Incoming Call Modal */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <Card className="bg-slate-900/85 border-slate-700/85 max-w-md w-full shadow-2xl backdrop-blur-md">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/95 to-emerald-700/95 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse drop-shadow-lg">
                  {incomingCall.callType === 'video' ? (
                    <Video className="w-10 h-10 text-white" />
                  ) : (
                    <Phone className="w-10 h-10 text-white" />
                  )}
                </div>
                <CardTitle className="text-white text-2xl drop-shadow-md">Incoming Call</CardTitle>
                <CardDescription className="text-slate-200 text-base mt-2 drop-shadow-sm">
                  {incomingCall.callType === 'video' ? 'Video' : 'Audio'} call from <span className="text-emerald-400 font-semibold drop-shadow-md">{incomingCall.from}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={acceptCall}
                    className="flex-1 h-14 bg-emerald-600/95 hover:bg-emerald-700/95 text-lg font-semibold drop-shadow-md"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={rejectCall}
                    variant="destructive"
                    className="flex-1 h-14 bg-red-600/95 hover:bg-red-700/95 text-lg font-semibold drop-shadow-md"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Popup */}
      <VideoCallPopup
        isOpen={callPopupOpen}
        onClose={() => setCallPopupOpen(false)}
        callType={activeCall?.callType || 'video'}
        remoteStream={remoteStream}
        localStream={localStream}
        isMuted={!isAudioEnabled}
        isVideoOff={!isVideoEnabled}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onEndCall={() => endCall('user ended')}
        callStatus={callStatus}
        participantName={callPartner}
        duration={callDuration}
      />
    </div>
  );
}

// Landing Page Component
function LandingPage({ accessCode, setAccessCode, adminPassword, setAdminPassword, onSubmit, error }: any) {
  const isSuperAdminCode = accessCode === '92481526';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8 md:mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 md:w-24 md:h-24 bg-slate-800/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border-2 border-emerald-600/85 overflow-hidden"
        >
          <img src={DEFAULT_LOGO} alt="Military Logo" className="w-full h-full object-contain p-2" />
        </motion.div>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg">
          Military Patrol Tracking System
        </h2>
        <p className="text-slate-200 text-sm md:text-lg mb-1 drop-shadow-md">
          Real-time location tracking and coordination for military operations
        </p>
        <p className="text-emerald-400 text-xs md:text-sm font-medium drop-shadow-md">
          Developed by Major Wahid
        </p>
      </div>

      <Card className="bg-slate-900/15 border-slate-700/85 backdrop-blur-md shadow-2xl mb-6 md:mb-8">
        <CardHeader>
          <CardTitle className="text-white text-lg md:text-xl drop-shadow-md">Access System</CardTitle>
          <CardDescription className="text-slate-200 text-sm drop-shadow-sm">
            Enter your access code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="bg-slate-900/15 border-slate-600/85 text-white placeholder:text-slate-300 text-center text-xl md:text-2xl tracking-widest h-14 md:h-16 backdrop-blur-sm"
                maxLength={8}
                autoFocus
              />
            </div>
            {isSuperAdminCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <Input
                  type="password"
                  placeholder="Enter Super Admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-slate-900/15 border-slate-600/85 text-white placeholder:text-slate-300 backdrop-blur-sm"
                />
                <p className="text-xs text-slate-200 mt-1 drop-shadow-sm">Default password: admin123</p>
              </motion.div>
            )}
            {error && (
              <Alert className="bg-red-950/85 border-red-900/85">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200 text-sm drop-shadow-sm">{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full h-12 md:h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-base md:text-lg"
            >
              Access Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-slate-900/15 border-slate-700/85 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <CardTitle className="text-white text-sm md:text-base drop-shadow-md">Real-Time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 text-xs md:text-sm drop-shadow-sm">
              Live GPS synchronization every 3 seconds with comprehensive trail history
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/15 border-slate-700/85 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
            </div>
            <CardTitle className="text-white text-sm md:text-base drop-shadow-md">SOS Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 text-xs md:text-sm drop-shadow-sm">
              Instant emergency notifications with automatic routing to nearest responders
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/15 border-slate-700/85 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
            </div>
            <CardTitle className="text-white text-sm md:text-base drop-shadow-md">Offline Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 text-xs md:text-sm drop-shadow-sm">
              GPS buffering when network drops with automatic sync when reconnected
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Patrol Registration Component
function PatrolRegistration({ onRegister, onCancel }: { onRegister: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    camp: '',
    unit: '',
    name: '',
    strength: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/patrol/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          strength: parseInt(formData.strength)
        })
      });
      if (response.ok) {
        const data = await response.json();
        onRegister(data.patrol);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full">
      <Card className="bg-slate-900/15 border-slate-700/85 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white text-xl md:text-2xl drop-shadow-md">Patrol Commander Registration</CardTitle>
          <CardDescription className="text-slate-200 text-sm drop-shadow-sm">
            Register your patrol details to begin tracking • Developed by Major Wahid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 drop-shadow-sm">Camp Name</label>
              <Input
                type="text"
                value={formData.camp}
                onChange={(e) => setFormData({ ...formData, camp: e.target.value })}
                className="bg-slate-900/15 border-slate-600/85 text-white backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 drop-shadow-sm">Unit</label>
              <Input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="bg-slate-900/15 border-slate-600/85 text-white backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 drop-shadow-sm">Name / Callsign</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900/15 border-slate-600/85 text-white backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 drop-shadow-sm">Strength</label>
              <Input
                type="number"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="bg-slate-900/15 border-slate-600/85 text-white backdrop-blur-sm"
                min="1"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-slate-700/85 bg-slate-900/15 text-slate-200 hover:bg-slate-800/50 backdrop-blur-sm drop-shadow-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-600/95 to-emerald-700/95 hover:from-emerald-700/95 hover:to-emerald-800/95 text-white drop-shadow-md"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Mobile-Optimized Patrol Dashboard Component
function PatrolDashboard({ 
  patrolData, 
  currentTime, 
  isPatrolling, 
  isOnline, 
  currentLocation, 
  locationHistory, 
  bufferedLocations,
  incomingCall,
  activeCall,
  isVideoEnabled,
  isAudioEnabled,
  onTogglePatrol, 
  onSos, 
  onCallResponse,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  onInitiateCall,
  hq
}: any) {
  const [showMap, setShowMap] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Auto-hide Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/85 backdrop-blur-sm border-b border-slate-700/85 px-4 py-2 flex-shrink-0 z-50 absolute top-0 left-0 right-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hq?.logoUrl ? (
                  <img
                    src={hq.logoUrl}
                    alt={hq.displayName || hq.name}
                    className="w-8 h-8 object-contain bg-transparent rounded-lg border border-slate-600/85 drop-shadow-lg"
                  />
                ) : (
                  <img
                    src={DEFAULT_LOGO}
                    alt="Military Logo"
                    className="w-8 h-8 object-contain bg-transparent rounded-lg border border-slate-600/85 drop-shadow-lg"
                  />
                )}
                <div>
                  <div className="text-sm font-bold text-white drop-shadow-md">{patrolData.name}</div>
                  <div className="text-xs text-slate-200 drop-shadow-sm">
                    {patrolData.unit} • {patrolData.camp}
                    {hq && ` • ${hq.displayName || hq.name}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg md:text-2xl font-mono font-bold text-emerald-500">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-14 relative">
        {/* Auto-hide Quick Stats */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-3 gap-2 p-2 md:p-4 flex-shrink-0 z-40"
            >
              <div className="bg-slate-900/15 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-slate-700/85">
                <div className="text-[10px] md:text-xs text-slate-200 drop-shadow-sm">Unit</div>
                <div className="text-sm md:text-xl font-bold text-emerald-400 drop-shadow-md">{patrolData.unit}</div>
              </div>
              <div className="bg-slate-900/15 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-slate-700/85">
                <div className="text-[10px] md:text-xs text-slate-200 drop-shadow-sm">Camp</div>
                <div className="text-sm md:text-xl font-bold text-blue-400 drop-shadow-md">{patrolData.camp}</div>
              </div>
              <div className="bg-slate-900/15 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-slate-700/85">
                <div className="text-[10px] md:text-xs text-slate-200 drop-shadow-sm">Strength</div>
                <div className="text-sm md:text-xl font-bold text-amber-400 drop-shadow-md">{patrolData.strength}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Area */}
        <div className="flex-1 relative min-h-0">
          <PatrolMap
            currentLocation={currentLocation}
            locationHistory={locationHistory}
            showTrail={isPatrolling}
            className="h-full"
          />

          {/* Floating Action Buttons */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 right-4 flex flex-col gap-2 z-10"
              >
                <button
                  onClick={() => setShowStatus(!showStatus)}
                  className="w-12 h-12 md:w-14 md:h-14 bg-slate-900/15 backdrop-blur-sm border border-slate-600/85 rounded-full flex items-center justify-center shadow-lg drop-shadow-md"
                >
                  <Clock className="w-6 h-6 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Auto-hide Bottom Action Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/85 backdrop-blur-sm border-t border-slate-700/85 p-3 md:p-4 flex-shrink-0 z-50 absolute bottom-0 left-0 right-0"
            >
              <div className="flex gap-2 md:gap-4">
                <Button
                  onClick={onTogglePatrol}
                  className={`flex-1 h-12 md:h-14 font-semibold text-sm md:text-base drop-shadow-md ${
                    isPatrolling 
                      ? 'bg-red-600/95 hover:bg-red-700/95' 
                      : 'bg-gradient-to-r from-emerald-600/95 to-emerald-700/95 hover:from-emerald-700/95 hover:to-emerald-800/95'
                  } text-white`}
                >
                  {isPatrolling ? 'Stop' : 'Start'} Patrol
                </Button>
                <Button
                  onClick={() => onInitiateCall?.('hq', 'audio')}
                  disabled={!isOnline}
                  variant="outline"
                  className="h-12 md:h-14 w-12 md:w-14 bg-slate-700/85 hover:bg-slate-600/85 border-slate-600/85 disabled:opacity-50 p-0 flex-shrink-0 drop-shadow-md"
                  title="Audio Call to HQ"
                >
                  <Phone className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
                <Button
                  onClick={() => onInitiateCall?.('hq', 'video')}
                  disabled={!isOnline}
                  variant="outline"
                  className="h-12 md:h-14 w-12 md:w-14 bg-slate-700/85 hover:bg-slate-600/85 border-slate-600/85 disabled:opacity-50 p-0 flex-shrink-0 drop-shadow-md"
                  title="Video Call to HQ"
                >
                  <Video className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
                <Button
                  onClick={onSos}
                  disabled={!currentLocation}
                  variant="destructive"
                  className="h-12 md:h-14 w-12 md:w-14 bg-red-600/95 hover:bg-red-700/95 disabled:opacity-50 p-0 flex-shrink-0 drop-shadow-md"
                >
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-20 left-2 right-2 md:left-auto md:right-4 md:w-80 z-20"
          >
            <Card className="bg-slate-900/85 backdrop-blur-sm border-slate-700/85">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300">Patrol Status</div>
                      <div className="text-lg font-semibold text-white">
                        {isPatrolling ? 'Active' : 'Idle'}
                      </div>
                    </div>
                    <Badge className={isPatrolling ? 'bg-emerald-600' : 'bg-slate-600'}>
                      {isPatrolling ? 'Patrolling' : 'Stopped'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300">Connection</div>
                      <div className="text-lg font-semibold text-white">
                        {isOnline ? 'Connected' : 'Offline'}
                      </div>
                    </div>
                    {isOnline ? (
                      <Wifi className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300">Location Points</div>
                      <div className="text-lg font-semibold text-white">
                        {locationHistory.length}
                      </div>
                    </div>
                    {bufferedLocations.length > 0 && (
                      <Badge className="bg-amber-600/85">
                        {bufferedLocations.length} buffered
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Overlay */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col"
          >
            {/* Video Area */}
            <div className="flex-1 relative bg-black">
              {activeCall.callType === 'video' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center">
                      <Shield className="w-16 h-16 text-slate-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-24 h-32 md:w-32 md:h-40 bg-slate-800 rounded-lg border-2 border-emerald-600 overflow-hidden">
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-white font-bold">You</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Call Info */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="text-white font-semibold">{activeCall.from}</div>
                  <div className="text-emerald-400 text-sm">Connected</div>
                </div>
                <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="text-white font-mono text-lg">
                    {Math.floor((Date.now() - new Date(activeCall.startTime).getTime()) / 60000)}:
                    {String(Math.floor(((Date.now() - new Date(activeCall.startTime).getTime()) % 60000) / 1000)).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="bg-slate-900 border-t border-slate-800 px-4 py-6">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={onToggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600'
                  }`}
                >
                  {isVideoEnabled ? (
                    <Video className="w-6 h-6 text-white" />
                  ) : (
                    <VideoOff className="w-6 h-6 text-white" />
                  )}
                </button>
                <button
                  onClick={onToggleAudio}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600'
                  }`}
                >
                  {isAudioEnabled ? (
                    <Mic className="w-6 h-6 text-white" />
                  ) : (
                    <MicOff className="w-6 h-6 text-white" />
                  )}
                </button>
                <button
                  onClick={onEndCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
                >
                  <Phone className="w-7 h-7 text-white rotate-135" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced HQ Dashboard with Maximized Map
function HQDashboard({ 
  currentTime, 
  patrols, 
  sosAlerts, 
  showSosPanel, 
  showPatrolList,
  mapMaximized,
  onToggleSosPanel, 
  onTogglePatrolList,
  onToggleMapMaximize,
  onRefresh,
  hq
}: any) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrails, setShowTrails] = useState(true);
  const [showCamps, setShowCamps] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const filteredPatrols = patrols.filter((p: any) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.camp && p.camp.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const activeSosAlerts = sosAlerts.filter((s: any) => s.status === 'active' || s.status === 'responding');
  const patrollingCount = patrols.filter((p: any) => p.status === 'patrolling').length;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-slate-950">
      {/* Auto-hide Header - Shows on mouse move */}
      <AnimatePresence>
        {showControls && !mapMaximized && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/85 backdrop-blur-md border-b border-slate-700/85 px-4 py-2 flex-shrink-0 z-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hq?.logoUrl ? (
                  <img
                    src={hq.logoUrl}
                    alt={hq.displayName || hq.name}
                    className="w-8 h-8 md:w-10 md:h-10 object-contain bg-transparent rounded-lg border border-slate-600/85 drop-shadow-lg"
                  />
                ) : (
                  <img
                    src={DEFAULT_LOGO}
                    alt="Military Logo"
                    className="w-8 h-8 md:w-10 md:h-10 object-contain bg-transparent rounded-lg border border-slate-600/85 drop-shadow-lg"
                  />
                )}
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white drop-shadow-md">
                    {hq?.displayName || hq?.name || 'HQ Control Dashboard'}
                  </h2>
                  <p className="text-[10px] md:text-xs text-slate-200 drop-shadow-sm">
                    Real-time patrol monitoring • {hq?.name || 'Developed by Major Wahid'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-mono font-bold text-emerald-400 drop-shadow-md">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-slate-300 drop-shadow-sm">{currentTime.toLocaleDateString()}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-hide Stats Bar - Compact overlay */}
      <AnimatePresence>
        {showControls && !mapMaximized && showStats && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute top-0 left-0 right-0 z-40 flex justify-center pt-2"
          >
            <div className="flex gap-2 px-3 py-2 bg-slate-900/85 backdrop-blur-md rounded-lg border border-slate-700/85 shadow-xl">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/50 rounded border border-emerald-900/50">
                <span className="text-[10px] text-emerald-300 font-medium drop-shadow-sm">PATROLLING</span>
                <span className="text-lg font-bold text-emerald-400 drop-shadow-md">{patrollingCount}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-950/50 rounded border border-blue-900/50">
                <span className="text-[10px] text-blue-300 font-medium drop-shadow-sm">TOTAL</span>
                <span className="text-lg font-bold text-blue-400 drop-shadow-md">{patrols.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-red-950/50 rounded border border-red-900/50">
                <span className="text-[10px] text-red-300 font-medium drop-shadow-sm">SOS</span>
                <span className="text-lg font-bold text-red-400 drop-shadow-md">{activeSosAlerts.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/50 rounded border border-amber-900/50">
                <span className="text-[10px] text-amber-300 font-medium drop-shadow-sm">CAMPS</span>
                <span className="text-lg font-bold text-amber-400 drop-shadow-md">{new Set(patrols.map((p: any) => p.camp)).size}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Map takes full screen */}
      <div className="flex-1 relative">
        {/* Map Container - Always maximized */}
        <div className="absolute inset-0 z-0">
          {/* Map */}
          <div className="w-full h-full">
            <HQMap
              patrols={patrols}
              sosAlerts={sosAlerts}
              camps={[]}
              showTrails={showTrails}
              showCamps={showCamps}
              showHeatmap={showHeatmap}
              className="h-full"
              onPatrolClick={(patrol) => console.log('Patrol clicked:', patrol)}
              onSosClick={(sos) => console.log('SOS clicked:', sos)}
            />
          </div>
        </div>

        {/* Auto-hide Map Controls - Bottom Left */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-4 z-50 flex flex-wrap gap-2 pointer-events-auto"
            >
              <div>
                <Button
                variant={showHeatmap ? 'default' : 'outline'}
                onClick={() => setShowHeatmap(!showHeatmap)}
                size="sm"
                className={`${showHeatmap ? 'bg-amber-600/95 hover:bg-amber-700/95' : 'bg-slate-900/15 backdrop-blur-md border-slate-600/85 text-slate-200 hover:bg-slate-800/50'} h-10 px-4 text-xs font-medium shadow-lg drop-shadow-md`}
              >
                🔥 Heatmap
              </Button>
              <Button
                variant={showTrails ? 'default' : 'outline'}
                onClick={() => setShowTrails(!showTrails)}
                size="sm"
                className={`${showTrails ? 'bg-emerald-600/95 hover:bg-emerald-700/95' : 'bg-slate-900/15 backdrop-blur-md border-slate-600/85 text-slate-200 hover:bg-slate-800/50'} h-10 px-4 text-xs font-medium shadow-lg drop-shadow-md`}
              >
                〰️ Trails
              </Button>
              <Button
                variant={showCamps ? 'default' : 'outline'}
                onClick={() => setShowCamps(!showCamps)}
                size="sm"
                className={`${showCamps ? 'bg-blue-600/95 hover:bg-blue-700/95' : 'bg-slate-900/15 backdrop-blur-md border-slate-600/85 text-slate-200 hover:bg-slate-800/50'} h-10 px-4 text-xs font-medium shadow-lg drop-shadow-md`}
              >
                🏕️ Camps
              </Button>
              <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="bg-slate-900/15 backdrop-blur-md border-slate-600/85 text-slate-200 hover:bg-slate-800/50 h-10 px-4 text-xs font-medium shadow-lg drop-shadow-md"
            >
              🔄 Refresh
            </Button>
                <Button
                  onClick={() => setShowPanel(!showPanel)}
                  variant="outline"
                  size="sm"
                  className={`${showPanel ? 'bg-purple-600/95 hover:bg-purple-700/95' : 'bg-slate-900/15 backdrop-blur-md border-slate-600/85 text-slate-200 hover:bg-slate-800/50'} h-10 px-4 text-xs font-medium shadow-lg drop-shadow-md`}
                >
                  {showPanel ? '📋 Hide Panel' : '📋 Show Panel'}
                </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-hide Overlay Side Panel */}
          <AnimatePresence>
            {showPanel && showControls && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-16 bottom-20 right-4 w-80 bg-slate-900/85 backdrop-blur-md border border-slate-700/85 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden pointer-events-auto"
              >
                {/* Panel Header */}
                <div className="border-b border-slate-700/85 p-3 bg-slate-800/50">
                  <h3 className="text-sm font-bold text-white mb-2 drop-shadow-md">Patrol Control Panel</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={showPatrolList ? 'default' : 'outline'}
                      onClick={onTogglePatrolList}
                      size="sm"
                      className={`flex-1 ${!showPatrolList ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 border-slate-700 text-slate-300'} h-8 text-xs`}
                    >
                      <Users className="w-3 h-3 mr-1" />
                  Patrols ({filteredPatrols.length})
                </Button>
                <Button
                  variant={showSosPanel ? 'default' : 'outline'}
                  onClick={onToggleSosPanel}
                  size="sm"
                  className={`flex-1 ${showSosPanel ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 border-slate-700 text-slate-300'} h-9 text-xs`}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                SOS ({activeSosAlerts.length})
                </Button>
              </div>

              {/* Filters */}
              <div className="p-2 border-b border-slate-800 space-y-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="all">All Status</option>
                  <option value="patrolling">Patrolling</option>
                  <option value="idle">Idle</option>
                  <option value="sos">SOS</option>
                </select>
                <Input
                  placeholder="Search patrols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-xs h-8"
                />
              </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-2">
                {showSosPanel ? (
                  <div className="space-y-2">
                    {activeSosAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No active SOS alerts</p>
                      </div>
                    ) : (
                      activeSosAlerts.map((alert: any) => (
                        <div key={alert.id} className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-white text-sm">{alert.patrolName}</div>
                              <div className="text-xs text-slate-400">{alert.campName}</div>
                            </div>
                            <Badge className="bg-red-600 text-[10px]">
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-red-400 mb-2">{alert.message}</p>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1 border-slate-700 h-7 text-[10px]">
                              <Navigation className="w-3 h-3 mr-1" />
                              Route
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-slate-700 h-7 text-[10px]">
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-slate-700 h-7 text-[10px]">
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPatrols.map((patrol: any) => (
                      <div key={patrol.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white text-sm">{patrol.name}</div>
                            <div className="text-xs text-slate-400">{patrol.unit} • {patrol.camp}</div>
                          </div>
                          <Badge 
                            className={
                              patrol.status === 'patrolling' ? 'bg-emerald-600' :
                              patrol.status === 'sos' ? 'bg-red-600' :
                              patrol.status === 'offline' ? 'bg-slate-600' :
                              'bg-blue-600'
                            }
                            style={{ fontSize: '10px' }}
                          >
                            {patrol.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Strength: {patrol.strength}</span>
                          {patrol.currentLatitude && (
                            <span className="font-mono">
                              {patrol.currentLatitude.toFixed(4)}, {patrol.currentLongitude.toFixed(4)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => console.log('Audio call to', patrol.name)}
                            className="flex-1 border-slate-600 h-8 text-[10px] bg-slate-700/50 hover:bg-slate-700"
                            title="Audio Call"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Audio
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => console.log('Video call to', patrol.name)}
                            className="flex-1 border-slate-600 h-8 text-[10px] bg-slate-700/50 hover:bg-slate-700"
                            title="Video Call"
                          >
                            <Video className="w-3 h-3 mr-1" />
                            Video
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
  );
}
