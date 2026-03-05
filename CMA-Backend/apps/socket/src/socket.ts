import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { container } from '@core/container';

const PORT = 3002;

console.log('\n--- 🔌 SOCKET SERVICE STARTING ---');

function startSocketServer(adapter: ReturnType<typeof createAdapter> | null): void {
    const io = new Server(PORT, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
        ...(adapter ? { adapter } : {})
    });

    io.on('connection', (socket) => {
        console.log(`⚡ Client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    const mode = adapter ? 'Redis adapter' : 'in-memory (single-node)';
    console.log(`🚀 Socket Server running on port ${PORT} — ${mode}`);
}

const cache = container.resolve('cache');
const baseConnection = cache.getRedisClient();

if (!baseConnection) {
    startSocketServer(null);
} else {
    // Socket.io Redis adapter needs dedicated connections
    const pubClient = baseConnection.duplicate();
    const subClient = baseConnection.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()])
        .then(() => {
            console.log('✅ [Socket] Redis adapter connected.');
            startSocketServer(createAdapter(pubClient, subClient!));
        })
        .catch(() => {
            console.warn('⚠️  [Socket] Starting without Redis adapter (single-node mode).');
            startSocketServer(null);
        });
}

