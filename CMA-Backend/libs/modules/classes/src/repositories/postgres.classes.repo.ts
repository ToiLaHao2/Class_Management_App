import type { IDatabaseAdapter } from '@core/database';
import { BasePostgresRepository } from '@core/database';
import { Pool } from 'pg';
import {
    IClassesRepository, ITeachersClassesRepository,
    IClassesStudentsRepository, ILessonsRepository,
    IClass, ITeacherClass, IClassStudent, ILesson
} from '../classes.model';

// ===================== HELPERS =====================

function mapClass(row: any): IClass {
    return {
        id: row.id,
        class_category_id: row.class_category_id ?? undefined,
        owner_id: row.owner_id,
        name: row.name,
        description: row.description ?? undefined,
        thumbnail_url: row.thumbnail_url ?? undefined,
        teaching_model: row.teaching_model ?? undefined,
        price: row.price != null ? parseFloat(row.price) : undefined,
        payment_category_id: row.payment_category_id ?? undefined,
        status: row.status ?? undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

function mapTeacherClass(row: any): ITeacherClass {
    return {
        id: row.id,
        teacher_id: row.teacher_id,
        class_id: row.class_id,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

function mapClassStudent(row: any): IClassStudent {
    return {
        id: row.id,
        class_id: row.class_id,
        student_id: row.student_id,
        status: row.status ?? undefined,
        startdate: row.startdate ? new Date(row.startdate) : undefined,
        enddate: row.enddate ? new Date(row.enddate) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

function mapLesson(row: any): ILesson {
    return {
        id: row.id,
        class_id: row.class_id,
        teacher_id: row.teacher_id,
        title: row.title,
        description: row.description ?? undefined,
        order_index: row.order_index ?? 0,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

// ===================== CLASSES REPO =====================

export class PostgresClassesRepository implements IClassesRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'classes');
    }

    async findById(id: string): Promise<IClass | null> {
        const row = await this.baseRepo.findById(id);
        return row ? mapClass(row) : null;
    }

    async findAll(filters?: Record<string, unknown>): Promise<IClass[]> {
        const rows = filters
            ? await this.baseRepo.findWhere(filters)
            : await this.baseRepo.findAll();
        return rows.map(mapClass);
    }

    async create(data: Record<string, unknown>): Promise<IClass> {
        const row = await this.baseRepo.create(data);
        return mapClass(row);
    }

    async update(id: string, data: Record<string, unknown>): Promise<IClass> {
        const row = await this.baseRepo.update(id, data);
        return mapClass(row);
    }
}

// ===================== TEACHERS_CLASSES REPO =====================

export class PostgresTeachersClassesRepository implements ITeachersClassesRepository {
    private pool: Pool;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.pool = db.getDB() as Pool;
    }

    async findByClassId(classId: string): Promise<ITeacherClass[]> {
        const result = await this.pool.query(
            `SELECT * FROM teachers_classes WHERE class_id = $1 ORDER BY created_at`,
            [classId]
        );
        return result.rows.map(mapTeacherClass);
    }

    async addTeacher(classId: string, teacherId: string): Promise<ITeacherClass> {
        const result = await this.pool.query(
            `INSERT INTO teachers_classes (teacher_id, class_id)
             VALUES ($1, $2)
             ON CONFLICT (teacher_id, class_id) DO UPDATE SET updated_at = NOW()
             RETURNING *`,
            [teacherId, classId]
        );
        return mapTeacherClass(result.rows[0]);
    }

    async removeTeacher(classId: string, teacherId: string): Promise<boolean> {
        const result = await this.pool.query(
            `DELETE FROM teachers_classes WHERE class_id = $1 AND teacher_id = $2`,
            [classId, teacherId]
        );
        return (result.rowCount ?? 0) > 0;
    }
}

// ===================== CLASSES_STUDENTS REPO =====================

export class PostgresClassesStudentsRepository implements IClassesStudentsRepository {
    private pool: Pool;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.pool = db.getDB() as Pool;
    }

    async findByClassId(classId: string): Promise<IClassStudent[]> {
        const result = await this.pool.query(
            `SELECT * FROM classes_students WHERE class_id = $1 ORDER BY created_at`,
            [classId]
        );
        return result.rows.map(mapClassStudent);
    }

    async findByStudentId(studentId: string): Promise<IClassStudent[]> {
        const result = await this.pool.query(
            `SELECT * FROM classes_students WHERE student_id = $1 ORDER BY created_at`,
            [studentId]
        );
        return result.rows.map(mapClassStudent);
    }

    async findEnrolledByUserId(userId: string): Promise<any[]> {
        const result = await this.pool.query(
            `SELECT c.*, cs.status as enrollment_status, cs.startdate, cs.enddate 
             FROM classes c
             JOIN classes_students cs ON c.id = cs.class_id
             JOIN student_profiles sp ON cs.student_id = sp.id
             WHERE sp.user_id = $1
             ORDER BY cs.created_at DESC`,
            [userId]
        );
        return result.rows.map(row => ({
            ...mapClass(row),
            enrollment_status: row.enrollment_status,
            startdate: row.startdate,
            enddate: row.enddate
        }));
    }

    async enroll(data: Record<string, unknown>): Promise<IClassStudent> {
        const result = await this.pool.query(
            `INSERT INTO classes_students (class_id, student_id, status, startdate, enddate)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (class_id, student_id) DO UPDATE SET
                status = EXCLUDED.status,
                startdate = EXCLUDED.startdate,
                enddate = EXCLUDED.enddate,
                updated_at = NOW()
             RETURNING *`,
            [data.class_id, data.student_id, data.status, data.startdate, data.enddate]
        );
        return mapClassStudent(result.rows[0]);
    }

    async updateStatus(classId: string, studentId: string, data: Record<string, unknown>): Promise<IClassStudent> {
        const result = await this.pool.query(
            `UPDATE classes_students
             SET status = $3, enddate = $4, updated_at = NOW()
             WHERE class_id = $1 AND student_id = $2
             RETURNING *`,
            [classId, studentId, data.status, data.enddate]
        );
        return mapClassStudent(result.rows[0]);
    }
}

// ===================== LESSONS REPO =====================

export class PostgresLessonsRepository implements ILessonsRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'lessons');
    }

    async findByClassId(classId: string): Promise<ILesson[]> {
        const rows = await this.baseRepo.findWhere({ class_id: classId });
        return rows.map(mapLesson);
    }

    async findById(id: string): Promise<ILesson | null> {
        const row = await this.baseRepo.findById(id);
        return row ? mapLesson(row) : null;
    }

    async create(data: Record<string, unknown>): Promise<ILesson> {
        const row = await this.baseRepo.create(data);
        return mapLesson(row);
    }

    async update(id: string, data: Record<string, unknown>): Promise<ILesson> {
        const row = await this.baseRepo.update(id, data);
        return mapLesson(row);
    }
}
