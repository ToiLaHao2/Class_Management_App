import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import {
    PostgresAssignmentsRepository,
    PostgresQuestionsRepository,
    PostgresAssignmentQuestionsRepository,
    PostgresStudentSubmissionsRepository,
} from './repositories/postgres.assignments.repo';
import { AssignmentsService } from './assignments.service';
// Migration is handled centrally by migration-runner.ts (combo.ts startup)


export * from './assignments.model';
export * from './assignments.service';

class AssignmentsModule implements IAppModule {
    get name(): string { return 'assignments'; }
    get basePath(): string { return '/assignments'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Migration handled centrally at startup — no inline call needed here

        container.register({
            assignmentsRepository: asClass(PostgresAssignmentsRepository).singleton(),
            questionsRepository: asClass(PostgresQuestionsRepository).singleton(),
            assignmentQuestionsRepository: asClass(PostgresAssignmentQuestionsRepository).singleton(),
            studentSubmissionsRepository: asClass(PostgresStudentSubmissionsRepository).singleton(),
            assignmentsService: asClass(AssignmentsService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({
                module: this.name,
                status: 'ok',
                tables: ['assignments', 'questions', 'assignment_questions', 'student_submissions'],
            });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new AssignmentsModule();
