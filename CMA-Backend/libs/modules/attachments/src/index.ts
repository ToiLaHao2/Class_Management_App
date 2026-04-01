import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass, asValue } from 'awilix';
import { Pool } from 'pg';

import { PostgresAttachmentsRepository } from './repositories/postgres.attachments.repo';
import { AttachmentsService } from './attachments.service';
import { ATTACHMENTS_MIGRATION } from './attachments.migration';

// Import core storage 
import { cloudinaryAdapter } from '@core/storage';

export * from './attachments.model';
export * from './attachments.service';

class AttachmentsModule implements IAppModule {
    get name(): string { return 'attachments'; }
    get basePath(): string { return '/attachments'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        const db = container.resolve<{ getDB: () => Pool }>('db');
        const pool = db.getDB();
        if (pool) {
            pool.query(ATTACHMENTS_MIGRATION)
                .then(() => console.log('✅ [Attachments] Table ready (attachments) [Polymorphic].'))
                .catch((err: Error) => console.error('❌ [Attachments] Migration error:', err.message));
        }

        // Register DI
        container.register({
            attachmentsRepository: asClass(PostgresAttachmentsRepository).singleton(),
            // Inject adapter linh hoạt tại đây (Ví dụ tương lai đổi thành s3Adapter.singleton)
            storageProvider: asValue(cloudinaryAdapter), 
            attachmentsService: asClass(AttachmentsService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({
                module: this.name,
                status: 'ok',
                provider: cloudinaryAdapter.providerName
            });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with Storage DI)`);
    }
}

export default new AttachmentsModule();
