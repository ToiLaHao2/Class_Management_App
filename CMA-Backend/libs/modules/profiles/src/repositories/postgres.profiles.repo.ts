import { BasePostgresRepository, IDatabaseAdapter } from '@core/database';
import { Pool } from 'pg';
import {
    IProfilesRepository,
    ITeacherProfile,
    IParentProfile,
    IStudentProfile,
    UpsertTeacherProfileDTO,
    UpsertParentProfileDTO,
    UpsertStudentProfileDTO
} from '../profiles.model';

export class PostgresProfilesRepository implements IProfilesRepository {
    private pool: Pool;
    private teacherRepo: BasePostgresRepository;
    private parentRepo: BasePostgresRepository;
    private studentRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        const pool = db.getDB() as Pool;
        if (!pool) throw new Error('PostgreSQL Pool is required');
        this.pool = pool;

        this.teacherRepo = new BasePostgresRepository(db, 'teacher_profiles');
        this.parentRepo = new BasePostgresRepository(db, 'parent_profiles');
        this.studentRepo = new BasePostgresRepository(db, 'student_profiles');
    }

    // --- MAPPERS ---
    private mapTeacher(row: any): ITeacherProfile {
        return {
            id: row.id,
            user_id: row.user_id,
            bio: row.bio ?? undefined,
            subjects: row.subjects ?? undefined,
            experience: row.experience ?? undefined,
            is_verified: row.is_verified,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    private mapParent(row: any): IParentProfile {
        return {
            id: row.id,
            user_id: row.user_id,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    private mapStudent(row: any): IStudentProfile {
        return {
            id: row.id,
            user_id: row.user_id,
            parent_id: row.parent_id ?? undefined,
            school: row.school ?? undefined,
            grade: row.grade ?? undefined,
            academic_level: row.academic_level ?? undefined,
            learning_goal: row.learning_goal ?? undefined,
            health_notes: row.health_notes ?? undefined,
            nickname: row.nickname ?? undefined,
            special_notes: row.special_notes ?? undefined,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    // --- TEACHER ---
    async getTeacher(userId: string): Promise<ITeacherProfile | null> {
        const rows = await this.teacherRepo.findWhere({ user_id: userId });
        return rows.length > 0 ? this.mapTeacher(rows[0]) : null;
    }

    async upsertTeacher(userId: string, data: { bio?: string, subjects?: string, experience?: string }): Promise<ITeacherProfile> {
        const query = `
            INSERT INTO teacher_profiles (user_id, bio, subjects, experience, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                bio = EXCLUDED.bio,
                subjects = EXCLUDED.subjects,
                experience = EXCLUDED.experience,
                updated_at = NOW()
            RETURNING *;
        `;
        const values = [userId, data.bio, data.subjects, data.experience];
        const result = await this.pool.query(query, values);
        return this.mapTeacher(result.rows[0]);
    }

    // --- PARENT ---
    async getParent(userId: string): Promise<IParentProfile | null> {
        const rows = await this.parentRepo.findWhere({ user_id: userId });
        return rows.length > 0 ? this.mapParent(rows[0]) : null;
    }

    async upsertParent(userId: string, _data?: UpsertParentProfileDTO): Promise<IParentProfile> {
        const query = `
            INSERT INTO parent_profiles (user_id, updated_at)
            VALUES ($1, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                updated_at = NOW()
            RETURNING *;
        `;
        const result = await this.pool.query(query, [userId]);
        return this.mapParent(result.rows[0]);
    }

    // --- STUDENT ---
    async getStudent(userId: string): Promise<IStudentProfile | null> {
        const rows = await this.studentRepo.findWhere({ user_id: userId });
        return rows.length > 0 ? this.mapStudent(rows[0]) : null;
    }

    async upsertStudent(userId: string, data: UpsertStudentProfileDTO): Promise<IStudentProfile> {
        const query = `
            INSERT INTO student_profiles (user_id, parent_id, school, grade, academic_level, learning_goal, health_notes, nickname, special_notes, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                parent_id = EXCLUDED.parent_id,
                school = EXCLUDED.school,
                grade = EXCLUDED.grade,
                academic_level = EXCLUDED.academic_level,
                learning_goal = EXCLUDED.learning_goal,
                health_notes = EXCLUDED.health_notes,
                nickname = EXCLUDED.nickname,
                special_notes = EXCLUDED.special_notes,
                updated_at = NOW()
            RETURNING *;
        `;
        const values = [
            userId, data.parent_id, data.school, data.grade, data.academic_level,
            data.learning_goal, data.health_notes, data.nickname, data.special_notes
        ];
        const result = await this.pool.query(query, values);
        return this.mapStudent(result.rows[0]);
    }

    // --- UTILITIES ---
    async linkStudentToParent(studentId: string, parentId: string): Promise<boolean> {
        const query = `
            UPDATE student_profiles
            SET parent_id = $2, updated_at = NOW()
            WHERE user_id = $1
            RETURNING *;
        `;
        const result = await this.pool.query(query, [studentId, parentId]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}
