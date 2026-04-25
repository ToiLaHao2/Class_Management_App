import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';

import { PostgresCategoriesRepository } from './repositories/postgres.category.repo';
import { CategoriesService } from './category.service';

export * from './category.model';
export * from './category.service';

class CategoriesModule implements IAppModule {
    get name(): string { return 'categories'; }
    get basePath(): string { return '/categories'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // DI Registration
        container.register({
            categoriesRepository: asClass(PostgresCategoriesRepository).singleton(),
            categoriesService: asClass(CategoriesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok' });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new CategoriesModule();
