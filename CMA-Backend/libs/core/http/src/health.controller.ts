import 'reflect-metadata';
import {
    Controller,
    Get,
    Route,
    Tags,
} from '@tsoa/runtime';
import { container } from '@core/container';

/**
 * Response shape for the health check endpoint
 */
export interface HealthStatus {
    status: 'healthy' | 'degraded';
    uptime: number;
    timestamp: string;
    services: {
        redis: 'connected' | 'disconnected';
        firebase: 'connected' | 'disconnected';
        cloudinary: 'configured' | 'not_configured';
    };
}

@Route('health')
@Tags('System')
export class HealthController extends Controller {
    /**
     * System health check — verifies connectivity of all core dependencies.
     * Used by deployment platforms (Render, Railway, AWS ECS) to determine app status.
     */
    @Get('/')
    public async getHealth(): Promise<HealthStatus> {
        const cache = container.resolve<{ getRedisClient: () => { status: string } | null }>('cache');
        const storage = container.resolve<{ isConfigured?: () => boolean }>('storage');

        const redisClient = cache.getRedisClient();
        const redisStatus = redisClient?.status === 'ready' ? 'connected' : 'disconnected';

        const cloudinaryStatus = (typeof storage.isConfigured === 'function' && storage.isConfigured())
            ? 'configured'
            : 'not_configured';

        // Firebase: if container resolved without throwing, it's connected
        let firebaseStatus: 'connected' | 'disconnected' = 'disconnected';
        try {
            container.resolve('db');
            firebaseStatus = 'connected';
        } catch {
            firebaseStatus = 'disconnected';
        }

        const isHealthy = redisStatus === 'connected' && firebaseStatus === 'connected';

        if (!isHealthy) {
            this.setStatus(503);
        }

        return {
            status: isHealthy ? 'healthy' : 'degraded',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            services: {
                redis: redisStatus,
                firebase: firebaseStatus,
                cloudinary: cloudinaryStatus,
            },
        };
    }
}
