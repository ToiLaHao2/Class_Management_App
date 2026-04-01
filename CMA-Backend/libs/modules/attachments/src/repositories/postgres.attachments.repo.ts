import { BasePostgresRepository, IDatabaseAdapter } from '@core/database';
import { Pool } from 'pg';
import { IAttachmentsRepository, IAttachment } from '../attachments.model';

function mapAttachment(row: any): IAttachment {
    return {
        id: row.id,
        ref_type: row.ref_type,
        ref_id: row.ref_id,
        file_name: row.file_name ?? '',
        file_type: row.file_type ?? '',
        file_size: row.file_size ?? 0,
        url: row.url,
        provider: row.provider,
        provider_public_id: row.provider_public_id ?? '',
        uploaded_by: row.uploaded_by ?? undefined,
        created_at: new Date(row.created_at),
    };
}

export class PostgresAttachmentsRepository implements IAttachmentsRepository {
    private pool: Pool;
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.pool = db.getDB() as Pool;
        this.baseRepo = new BasePostgresRepository(db, 'attachments');
    }

    async findByRef(refType: string, refId: string): Promise<IAttachment[]> {
        const res = await this.pool.query(
            `SELECT * FROM attachments WHERE ref_type = $1 AND ref_id = $2 ORDER BY created_at DESC`,
            [refType, refId]
        );
        return res.rows.map(mapAttachment);
    }
    
    async findById(id: string): Promise<IAttachment | null> {
        const row = await this.baseRepo.findById(id);
        return row ? mapAttachment(row) : null;
    }

    async create(data: Record<string, unknown>): Promise<IAttachment> {
        return mapAttachment(await this.baseRepo.create(data));
    }

    async delete(id: string): Promise<boolean> {
        return this.baseRepo.delete(id);
    }
}
