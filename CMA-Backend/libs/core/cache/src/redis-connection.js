/**
 * redis-connection.js
 *
 * Factory tao ioredis client voi config da chuan hoa:
 * - Retry toi da 3 lan roi dung
 * - Tu dong bat TLS neu host la Upstash
 * - Log loi chi 1 lan duy nhat (khong spam)
 *
 * File nay KHONG khoi tao bat ky singleton nao.
 * Import file nay se KHONG ket noi Redis ngay lap tuc.
 */

const Redis = require('ioredis');
const cacheConfig = require('../../config/src/configs/cache.config');

/**
 * @param {Object} extraOptions - Tuy chon bo sung cho ioredis
 *                                Vi du BullMQ can: { maxRetriesPerRequest: null }
 * @param {string} label        - Ten hien thi trong log: '[Worker]', '[Socket]'...
 * @returns {import('ioredis').Redis | null}
 */
function createRedisConnection(extraOptions = {}, label = '[Redis]') {
    const { host, port, password, tls } = cacheConfig.redis;

    if (!host) {
        console.warn(`⚠️  ${label} No REDIS_HOST configured, skipping Redis connection.`);
        return null;
    }

    const options = {
        host,
        port,
        password,
        lazyConnect: true,
        showFriendlyErrorStack: false,
        retryStrategy: (times) => {
            if (times > 3) return null; // dung retry sau 3 lan
            return Math.min(times * 500, 2000);
        },
        ...extraOptions,
    };

    if (tls || host.includes('upstash')) {
        options.tls = {};
    }

    const client = new Redis(options);

    let _errorLogged = false;
    client.on('error', (err) => {
        if (!_errorLogged) {
            _errorLogged = true;
            console.error(`\n❌ ${label} Redis connection failed: ${err.message}`);
            console.warn(`⚠️  ${label} Falling back to degraded mode (no Redis).\n`);
        }
    });
    client.on('ready', () => {
        _errorLogged = false;
        console.log(`✅ ${label} Redis connected.`);
    });

    return client;
}

module.exports = { createRedisConnection };
