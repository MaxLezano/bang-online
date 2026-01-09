
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
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

interface Room {
    id: string;
    hostId: string;
    players: { id: string, name: string, isBot?: boolean }[];
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
            players: [{ id: socket.id, name: playerName, isBot: false }]
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

        room.players.push({ id: socket.id, name: playerName, isBot: false });
        socket.join(roomId);

        // Notify others
        io.to(roomId).emit('player_joined', room.players);

        console.log(`${playerName} joined room ${roomId}`);
        callback({ success: true, players: room.players });
    });

    socket.on('add_bot', ({ roomId }, callback) => {
        const room = rooms[roomId];
        if (!room) return;
        if (room.hostId !== socket.id) return; // Only host
        if (room.players.length >= 7) return;

        const botId = `bot-${Date.now()}`;
        room.players.push({ id: botId, name: 'Bot', isBot: true });

        // Notify all
        io.to(roomId).emit('player_joined', room.players);
        callback({ success: true });
    });

    socket.on('remove_bot', ({ roomId, botIndex }, callback) => {
        const room = rooms[roomId];
        if (!room) return;
        if (room.hostId !== socket.id) return;

        // Validation: botIndex must be within bounds and IS A BOT
        if (botIndex >= 0 && botIndex < room.players.length) {
            const target = room.players[botIndex];
            if (target.isBot) {
                room.players.splice(botIndex, 1);
                // Notify all (using player_joined or player_left, both work as they send full list usually, 
                // but let's consistency emit 'player_left' or just 'player_joined' with new list.
                // In frontend we map the list directly so 'player_joined' is fine as "Update List"
                io.to(roomId).emit('player_joined', room.players);
                callback({ success: true });
            }
        }
    });

    socket.on('game_action', ({ roomId, action }) => {
        socket.to(roomId).emit('game_action', action);
    });

    socket.on('sync_game_state', ({ roomId, state }) => {
        const room = rooms[roomId];
        if (room) {
            room.gameState = state; // Cache state on server
        }
        socket.to(roomId).emit('game_state_update', state);
    });

    socket.on('request_sync', ({ roomId }) => {
        console.log(`[SERVER] Received request_sync for room ${roomId} from ${socket.id}`);
        const room = rooms[roomId];
        if (room) {
            if (room.gameState) {
                console.log(`[SERVER] Sending cached state to ${socket.id}`);
                // If server has state, send it immediately
                socket.emit('game_state_update', room.gameState);
            } else {
                console.log(`[SERVER] No cached state. Requesting from HOST ${room.hostId}`);
                // If not, ask the host to send it
                if (room.hostId) {
                    io.to(room.hostId).emit('request_host_sync');
                } else {
                    console.error(`[SERVER] Room ${roomId} has no hostId!`);
                }
            }
        } else {
            console.error(`[SERVER] request_sync failed: Room ${roomId} not found`);
            socket.emit('error', { message: 'Room not found during sync' });
        }
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
