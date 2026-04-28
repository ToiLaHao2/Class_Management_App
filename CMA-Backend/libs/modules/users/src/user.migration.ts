/**
 * Auto-migration cho bảng users & contacts
 * DROP + CREATE lại để match schema mới.
 */
export const USERS_MIGRATION = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Drop bảng cũ (schema cũ)
    DROP TABLE IF EXISTS "contacts" CASCADE;
    DROP TABLE IF EXISTS "users" CASCADE;

    CREATE TABLE "users" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL,
        full_name TEXT,
        email TEXT UNIQUE NOT NULL,
        date_of_birth TIMESTAMPTZ,
        avatar_url TEXT,
        hashed_password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE TABLE "contacts" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID,
        contact_value TEXT NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
`;
