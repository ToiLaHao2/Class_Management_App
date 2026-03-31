import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';

import { PostgresUsersRepository } from './repositories/postgres.user.repo';
import { UsersService } from './user.service';

export * from './user.model';
export * from './user.service';

class UsersModule implements IAppModule {
    get name(): string { return 'users'; }
    get basePath(): string { return '/users'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Đăng ký Dependencies vào IoC Container toàn cục
        container.register({
            usersRepository: asClass(PostgresUsersRepository).singleton(),
            usersService: asClass(UsersService).singleton()
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok', dbInjected: !!container.resolve('usersRepository') });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new UsersModule();

