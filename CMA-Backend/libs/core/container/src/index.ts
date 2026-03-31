import { createContainer, InjectionMode, asValue } from 'awilix';
import { postgresAdapter } from '@core/database';
import { databaseConfig } from '@core/config';
import { cacheManager } from '@core/cache';
import { cloudinaryAdapter } from '@core/storage';
import { logger } from '@core/logger';
import { eventBus } from '@core/shared';

// Initialize PostgreSQL adapter with config from .env
postgresAdapter.init({
    host: databaseConfig.pg.host,
    port: databaseConfig.pg.port,
    database: databaseConfig.pg.database,
    user: databaseConfig.pg.user,
    password: databaseConfig.pg.password,
    ssl: databaseConfig.pg.ssl,
});
postgresAdapter.connect();

// Define the shape of our core dependencies
export interface ICradle {
    db: typeof postgresAdapter;
    cache: typeof cacheManager;
    storage: typeof cloudinaryAdapter;
    logger: typeof logger;
    eventBus: typeof eventBus;
    // Allow dynamic registration for business services later
    [key: string]: any;
}

/**
 * Global Dependency Injection Container
 */
export const container = createContainer<ICradle>({
    injectionMode: InjectionMode.PROXY,
});

// Register Core Infrastructure (Singletons)
container.register({
    db: asValue(postgresAdapter),
    cache: asValue(cacheManager),
    storage: asValue(cloudinaryAdapter),
    logger: asValue(logger),
    eventBus: asValue(eventBus),
});

console.log('📦 [DI] Core Container initialized with Awilix.');

export function getContainer() {
    return container;
}
