import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import { PostgresProfilesRepository } from './repositories/postgres.profiles.repo';
import { ProfilesService } from './profiles.service';
// Migration is handled centrally by migration-runner.ts (combo.ts startup)


export * from './profiles.model';
export * from './profiles.service';

class ProfilesModule implements IAppModule {
    get name(): string { return 'profiles'; }
    get basePath(): string { return '/profiles'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Migration handled centrally at startup — no inline call needed here

        // DI Registration
        container.register({
            profilesRepository: asClass(PostgresProfilesRepository).singleton(),
            profilesService: asClass(ProfilesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok', dbInjected: !!container.resolve('profilesRepository') });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new ProfilesModule();
