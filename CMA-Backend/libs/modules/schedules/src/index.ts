import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import {
    PostgresSchedulesRepository,
    PostgresLessonLogsRepository,
} from './repositories/postgres.schedules.repo';
import { SchedulesService } from './schedules.service';
// Migration is handled centrally by migration-runner.ts (combo.ts startup)


export * from './schedules.model';
export * from './schedules.service';

class SchedulesModule implements IAppModule {
    get name(): string { return 'schedules'; }
    get basePath(): string { return '/schedules'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Migration handled centrally at startup — no inline call needed here

        container.register({
            schedulesRepository: asClass(PostgresSchedulesRepository).singleton(),
            lessonLogsRepository: asClass(PostgresLessonLogsRepository).singleton(),
            schedulesService: asClass(SchedulesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({
                module: this.name,
                status: 'ok',
                tables: ['schedules', 'lesson_logs'],
            });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new SchedulesModule();
