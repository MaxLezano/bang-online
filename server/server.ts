
import { Server } from 'socket.io';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for dev/prod flexibility
        methods: ["GET", "POST"]
    }
});

// Serve frontend static files from the dist directory
// Parent directory because server.ts is in /server/ and dist is in /dist/
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA routing: return index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
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
        socket.to(roomId).emit('game_action', action);
    });

    socket.on('sync_game_state', ({ roomId, state }) => {
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
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIdx = room.players.findIndex(p => p.id === socket.id);
            if (playerIdx !== -1) {
                room.players.splice(playerIdx, 1);
                io.to(roomId).emit('player_left', room.players);

                if (socket.id === room.hostId) {
                    io.to(roomId).emit('room_closed', 'Host disconnected');
                    delete rooms[roomId];
                } else if (room.players.length === 0) {
                    delete rooms[roomId];
                }
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running - Frontend & Backend on port ${PORT}`);
});
