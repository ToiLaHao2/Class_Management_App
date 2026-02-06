const { getEnv } = require('../env.loader');

const cacheConfig = {
    redis: {
        host: getEnv('REDIS_HOST'),
        port: getEnv('REDIS_PORT'),
        password: getEnv('REDIS_PASSWORD'),
        tls: getEnv('REDIS_TLS') === 'true',
    },
};

module.exports = cacheConfig;
