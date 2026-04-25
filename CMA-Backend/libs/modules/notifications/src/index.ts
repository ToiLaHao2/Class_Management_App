import { asClass, AwilixContainer } from 'awilix';
import { IAppModule } from '@core/shared';
import { Application } from 'express';
import { PostgresNotificationsRepository } from './repositories/postgres.notifications.repo';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
// Migration is handled centrally by migration-runner.ts (combo.ts startup)
import { SocketIoRedisPublisher } from '@core/events';

export * from './notifications.model';
export * from './notifications.service';
export * from './notifications.controller';

class NotificationsModule implements IAppModule {
    get name(): string { return 'notifications'; }
    get basePath(): string { return '/notifications'; }

    register(_app: Application, container: AwilixContainer): void {
        
        // 1. Register Event Publisher if not already registered
        if (!container.hasRegistration('eventPublisher')) {
            container.register({
                eventPublisher: asClass(SocketIoRedisPublisher).singleton(),
            });
        }

        // 2. DI Registration
        container.register({
            notificationsRepository: asClass(PostgresNotificationsRepository).singleton(),
            notificationsService: asClass(NotificationsService).singleton(),
            NotificationsController: asClass(NotificationsController).singleton(),
        });

        // Migration handled centrally at startup — no inline call needed here

        console.log(`📦 Module registered: [${this.name}] (with DI)`);
    }
}

export default new NotificationsModule();
