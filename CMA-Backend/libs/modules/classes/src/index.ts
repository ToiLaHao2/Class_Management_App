import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import {
    PostgresClassesRepository,
    PostgresTeachersClassesRepository,
    PostgresClassesStudentsRepository,
    PostgresLessonsRepository,
} from './repositories/postgres.classes.repo';
import { ClassesService } from './classes.service';
// Migration is handled centrally by migration-runner.ts (combo.ts startup)


export * from './classes.model';
export * from './classes.service';

class ClassesModule implements IAppModule {
    get name(): string { return 'classes'; }
    get basePath(): string { return '/classes'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Migration handled centrally at startup — no inline call needed here

        // DI Registration
        container.register({
            classesRepository: asClass(PostgresClassesRepository).singleton(),
            teachersClassesRepository: asClass(PostgresTeachersClassesRepository).singleton(),
            classesStudentsRepository: asClass(PostgresClassesStudentsRepository).singleton(),
            lessonsRepository: asClass(PostgresLessonsRepository).singleton(),
            classesService: asClass(ClassesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({
                module: this.name,
                status: 'ok',
                tables: ['classes', 'teachers_classes', 'classes_students', 'lessons'],
            });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new ClassesModule();
