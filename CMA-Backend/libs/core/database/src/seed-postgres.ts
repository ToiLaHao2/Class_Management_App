import { Pool } from 'pg';
import { hashPassword } from '@core/utils';

const SEED_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SEED_ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD;

/**
 * Seed Super Admin into PostgreSQL.
 * Also creates the `users` table if it doesn't exist (auto-migration).
 */
export const seedSuperAdminPostgres = async (pool: Pool): Promise<void> => {
    try {
        console.log('🌱 [Postgres] Checking system for Super Admin...');

        if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
            console.log('⚠️ ADMIN_EMAIL / ADMIN_DEFAULT_PASSWORD is missing. Skipping admin seed.');
            return;
        }

        // Auto-create table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                avatar TEXT,
                must_change_password BOOLEAN DEFAULT FALSE,
                is_deleted BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ [Postgres] Table "users" ready.');

        // Check if admin exists
        const existing = await pool.query(
            `SELECT id FROM "users" WHERE role = 'admin' LIMIT 1`
        );

        if (existing.rows.length > 0) {
            console.log('✅ Super Admin already exists. Skipping seed.');
            return;
        }

        console.log('⚠️ No Admin found. Creating default Super Admin...');

        const passwordHash = await hashPassword(SEED_ADMIN_PASSWORD);

        await pool.query(
            `INSERT INTO "users" (email, full_name, password_hash, role, must_change_password, is_deleted)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [SEED_ADMIN_EMAIL, 'System Administrator', passwordHash, 'admin', true, false]
        );

        console.log('🎉 Super Admin created successfully!');
        console.log(`👉 Email: ${SEED_ADMIN_EMAIL}`);
        console.log('⚠️ Default password was set from ADMIN_DEFAULT_PASSWORD. Please login and change it immediately.');

    } catch (error) {
        console.error('❌ [Postgres] Seeding failed:', error);
    }
};
