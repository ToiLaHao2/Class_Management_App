export const ASSIGNMENTS_MIGRATION = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 1. Bảng Assignments
    CREATE TABLE IF NOT EXISTS "assignments" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        deadline TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);

    -- 2. Bảng Ngân Hàng Câu Hỏi (Questions)
    CREATE TABLE IF NOT EXISTS "questions" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB,
        correct_answer TEXT,
        question_type UUID REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_questions_teacher ON questions(teacher_id);

    -- 3. Bảng Trung gian Assignment -> Questions
    CREATE TABLE IF NOT EXISTS "assignment_questions" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(assignment_id, question_id)
    );

    CREATE INDEX IF NOT EXISTS idx_aq_assignment ON assignment_questions(assignment_id);

    -- 4. Bảng Học sinh nộp bài
    CREATE TABLE IF NOT EXISTS "student_submissions" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
        grade DECIMAL(5, 2),
        status UUID REFERENCES categories(id) ON DELETE SET NULL,
        feedback TEXT,
        submission_data JSONB,
        submission_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(assignment_id, student_id)
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON student_submissions(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_student ON student_submissions(student_id);
`;
