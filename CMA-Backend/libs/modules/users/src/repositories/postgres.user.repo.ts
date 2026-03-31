import { BasePostgresRepository } from '@core/database';
import type { IDatabaseAdapter } from '@core/database';
import { IUsersRepository, IUserEntity } from '../user.model';

/**
 * PostgresUsersRepository — IUsersRepository implementation for PostgreSQL.
 *
 * Expects a table `users` with columns:
 *   id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email TEXT UNIQUE NOT NULL,
 *   full_name TEXT NOT NULL,
 *   password_hash TEXT NOT NULL,
 *   role TEXT NOT NULL DEFAULT 'student',
 *   avatar TEXT,
 *   must_change_password BOOLEAN DEFAULT FALSE,
 *   is_deleted BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 */
export class PostgresUsersRepository implements IUsersRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'users');
    }

    /**
     * Map snake_case row từ Postgres sang camelCase IUserEntity
     */
    private mapRowToEntity(row: Record<string, unknown>): IUserEntity {
        return {
            id: row.id as string,
            email: row.email as string,
            fullName: row.full_name as string,
            passwordHash: row.password_hash as string,
            role: row.role as IUserEntity['role'],
            avatar: (row.avatar as string) ?? undefined,
            mustChangePassword: row.must_change_password as boolean,
            isDeleted: row.is_deleted as boolean,
            createdAt: new Date(row.created_at as string),
        };
    }

    /**
     * Map camelCase data sang snake_case cho Postgres
     */
    private mapEntityToRow(data: Record<string, unknown>): Record<string, unknown> {
        const mapped: Record<string, unknown> = {};

        if (data.email !== undefined) mapped.email = data.email;
        if (data.fullName !== undefined) mapped.full_name = data.fullName;
        if (data.passwordHash !== undefined) mapped.password_hash = data.passwordHash;
        if (data.role !== undefined) mapped.role = data.role;
        if (data.avatar !== undefined) mapped.avatar = data.avatar;
        if (data.mustChangePassword !== undefined) mapped.must_change_password = data.mustChangePassword;
        if (data.isDeleted !== undefined) mapped.is_deleted = data.isDeleted;

        return mapped;
    }

    async findById(id: string): Promise<IUserEntity | null> {
        const row = await this.baseRepo.findById(id);
        if (!row) return null;
        return this.mapRowToEntity(row);
    }

    async findAll(): Promise<IUserEntity[]> {
        const rows = await this.baseRepo.findAll();
        return rows.map(row => this.mapRowToEntity(row));
    }

    async findByEmail(email: string): Promise<IUserEntity | null> {
        const rows = await this.baseRepo.findWhere({ email });
        if (rows.length === 0) return null;
        return this.mapRowToEntity(rows[0]);
    }

    async create(data: Omit<IUserEntity, 'id' | 'createdAt' | 'isDeleted'>): Promise<IUserEntity> {
        const pgData = this.mapEntityToRow(data as unknown as Record<string, unknown>);
        pgData.is_deleted = false;
        const row = await this.baseRepo.create(pgData);
        return this.mapRowToEntity(row);
    }

    async update(id: string, partialData: Partial<IUserEntity>): Promise<IUserEntity> {
        const pgData = this.mapEntityToRow(partialData as unknown as Record<string, unknown>);
        const row = await this.baseRepo.update(id, pgData);
        return this.mapRowToEntity(row);
    }
}
