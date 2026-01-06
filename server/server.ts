
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for local dev
        methods: ["GET", "POST"]
    }
});

interface Room {
    id: string;
    hostId: string;
    players: { id: string, name: string }[];
    gameState?: any;
}

const rooms: Record<string, Room> = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (playerName: string, callback) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[roomId] = {
            id: roomId,
            hostId: socket.id,
            players: [{ id: socket.id, name: playerName }]
        };
        socket.join(roomId);
        console.log(`Room created: ${roomId} by ${playerName}`);
        callback({ roomId });
    });

    socket.on('join_room', ({ roomId, playerName }, callback) => {
        const room = rooms[roomId];
        if (!room) {
            return callback({ error: 'Room not found' });
        }
        if (room.players.length >= 7) {
            return callback({ error: 'Room is full' });
        }

        room.players.push({ id: socket.id, name: playerName });
        socket.join(roomId);

        // Notify others
        io.to(roomId).emit('player_joined', room.players);

        console.log(`${playerName} joined room ${roomId}`);
        callback({ success: true, players: room.players });
    });

    socket.on('game_action', ({ roomId, action }) => {
        // Relay action to Host (who is room.hostId)
        // Actually, just broadcast to everyone in room, 
        // Logic: if Host receives it, they process it.
        // If Client receives it, they might ignore it if they are not Host.
        // BUT better: Send to specific Host? 
        // Simpler: Broadcast to room. "Host" logic filters.
        socket.to(roomId).emit('game_action', action);
    });

    socket.on('sync_game_state', ({ roomId, state }) => {
        // Host sends this. Broadcast to everyone else.
        socket.to(roomId).emit('game_state_update', state);
    });

    socket.on('start_game_request', ({ roomId, settings }) => {
        const room = rooms[roomId];
        if (!room) return;
        if (socket.id === room.hostId) {
            io.to(roomId).emit('game_started', settings);
        }
    });

    socket.on('disconnect', () => {
        // Find rooms this socket was key in
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIdx = room.players.findIndex(p => p.id === socket.id);
            if (playerIdx !== -1) {
                room.players.splice(playerIdx, 1);
                io.to(roomId).emit('player_left', room.players); // Send updated list

                // If Host left, destroy room (Host-Authoritative)
                if (socket.id === room.hostId) {
                    io.to(roomId).emit('room_closed', 'Host disconnected');
                    delete rooms[roomId];
                } else if (room.players.length === 0) {
                    delete rooms[roomId]; // Cleanup empty room
                }
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});
