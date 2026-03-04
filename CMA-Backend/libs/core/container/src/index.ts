import { createContainer, InjectionMode, asValue } from 'awilix';
import { firebaseAdapter } from '@core/database';
import { cacheManager } from '@core/cache';
import { cloudinaryAdapter } from '@core/storage';
import { logger } from '@core/logger';
import { eventBus } from '@core/shared';

// Define the shape of our core dependencies
export interface ICradle {
    db: typeof firebaseAdapter;
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
    db: asValue(firebaseAdapter),
    cache: asValue(cacheManager),
    storage: asValue(cloudinaryAdapter),
    logger: asValue(logger),
    eventBus: asValue(eventBus),
});

console.log('📦 [DI] Core Container initialized with Awilix.');

export function getContainer() {
    return container;
}
