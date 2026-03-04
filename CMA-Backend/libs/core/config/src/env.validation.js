const { z } = require('zod');
const dotenv = require('dotenv');
const { join } = require('path');

// Load .env tu thu muc goc cua monorepo
dotenv.config({ path: join(__dirname, '../../../../../.env') });

/**
 * Zod Schema de validate toan bo Environment Variables.
 * Neu thieu bien bat buoc, app se crash ngay khi start kem log chi tiet.
 */
const envSchema = z.object({
    // App
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),

    // Security
    JWT_SECRET: z.string().min(10, 'JWT_SECRET is required and must be at least 10 chars'),

    // Firebase (Bat buoc phai co)
    FIREBASE_CREDENTIALS: z.string().min(10, 'FIREBASE_CREDENTIALS JSON string is required'),

    // Redis (Optional)
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().transform(val => val ? Number(val) : undefined).optional(),
    REDIS_PASSWORD: z.string().optional(),

    // Cloudinary (Optional nhung canh bao neu thieu)
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

// Chay thu viec parse env
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Môi trường (.env) bị THIẾU hoặc SAI CẤU HÌNH:');
    _env.error.issues.forEach(issue => {
        console.error(`  - Mảng: ${issue.path.join('.')} | Lỗi: ${issue.message}`);
    });
    console.error('⚠️ Vui lòng cập nhật file .env trước khi chạy lại server.');
    process.exit(1);
}

const envVars = _env.data;

module.exports = {
    app: {
        env: envVars.NODE_ENV,
        port: envVars.PORT,
    },
    security: {
        jwtSecret: envVars.JWT_SECRET,
    },
    firebase: {
        credentials: envVars.FIREBASE_CREDENTIALS,
    },
    redis: {
        host: envVars.REDIS_HOST,
        port: envVars.REDIS_PORT,
        password: envVars.REDIS_PASSWORD,
    },
    cloudinary: {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY_API_KEY,
        apiSecret: envVars.CLOUDINARY_API_SECRET,
    }
};
