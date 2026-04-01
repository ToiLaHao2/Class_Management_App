export const SCHEDULES_MIGRATION = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 1. Lịch học của lớp
    CREATE TABLE IF NOT EXISTS "schedules" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        date TIMESTAMPTZ NOT NULL,
        start_time TEXT,
        end_time TEXT,
        room TEXT,
        status UUID REFERENCES categories(id) ON DELETE SET NULL,
        content_summary TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);

    -- 2. Điểm danh từng HS (Giữ tên lesson_logs theo yêu cầu)
    CREATE TABLE IF NOT EXISTS "lesson_logs" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
        attendance_status BOOLEAN NOT NULL DEFAULT false,
        student_comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(schedule_id, student_id)
    );

    CREATE INDEX IF NOT EXISTS idx_ll_schedule ON lesson_logs(schedule_id);
    CREATE INDEX IF NOT EXISTS idx_ll_student ON lesson_logs(student_id);
`;

