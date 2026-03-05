import { z } from 'zod';
import dotenv from 'dotenv';
import { join } from 'path';

// Load .env tu thu muc goc cua monorepo
dotenv.config({ path: join(__dirname, '../../../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default(3000),

    JWT_SECRET: z.string().min(10, 'JWT_SECRET is required and must be at least 10 chars'),
    FIREBASE_CREDENTIALS: z.string().min(10, 'FIREBASE_CREDENTIALS JSON string is required'),

    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().transform(val => val ? Number(val) : undefined).optional(),
    REDIS_PASSWORD: z.string().optional(),

    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),    // 15 minutes
    RATE_LIMIT_MAX: z.string().transform(Number).default(100),
    RATE_LIMIT_AUTH_MAX: z.string().transform(Number).default(10),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Environment (.env) is MISSING or INVALID:');
    _env.error.issues.forEach(issue => {
        console.error(`  - Field: ${issue.path.join('.')} | Error: ${issue.message}`);
    });
    console.error('⚠️ Please update .env before restarting the server.');
    process.exit(1);
}

const envVars = _env.data;

// === Typed Config Exports ===

export const appConfig = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
} as const;

export const securityConfig = {
    jwtSecret: envVars.JWT_SECRET,
} as const;

export const databaseConfig = {
    credentials: envVars.FIREBASE_CREDENTIALS,
} as const;

export const cacheConfig = {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
} as const;

export const storageConfig = {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
} as const;

export const rateLimitConfig = {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX,
    authMax: envVars.RATE_LIMIT_AUTH_MAX,
} as const;
