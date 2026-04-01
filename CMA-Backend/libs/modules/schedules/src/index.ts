import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import {
    PostgresSchedulesRepository,
    PostgresLessonLogsRepository,
    PostgresAttachmentsRepository,
} from './repositories/postgres.schedules.repo';
import { SchedulesService } from './schedules.service';
import { SCHEDULES_MIGRATION } from './schedules.migration';

export * from './schedules.model';
export * from './schedules.service';

class SchedulesModule implements IAppModule {
    get name(): string { return 'schedules'; }
    get basePath(): string { return '/schedules'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        const db = container.resolve<{ getDB: () => Pool }>('db');
        const pool = db.getDB();
        if (pool) {
            pool.query(SCHEDULES_MIGRATION)
                .then(() => console.log('✅ [Schedules] Tables ready (schedules, lesson_logs, attachments).'))
                .catch((err: Error) => console.error('❌ [Schedules] Migration error:', err.message));
        }

        container.register({
            schedulesRepository: asClass(PostgresSchedulesRepository).singleton(),
            lessonLogsRepository: asClass(PostgresLessonLogsRepository).singleton(),
            attachmentsRepository: asClass(PostgresAttachmentsRepository).singleton(),
            schedulesService: asClass(SchedulesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({
                module: this.name,
                status: 'ok',
                tables: ['schedules', 'lesson_logs', 'attachments'],
            });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new SchedulesModule();
