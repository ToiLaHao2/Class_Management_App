import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';

import { AuthService } from './auth.service';

export * from './auth.service';

class AuthModule implements IAppModule {
    get name(): string { return 'auth'; }
    get basePath(): string { return '/auth'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Đăng ký Dependencies vào IoC Container toàn cục
        container.register({
            authService: asClass(AuthService).singleton()
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok', serviceInjected: !!container.resolve('authService') });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new AuthModule();
