import { BasePostgresRepository, IDatabaseAdapter } from '@core/database';
import { Pool } from 'pg';
import {
    ISchedulesRepository, ILessonLogsRepository,
    ISchedule, ILessonLog
} from '../schedules.model';

// --- Mappers ---
function mapSchedule(row: any): ISchedule {
    return {
        id: row.id,
        class_id: row.class_id,
        title: row.title,
        date: new Date(row.date),
        start_time: row.start_time ?? undefined,
        end_time: row.end_time ?? undefined,
        room: row.room ?? undefined,
        status: row.status ?? undefined,
        content_summary: row.content_summary ?? undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

function mapLessonLog(row: any): ILessonLog {
    return {
        id: row.id,
        schedule_id: row.schedule_id,
        student_id: row.student_id,
        attendance_status: row.attendance_status,
        student_comment: row.student_comment ?? undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}


// ===================== SCHEDULES REPO =====================

export class PostgresSchedulesRepository implements ISchedulesRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'schedules');
    }

    async findByClassId(classId: string): Promise<ISchedule[]> {
        const rows = await this.baseRepo.findWhere({ class_id: classId });
        return rows.map(mapSchedule);
    }
    async findById(id: string): Promise<ISchedule | null> {
        const row = await this.baseRepo.findById(id);
        return row ? mapSchedule(row) : null;
    }
    async create(data: Record<string, unknown>): Promise<ISchedule> {
        return mapSchedule(await this.baseRepo.create(data));
    }
    async update(id: string, data: Record<string, unknown>): Promise<ISchedule> {
        return mapSchedule(await this.baseRepo.update(id, data));
    }
    async delete(id: string): Promise<boolean> {
        return this.baseRepo.delete(id);
    }
}

// ===================== LESSON_LOGS REPO =====================

export class PostgresLessonLogsRepository implements ILessonLogsRepository {
    private pool: Pool;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.pool = db.getDB() as Pool;
    }

    async findByScheduleId(scheduleId: string): Promise<ILessonLog[]> {
        const res = await this.pool.query(
            `SELECT * FROM lesson_logs WHERE schedule_id = $1 ORDER BY created_at`,
            [scheduleId]
        );
        return res.rows.map(mapLessonLog);
    }

    async upsertLog(scheduleId: string, studentId: string, status: boolean, comment?: string): Promise<ILessonLog> {
        const res = await this.pool.query(
            `INSERT INTO lesson_logs (schedule_id, student_id, attendance_status, student_comment)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (schedule_id, student_id) DO UPDATE SET
                 attendance_status = EXCLUDED.attendance_status,
                 student_comment = EXCLUDED.student_comment,
                 updated_at = NOW()
             RETURNING *`,
            [scheduleId, studentId, status, comment ?? null]
        );
        return mapLessonLog(res.rows[0]);
    }

    async bulkUpsert(scheduleId: string, logs: { student_id: string; attendance_status: boolean; student_comment?: string }[]): Promise<ILessonLog[]> {
        if (logs.length === 0) return [];

        // Build bulk VALUES clause: ($1,$2,$3,$4), ($5,$6,$7,$8), ...
        const values: any[] = [];
        const placeholders: string[] = [];

        logs.forEach((log, i) => {
            const offset = i * 4;
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
            values.push(scheduleId, log.student_id, log.attendance_status, log.student_comment ?? null);
        });

        const res = await this.pool.query(
            `INSERT INTO lesson_logs (schedule_id, student_id, attendance_status, student_comment)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT (schedule_id, student_id) DO UPDATE SET
                 attendance_status = EXCLUDED.attendance_status,
                 student_comment = EXCLUDED.student_comment,
                 updated_at = NOW()
             RETURNING *`,
            values
        );
        return res.rows.map(mapLessonLog);
    }
}

