const path = require('path');
const { Worker } = require('bullmq');
const Redis = require('ioredis');

const cacheConfig = require('../../../libs/core/config/src/configs/cache.config');

const processors = require('./processors');

const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

const redisConfig = {
    host: cacheConfig.redis.host,
    port: cacheConfig.redis.port,
    password: cacheConfig.redis.password,
    maxRetriesPerRequest: null
};

if (cacheConfig.redis.tls || cacheConfig.redis.host.includes('upstash')) {
    redisConfig.tls = {};
}

const connection = new Redis(redisConfig);

console.log("---------------------------------------");
console.log("👷 WORKER SERVICE IS STARTING...");
console.log(`🔌 Redis Host: ${redisConfig.host}`);
console.log("---------------------------------------");

const worker = new Worker('system-queue', async (job) => {
    const handler = processors[job.name];

    if (!handler) {
        throw new Error(`❌ Không tìm thấy processor cho job: ${job.name}`);
    }

    return await handler(job);

}, {
    connection,
    concurrency: 5
});

worker.on('active', (job) => {
    console.log(`▶️  [Start] Job ${job.id} (${job.name}) bắt đầu chạy...`);
});

worker.on('completed', (job, returnvalue) => {
    console.log(`🎉 [Done] Job ${job.id} hoàn thành.`);
});

worker.on('failed', (job, err) => {
    console.error(`🔥 [Fail] Job ${job.id} bị lỗi: ${err.message}`);
});

console.log("🚀 Worker đã sẵn sàng nhận việc từ 'system-queue'!");