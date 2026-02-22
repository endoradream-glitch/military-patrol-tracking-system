import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const portFromEnv = Number.parseInt(process.env.PORT || '', 10);
const PORT = Number.isFinite(portFromEnv) ? portFromEnv : 3003;
const HOST = process.env.HOST || '0.0.0.0';

// In-memory storage for active connections
const hqClients = new Set();
const patrolClients = new Map<string, any>(); // patrolId -> socket

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

console.log(`🚀 Tracking Service starting on port ${PORT}...`);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // HQ Dashboard connection
  socket.on('hq:connect', (data: { role: string }) => {
    if (data.role === 'hq') {
      hqClients.add(socket.id);
      socket.join('hq');
      console.log(`HQ Dashboard connected: ${socket.id}`);
    }
  });

  // Patrol Commander connection
  socket.on('patrol:connect', async (data: { patrolId: string }) => {
    patrolClients.set(data.patrolId, socket);
    socket.join(`patrol:${data.patrolId}`);
    socket.data.patrolId = data.patrolId;

    console.log(`Patrol connected: ${data.patrolId}`);

    // Notify all HQ clients that patrol is online
    io.to('hq').emit('patrol:online', { patrolId: data.patrolId });
  });

  // Patrol sends location update
  socket.on('patrol:location', (data: {
    patrolId: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    timestamp: string;
  }) => {
    // Broadcast to all HQ clients
    io.to('hq').emit('patrol:location:update', {
      patrolId: data.patrolId,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      accuracy: data.accuracy,
      timestamp: data.timestamp
    });

    console.log(`Location update from patrol ${data.patrolId}:`, {
      lat: data.latitude,
      lng: data.longitude
    });
  });

  // Patrol starts patrol
  socket.on('patrol:start', (data: { patrolId: string; sessionId: string }) => {
    // Notify HQ
    io.to('hq').emit('patrol:started', {
      patrolId: data.patrolId,
      sessionId: data.sessionId,
      startTime: new Date().toISOString()
    });

    console.log(`Patrol ${data.patrolId} started session ${data.sessionId}`);
  });

  // Patrol stops patrol
  socket.on('patrol:stop', (data: { patrolId: string; sessionId: string }) => {
    // Notify HQ
    io.to('hq').emit('patrol:stopped', {
      patrolId: data.patrolId,
      sessionId: data.sessionId,
      endTime: new Date().toISOString()
    });

    console.log(`Patrol ${data.patrolId} stopped session ${data.sessionId}`);
  });

  // Patrol triggers SOS
  socket.on('patrol:sos', (data: {
    patrolId: string;
    latitude: number;
    longitude: number;
    message?: string;
  }) => {
    const sosData = {
      id: `sos_${Date.now()}`,
      patrolId: data.patrolId,
      latitude: data.latitude,
      longitude: data.longitude,
      message: data.message,
      status: 'active',
      timestamp: new Date().toISOString()
    };

    // Alert all HQ clients
    io.to('hq').emit('sos:alert', sosData);

    // Alert nearest 3 patrols (simplified: all other patrols)
    patrolClients.forEach((clientSocket, patrolId) => {
      if (patrolId !== data.patrolId) {
        io.to(`patrol:${patrolId}`).emit('sos:nearby', sosData);
      }
    });

    console.log(`SOS ALERT from patrol ${data.patrolId}`);
  });

  // HQ requests patrol route to SOS
  socket.on('hq:request:sos:route', (data: {
    patrolId: string;
    sosId: string;
    sosLatitude: number;
    sosLongitude: number;
  }) => {
    io.to(`patrol:${data.patrolId}`).emit('patrol:sos:route', {
      sosId: data.sosId,
      latitude: data.sosLatitude,
      longitude: data.sosLongitude
    });
  });

  // HQ updates SOS status
  socket.on('hq:sos:update', (data: {
    sosId: string;
    status: string;
  }) => {
    // Broadcast to all
    io.emit('sos:status:updated', data);
  });

  // HQ requests patrol video/audio call
  socket.on('hq:call:patrol', (data: {
    patrolId: string;
    callType: 'video' | 'audio';
  }) => {
    io.to(`patrol:${data.patrolId}`).emit('patrol:incoming:call', {
      from: 'HQ',
      callType: data.callType,
      callId: `call_${Date.now()}`
    });
  });

  // WebRTC Signaling: Offer
  socket.on('webrtc:offer', (data: {
    callId: string;
    target: string; // 'hq' or patrolId
    offer: any;
    callType: 'video' | 'audio';
  }) => {
    if (data.target === 'hq') {
      io.to('hq').emit('webrtc:offer', {
        callId: data.callId,
        from: socket.data.patrolId || socket.id,
        offer: data.offer,
        callType: data.callType
      });
    } else {
      io.to(`patrol:${data.target}`).emit('webrtc:offer', {
        callId: data.callId,
        from: 'HQ',
        offer: data.offer,
        callType: data.callType
      });
    }
  });

  // WebRTC Signaling: Answer
  socket.on('webrtc:answer', (data: {
    callId: string;
    target: string;
    answer: any;
  }) => {
    if (data.target === 'hq') {
      io.to('hq').emit('webrtc:answer', {
        callId: data.callId,
        from: socket.data.patrolId || socket.id,
        answer: data.answer
      });
    } else {
      io.to(`patrol:${data.target}`).emit('webrtc:answer', {
        callId: data.callId,
        from: 'HQ',
        answer: data.answer
      });
    }
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('webrtc:ice-candidate', (data: {
    callId: string;
    target: string;
    candidate: any;
  }) => {
    if (data.target === 'hq') {
      io.to('hq').emit('webrtc:ice-candidate', {
        callId: data.callId,
        from: socket.data.patrolId || socket.id,
        candidate: data.candidate
      });
    } else {
      io.to(`patrol:${data.target}`).emit('webrtc:ice-candidate', {
        callId: data.callId,
        from: 'HQ',
        candidate: data.candidate
      });
    }
  });

  // Call ended
  socket.on('call:ended', (data: { callId: string; target: string; reason?: string }) => {
    if (data.target === 'hq') {
      io.to('hq').emit('call:ended', {
        callId: data.callId,
        from: socket.data.patrolId || socket.id,
        reason: data.reason || 'remote ended'
      });
    } else {
      io.to(`patrol:${data.target}`).emit('call:ended', {
        callId: data.callId,
        from: 'HQ',
        reason: data.reason || 'remote ended'
      });
    }
    console.log(`Call ${data.callId} ended: ${data.reason || 'remote ended'}`);
  });

  // Patrol accepts/rejects call
  socket.on('patrol:call:response', (data: {
    callId: string;
    accepted: boolean;
  }) => {
    io.to('hq').emit('hq:call:response', data);
  });

  // Patrol syncs buffered locations (when coming back online)
  socket.on('patrol:sync:buffered', (data: {
    patrolId: string;
    locations: Array<{
      latitude: number;
      longitude: number;
      altitude?: number;
      accuracy?: number;
      timestamp: string;
    }>;
  }) => {
    // Notify HQ to store these locations
    io.to('hq').emit('patrol:buffered:sync', {
      patrolId: data.patrolId,
      locations: data.locations
    });

    console.log(`Patrol ${data.patrolId} synced ${data.locations.length} buffered locations`);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    if (socket.data.patrolId) {
      patrolClients.delete(socket.data.patrolId);
      io.to('hq').emit('patrol:offline', { patrolId: socket.data.patrolId });
      console.log(`Patrol disconnected: ${socket.data.patrolId}`);
    }
    hqClients.delete(socket.id);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(PORT, HOST, () => {
  console.log(`✅ Tracking Service running on port ${PORT}`);
  console.log(`   Host binding: ${HOST}`);
  console.log(`   WebSocket endpoint: ws://${HOST}:${PORT}`);
  console.log(`   Health check: http://${HOST}:${PORT}/health`);
});

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'tracking-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connectedClients: {
        hq: hqClients.size,
        patrols: patrolClients.size
      }
    }));
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
