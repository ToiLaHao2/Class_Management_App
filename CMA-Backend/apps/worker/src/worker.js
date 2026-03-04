const { Worker } = require('bullmq');
const { createRedisConnection } = require('@core/cache/src/redis-connection');
const processors = require('./processors');

// Dung factory tu @core/cache — config, retry, TLS, error handler da duoc xu ly san
// maxRetriesPerRequest: null la bat buoc voi BullMQ
const connection = createRedisConnection(
    { maxRetriesPerRequest: null },
    '[Worker]'
);

console.log('---------------------------------------');
console.log('👷 WORKER SERVICE IS STARTING...');
console.log('---------------------------------------');

if (!connection) {
    console.warn('⚠️  [Worker] Redis not configured. Worker will not process jobs.');
    console.warn('   Set REDIS_HOST in .env to enable job queue.');
    process.exit(0);
}

connection.connect().catch(() => {
    // Loi duoc xu ly boi event 'error' trong createRedisConnection
});

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

worker.on('active', (job) => console.log(`▶️  [Start] Job ${job.id} (${job.name}) bắt đầu chạy...`));
worker.on('completed', (job) => console.log(`🎉 [Done]  Job ${job.id} hoàn thành.`));
worker.on('failed', (job, err) => console.error(`🔥 [Fail]  Job ${job.id} bị lỗi: ${err.message}`));

console.log("🚀 Worker đã sẵn sàng nhận việc từ 'system-queue'!");