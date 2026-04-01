import { BasePostgresRepository, IDatabaseAdapter } from '@core/database';
import { Pool } from 'pg';
import {
    IAssignmentsRepository, IQuestionsRepository,
    IAssignmentQuestionsRepository, IStudentSubmissionsRepository,
    IAssignment, IQuestion, IAssignmentQuestion, IStudentSubmission
} from '../assignments.model';

// --- Mappers ---
function mapAssignment(row: any): IAssignment {
    return {
        id: row.id,
        class_id: row.class_id,
        title: row.title,
        description: row.description ?? undefined,
        deadline: row.deadline ? new Date(row.deadline) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

function mapQuestion(row: any): IQuestion {
    return {
        id: row.id,
        teacher_id: row.teacher_id,
        question_text: row.question_text,
        options: row.options ?? undefined,
        correct_answer: row.correct_answer ?? undefined,
        question_type: row.question_type ?? undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

function mapAssignmentQuestion(row: any): IAssignmentQuestion {
    return {
        id: row.id,
        assignment_id: row.assignment_id,
        question_id: row.question_id,
        order_index: row.order_index,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

function mapStudentSubmission(row: any): IStudentSubmission {
    return {
        id: row.id,
        assignment_id: row.assignment_id,
        student_id: row.student_id,
        grade: row.grade != null ? parseFloat(row.grade) : undefined,
        status: row.status ?? undefined,
        feedback: row.feedback ?? undefined,
        submission_data: row.submission_data ?? undefined,
        submission_date: row.submission_date ? new Date(row.submission_date) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

// ===================== REPOSITORIES =====================

export class PostgresAssignmentsRepository implements IAssignmentsRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'assignments');
    }

    async findByClassId(classId: string): Promise<IAssignment[]> {
        const rows = await this.baseRepo.findWhere({ class_id: classId });
        return rows.map(mapAssignment);
    }
    async findById(id: string): Promise<IAssignment | null> {
        const row = await this.baseRepo.findById(id);
        return row ? mapAssignment(row) : null;
    }
    async create(data: Record<string, unknown>): Promise<IAssignment> {
        const row = await this.baseRepo.create(data);
        return mapAssignment(row);
    }
    async update(id: string, data: Record<string, unknown>): Promise<IAssignment> {
        const row = await this.baseRepo.update(id, data);
        return mapAssignment(row);
    }
    async delete(id: string): Promise<boolean> {
        return this.baseRepo.delete(id);
    }
}

export class PostgresQuestionsRepository implements IQuestionsRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'questions');
    }

    async findByTeacherId(teacherId: string): Promise<IQuestion[]> {
        const rows = await this.baseRepo.findWhere({ teacher_id: teacherId });
        return rows.map(mapQuestion);
    }
    async findById(id: string): Promise<IQuestion | null> {
        const row = await this.baseRepo.findById(id);
        return row ? mapQuestion(row) : null;
    }
    async create(data: Record<string, unknown>): Promise<IQuestion> {
        const row = await this.baseRepo.create(data);
        return mapQuestion(row);
    }
    async update(id: string, data: Record<string, unknown>): Promise<IQuestion> {
        const row = await this.baseRepo.update(id, data);
        return mapQuestion(row);
    }
    async delete(id: string): Promise<boolean> {
        return this.baseRepo.delete(id);
    }
}

export class PostgresAssignmentQuestionsRepository implements IAssignmentQuestionsRepository {
    private pool: Pool;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.pool = db.getDB() as Pool;
    }

    async findByAssignmentId(assignmentId: string): Promise<IAssignmentQuestion[]> {
        const res = await this.pool.query(
            `SELECT * FROM assignment_questions WHERE assignment_id = $1 ORDER BY order_index ASC, created_at ASC`,
            [assignmentId]
        );
        return res.rows.map(mapAssignmentQuestion);
    }

    async linkQuestion(assignmentId: string, questionId: string, orderIndex: number): Promise<IAssignmentQuestion> {
        const res = await this.pool.query(
            `INSERT INTO assignment_questions (assignment_id, question_id, order_index)
             VALUES ($1, $2, $3)
             ON CONFLICT (assignment_id, question_id) DO UPDATE SET order_index = EXCLUDED.order_index, updated_at = NOW()
             RETURNING *`,
            [assignmentId, questionId, orderIndex]
        );
        return mapAssignmentQuestion(res.rows[0]);
    }

    async updateOrder(assignmentId: string, questionId: string, orderIndex: number): Promise<IAssignmentQuestion> {
        const res = await this.pool.query(
            `UPDATE assignment_questions SET order_index = $3, updated_at = NOW()
             WHERE assignment_id = $1 AND question_id = $2 RETURNING *`,
            [assignmentId, questionId, orderIndex]
        );
        if (res.rowCount === 0) throw new Error('Question not found in assignment');
        return mapAssignmentQuestion(res.rows[0]);
    }

    async unlinkQuestion(assignmentId: string, questionId: string): Promise<boolean> {
        const res = await this.pool.query(
            `DELETE FROM assignment_questions WHERE assignment_id = $1 AND question_id = $2`,
            [assignmentId, questionId]
        );
        return (res.rowCount ?? 0) > 0;
    }
}

export class PostgresStudentSubmissionsRepository implements IStudentSubmissionsRepository {
    private pool: Pool;
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.pool = db.getDB() as Pool;
        this.baseRepo = new BasePostgresRepository(db, 'student_submissions');
    }

    async findByAssignmentId(assignmentId: string): Promise<IStudentSubmission[]> {
        const rows = await this.baseRepo.findWhere({ assignment_id: assignmentId });
        return rows.map(mapStudentSubmission);
    }

    async findByStudent(studentId: string, assignmentId?: string): Promise<IStudentSubmission[]> {
        const filters: any = { student_id: studentId };
        if (assignmentId) filters.assignment_id = assignmentId;
        const rows = await this.baseRepo.findWhere(filters);
        return rows.map(mapStudentSubmission);
    }

    async findById(id: string): Promise<IStudentSubmission | null> {
        const row = await this.baseRepo.findById(id);
        return row ? mapStudentSubmission(row) : null;
    }

    async upsertSubmission(assignmentId: string, studentId: string, submissionData: Record<string, unknown>): Promise<IStudentSubmission> {
        const res = await this.pool.query(
            `INSERT INTO student_submissions (assignment_id, student_id, submission_data, submission_date, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())
             ON CONFLICT (assignment_id, student_id) DO UPDATE SET 
                 submission_data = EXCLUDED.submission_data, 
                 submission_date = NOW(), 
                 updated_at = NOW()
             RETURNING *`,
            [assignmentId, studentId, JSON.stringify(submissionData)]
        );
        return mapStudentSubmission(res.rows[0]);
    }

    async gradeSubmission(submissionId: string, grade: number, feedback?: string, status?: string): Promise<IStudentSubmission> {
        const params: any[] = [submissionId, grade];
        let query = `UPDATE student_submissions SET grade = $2, updated_at = NOW()`;
        
        if (feedback !== undefined) {
            params.push(feedback);
            query += `, feedback = $${params.length}`;
        }
        if (status !== undefined) {
            params.push(status);
            query += `, status = $${params.length}`;
        }
        
        query += ` WHERE id = $1 RETURNING *`;
        const res = await this.pool.query(query, params);
        if (res.rowCount === 0) throw new Error('Submission not found');
        return mapStudentSubmission(res.rows[0]);
    }
}
