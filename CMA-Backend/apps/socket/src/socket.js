const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createRedisConnection } = require('@core/cache/src/redis-connection');

const PORT = 3002;

console.log('\n--- 🔌 SOCKET SERVICE STARTING ---');

function startSocketServer(adapter) {
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

// Dung factory tu @core/cache — retry/TLS/error handler da duoc xu ly san
const pubClient = createRedisConnection({}, '[Socket/pub]');
const subClient = pubClient ? pubClient.duplicate() : null;

if (!pubClient) {
    // Khong co Redis — chay in-memory mode luon
    startSocketServer(null);
} else {
    Promise.all([pubClient.connect(), subClient.connect()])
        .then(() => {
            console.log('✅ [Socket] Redis adapter connected.');
            startSocketServer(createAdapter(pubClient, subClient));
        })
        .catch(() => {
            // Loi da duoc log boi createRedisConnection
            console.warn('⚠️  [Socket] Starting without Redis adapter (single-node mode).');
            startSocketServer(null);
        });
}
