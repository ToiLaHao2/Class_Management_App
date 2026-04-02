import { BasePostgresRepository } from '@core/database';
import type { IDatabaseAdapter } from '@core/database';
import { IUsersRepository, IUserEntity } from '../user.model';

/**
 * PostgresUsersRepository — Schema mới: UUID, username, is_active
 */
export class PostgresUsersRepository implements IUsersRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'users');
    }

    private mapRow(row: Record<string, unknown>): IUserEntity {
        return {
            id: row.id as string,
            username: row.username as string,
            email: row.email as string,
            full_name: (row.full_name as string) ?? '',
            date_of_birth: row.date_of_birth ? new Date(row.date_of_birth as string) : undefined,
            avatar_url: (row.avatar_url as string) ?? undefined,
            hashed_password: row.hashed_password as string,
            role: row.role as IUserEntity['role'],
            is_active: row.is_active as boolean,
            created_at: new Date(row.created_at as string),
            updated_at: new Date(row.updated_at as string),
        };
    }

    async findById(id: string): Promise<IUserEntity | null> {
        const row = await this.baseRepo.findById(id);
        if (!row) return null;
        return this.mapRow(row);
    }

    async findAll(): Promise<IUserEntity[]> {
        const rows = await this.baseRepo.findAll();
        return rows.map(row => this.mapRow(row));
    }

    async findByEmail(email: string): Promise<IUserEntity | null> {
        const rows = await this.baseRepo.findWhere({ email });
        if (rows.length === 0) return null;
        return this.mapRow(rows[0]);
    }

    async findByUsername(username: string): Promise<IUserEntity | null> {
        const rows = await this.baseRepo.findWhere({ username });
        if (rows.length === 0) return null;
        return this.mapRow(rows[0]);
    }

    async create(data: Omit<IUserEntity, 'id' | 'created_at' | 'updated_at'>): Promise<IUserEntity> {
        const row = await this.baseRepo.create(data as unknown as Record<string, unknown>);
        return this.mapRow(row);
    }

    async update(id: string, partialData: Partial<IUserEntity>): Promise<IUserEntity> {
        const row = await this.baseRepo.update(id, partialData as unknown as Record<string, unknown>);
        return this.mapRow(row);
    }
}
