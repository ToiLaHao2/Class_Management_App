// core dung cho cache, hien tai se dung redis nhung neu khong co redis thi se tam fallback
// sang luu tren ram

const Redis = require('ioredis');
const LRUCache = require('lru-cache');
const { cacheConfig } = require('../../config');

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
        this._promptShown = false;  // chong goi _promptFallback nhieu lan

        this.initRedis();
    }

    initRedis() {
        const redisHost = cacheConfig.redis.host;
        const redisPort = cacheConfig.redis.port;
        const redisPassword = cacheConfig.redis.password;

        if (!redisHost) {
            console.log('⚠️  No REDIS_HOST in env, using In-Memory Cache only.');
            return;
        }

        console.log('🔄 Connecting to Redis...');

        const MAX_RETRIES = 3;
        let errorLogged = false;

        const redisOptions = {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            lazyConnect: true,
            showFriendlyErrorStack: false,
            // Chi retry toi da MAX_RETRIES lan, sau do tra ve null de dung retry
            retryStrategy: (times) => {
                if (times > MAX_RETRIES) return null; // dung retry
                return Math.min(times * 500, 2000);
            },
        };

        if (cacheConfig.redis.tls || redisHost.includes('upstash')) {
            console.log('🔒 Redis TLS Enabled (Upstash Detected/Forced)');
            redisOptions.tls = {};
        }

        this.redisClient = new Redis(redisOptions);

        this.redisClient.connect().catch(() => {
            // Loi duoc xu ly trong event 'error' + 'close' ben duoi
        });

        this.redisClient.on('error', (err) => {
            this.useRedis = false;
            // Chi log 1 lan duy nhat, khong spam
            if (!errorLogged) {
                errorLogged = true;
                console.error(`\n❌ [Cache] Redis connection failed: ${err.message}`);
            }
        });

        this.redisClient.on('ready', () => {
            console.log('✅ Redis Connected Successfully!');
            this.useRedis = true;
            errorLogged = false;
        });

        // Event 'close' fired khi ioredis da tu bo retry (retryStrategy tra null)
        this.redisClient.on('close', () => {
            if (!this.useRedis && !this._promptShown) {
                this._promptShown = true;
                this._promptFallback();
            }
        });
    }

    /**
     * Hien thi lua chon fallback sau khi Redis that bai hoan toan.
     * User nhap 1 = tiep tuc voi In-Memory, 2 = thoat.
     */
    _promptFallback() {
        process.stdout.write(
            '\n⚠️  Redis is unavailable after multiple retries.\n' +
            '   [1] Continue with In-Memory cache (data lost on restart)\n' +
            '   [2] Exit and fix Redis config\n' +
            'Your choice (1/2): '
        );

        // Neu stdin khong tuong tac (pipe, CI) thi tu dong chon 1
        if (!process.stdin.isTTY) {
            console.log('\n[Auto] Non-interactive mode: using In-Memory cache.');
            this.useRedis = false;
            return;
        }

        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', (input) => {
            process.stdin.pause();
            const choice = input.trim();
            if (choice === '2') {
                console.log('\n👋 Exiting. Please fix your Redis configuration.');
                process.exit(0);
            } else {
                console.log('\n✅ Using In-Memory cache. All data will be lost on restart.\n');
                this.useRedis = false;
            }
        });
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

// Singleton export — chi export cacheManager, khong kem createRedisConnection
// De tranh viec import @core/cache vo tinh khoi tao singleton khi chi can factory
// Dung: const { createRedisConnection } = require('@core/cache/src/redis-connection')
const cacheManager = new CacheManager();
module.exports = cacheManager;
