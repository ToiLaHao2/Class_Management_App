export const ATTACHMENTS_MIGRATION = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Bảng Attachments Pollymorphic thế hệ mới có Provider
    CREATE TABLE IF NOT EXISTS "attachments" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ref_type VARCHAR(50) NOT NULL,
        ref_id UUID NOT NULL,
        
        file_name TEXT,
        file_type VARCHAR(100),
        file_size INTEGER,
        
        url TEXT NOT NULL,
        provider VARCHAR(50) NOT NULL,
        provider_public_id TEXT,
        
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_att_ref ON attachments(ref_type, ref_id);
`;
