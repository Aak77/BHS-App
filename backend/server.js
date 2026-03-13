const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Store active operators and their locations
// Map: socketId -> { uid, role, location: { lat, lng, heading, speed }, timestamp }
const activeOperators = new Map();

// Store active bookings/rooms
// Map: bookingId -> { operatorSocketId, trackingStartTime }
const activeBookings = new Map();

io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);

  // 1. Operator connects and goes "Online"
  socket.on('operator:online', (data) => {
    const { uid, name } = data;
    activeOperators.set(socket.id, {
      uid,
      name,
      role: 'Operator',
      location: null,
      timestamp: Date.now(),
    });
    console.log(`🚜 Operator Online [${uid}]: Socket ${socket.id}`);
  });

  // 2. Operator sends real-time location update
  socket.on('operator:location_update', (data) => {
    const operator = activeOperators.get(socket.id);
    if (!operator) return; // Ignore if not registered as online

    const { latitude, longitude, heading, speed } = data;
    operator.location = { latitude, longitude, heading, speed };
    operator.timestamp = Date.now();
    activeOperators.set(socket.id, operator);

    // If this operator is currently assigned to a tracked booking, broadcast their location to the room
    // Find all rooms this socket is in (excluding its own socket.id room)
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
    
    rooms.forEach((room) => {
      if (room.startsWith('booking_')) {
        io.to(room).emit('location_broadcast', {
          operatorId: operator.uid,
          latitude,
          longitude,
          heading,
          speed,
          timestamp: operator.timestamp,
        });
        console.log(`📡 Broadcasted location to room ${room}:`, { latitude, longitude });
      }
    });
  });

  // 3. Farmer (or anyone) requests to track a specific booking
  // The farmer joins a "room" dedicated to this booking ID
  socket.on('farmer:track_job', (data) => {
    const { bookingId } = data;
    const roomName = `booking_${bookingId}`;
    
    socket.join(roomName);
    console.log(`👨‍🌾 Farmer (Socket ${socket.id}) joined tracking room: ${roomName}`);
  });

  // 4. Operator joins a booking room upon accepting a job
  socket.on('operator:start_job', (data) => {
    const { bookingId } = data;
    const roomName = `booking_${bookingId}`;
    
    // Join the room so their updates can be targeted
    socket.join(roomName);
    activeBookings.set(bookingId, {
      operatorSocketId: socket.id,
      trackingStartTime: Date.now(),
    });
    console.log(`🚀 Operator (Socket ${socket.id}) started broadcasting to room: ${roomName}`);
  });

  // 5. Operator stops repeating a job
  socket.on('operator:complete_job', (data) => {
    const { bookingId } = data;
    const roomName = `booking_${bookingId}`;
    
    // Broadcast completion state to the room
    io.to(roomName).emit('job_completed', { bookingId });
    
    socket.leave(roomName);
    activeBookings.delete(bookingId);
    console.log(`✅ Operator completed job tracking for room: ${roomName}`);
  });

  // 6. Operator changes job status (e.g. headed_to_farm, reached_farm)
  socket.on('operator:status_update', (data) => {
    const { bookingId, status } = data;
    const roomName = `booking_${bookingId}`;

    io.to(roomName).emit('job_status_update', {
      bookingId,
      status,
      timestamp: Date.now()
    });
    console.log(`🔄 Status Update [${roomName}]: ${status}`);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    
    // If it was an operator, clean up
    if (activeOperators.has(socket.id)) {
      const operator = activeOperators.get(socket.id);
      console.log(`🚜 Operator Offline: ${operator.uid}`);
      activeOperators.delete(socket.id);
      
      // Notify any rooms they were in that they went offline
      const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id && room.startsWith('booking_'));
      rooms.forEach((room) => {
        io.to(room).emit('operator_offline', { operatorId: operator.uid });
      });
    }
  });
});

app.get('/', (req, res) => {
  res.send('Bharat Seeder Real-time Location Server API is running');
});

// Healthcheck endpoint for operators
app.get('/active-operators', (req, res) => {
  const operators = Array.from(activeOperators.values()).map(op => ({
    uid: op.uid,
    name: op.name,
    lastUpdate: Date.now() - op.timestamp + 'ms ago'
  }));
  res.json({ count: operators.length, operators });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`🚀 Location Tracking Server running on port ${PORT}`);
  console.log(`==========================================\n`);
});
