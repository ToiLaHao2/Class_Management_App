import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import { PostgresUsersRepository } from './repositories/postgres.user.repo';
import { PostgresContactsRepository } from './repositories/postgres.contacts.repo';
import { UsersService } from './user.service';
// Migration is handled centrally by migration-runner.ts (combo.ts startup)


export * from './user.model';
export * from './user.service';

class UsersModule implements IAppModule {
    get name(): string { return 'users'; }
    get basePath(): string { return '/users'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Migration handled centrally at startup — no inline call needed here

        // DI Registration
        container.register({
            usersRepository: asClass(PostgresUsersRepository).singleton(),
            contactsRepository: asClass(PostgresContactsRepository).singleton(),
            usersService: asClass(UsersService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok', dbInjected: !!container.resolve('usersRepository') });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new UsersModule();
