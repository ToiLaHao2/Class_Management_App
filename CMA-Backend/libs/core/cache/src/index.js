// core dung cho cache, hien tai se dung redis nhung neu khong co redis thi se tam fallback
// sang luu tren ram

const Redis = require('ioredis');
const LRUCache = require('lru-cache');
const cacheConfig = require('../../config/src/configs/cache.config');

class CacheManager {
    constructor() {
        this.memoryCache = new LRUCache({
            max: 500,
            maxAge: 1000 * 60 * 60,
            stale: false,
            updateAgeOnGet: false,
            updateAgeOnHas: false,
        });

        this.redisClient = null;
        this.useRedis = false;

        this.initRedis();
    }

    initRedis() {
        const redisHost = cacheConfig.redis.host;
        const redisPort = cacheConfig.redis.port;
        const redisPassword = cacheConfig.redis.password;

        if (redisHost) {
            console.log('🔄 Connecting to Redis...');

            const redisOptions = {
                host: redisHost,
                port: redisPort,
                password: redisPassword,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                showFriendlyErrorStack: true,
                lazyConnect: true
            };

            if (cacheConfig.redis.tls || redisHost.includes('upstash')) {
                console.log('🔒 Redis TLS Enabled (Upstash Detected/Forced)');
                redisOptions.tls = {};
            }

            this.redisClient = new Redis(redisOptions);

            this.redisClient.connect().then(() => {
                console.log('✅ Redis Connected Successfully!');
                this.useRedis = true;
            }).catch((err) => {
                console.error('⚠️ Redis Connection Failed, falling back to Memory:', err.message);
                this.useRedis = false;
            });

            this.redisClient.on('error', (err) => {
                console.error('🔥 Redis Error:', err.message);
                this.useRedis = false;
            });

            this.redisClient.on('ready', () => {
                this.useRedis = true;
            });

        } else {
            console.log('⚠️ No REDIS_HOST in env, using In-Memory Cache only.');
        }
    }

    connect() {
        return {
            redis: this.useRedis ? this.redisClient : null,
            memory: this.memoryCache,
            isReady: true // Always ready due to memory fallback
        };
    }

    getRedisClient() {
        if (!this.useRedis || !this.redisClient) {
            console.warn("⚠️ Warning: Requesting Redis Client but Redis is disabled/not ready.");
        }
        return this.redisClient;
    }

    //  Lay du lieu cache
    //  @param {string} key 

    async get(key) {
        try {
            if (this.useRedis && this.redisClient.status === 'ready') {
                const data = await this.redisClient.get(key);
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.warn(`⚠️ Cache GET failed for key "${key}" (Redis), trying Memory. Error:`, error.message);
        }

        // Fallback or Memory Mode
        return this.memoryCache.get(key) || null;
    }

    //  Luu du lieu cache
    //  @param {string} key 
    //  @param {any} value 
    //  @param {number} ttlSeconds Thoi gian song (giay), mac dinh 3600s (1h)

    async set(key, value, ttlSeconds = 3600) {
        const dataStr = JSON.stringify(value);

        try {
            if (this.useRedis && this.redisClient.status === 'ready') {
                await this.redisClient.set(key, dataStr, 'EX', ttlSeconds);
                return;
            }
        } catch (error) {
            console.warn(`⚠️ Cache SET failed for key "${key}" (Redis), using Memory. Error:`, error.message);
        }

        // Fallback: Luu vao Memory
        this.memoryCache.set(key, value, ttlSeconds * 1000);
    }

    //  Xoa cache
    //  @param {string} key 

    async del(key) {
        try {
            if (this.useRedis && this.redisClient.status === 'ready') {
                await this.redisClient.del(key);
            }
        } catch (error) {
            console.warn(`⚠️ Cache DEL failed for key "${key}" (Redis).`);
        }
        this.memoryCache.delete(key);
    }

    //  Xoa toan bo cache

    async flush() {
        try {
            if (this.useRedis && this.redisClient.status === 'ready') {
                await this.redisClient.flushdb();
            }
        } catch (error) {
            console.warn(`⚠️ Cache FLUSH failed (Redis).`);
        }
        this.memoryCache.reset();
    }
}

// Singleton export
const cacheManager = new CacheManager();
module.exports = cacheManager;
