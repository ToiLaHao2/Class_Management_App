const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");
const appConfig = require("../../../libs/core/config/src/configs/app.config");
const cacheConfig = require("../../../libs/core/config/src/configs/cache.config");

const PORT = 3002; // Default for socket service

console.log("\n--- 🔌 SOCKET SERVICE STARTING ---");

// Redis config for Adapter
const redisOptions = {
    host: cacheConfig.redis.host,
    port: cacheConfig.redis.port,
    password: cacheConfig.redis.password,
    lazyConnect: true
};

if (cacheConfig.redis.tls || redisOptions.host.includes('upstash')) {
    redisOptions.tls = {};
}

const pubClient = new Redis(redisOptions);
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    console.log("✅ [Redis] Adapter connected successfully.");

    const io = new Server(PORT, {
        cors: {
            origin: "*", // Adjust as needed
            methods: ["GET", "POST"]
        },
        adapter: createAdapter(pubClient, subClient)
    });

    io.on("connection", (socket) => {
        console.log(`⚡ Client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    console.log(`🚀 Socket Server running on port ${PORT}`);

}).catch((err) => {
    console.error("❌ [Redis] Adapter connection failed:", err);
});
