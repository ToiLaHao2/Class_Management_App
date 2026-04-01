/**
 * Schedules Module — TypeScript Interfaces & DTOs
 * Bao gồm: schedules, lesson_logs, attachments
 */

// ===================== SCHEDULES =====================

export interface ISchedule {
    id: string;
    class_id: string;          // → classes.id
    title: string;
    date: Date;
    start_time?: string;       // "18:00"
    end_time?: string;         // "19:30"
    room?: string;             // Phòng học / Link Zoom
    status?: string;           // UUID → categories (Sắp tới, Đã học, Đã hủy)
    content_summary?: string;  // GV ghi chú nội dung buổi học
    created_at: Date;
    updated_at: Date;
}

export interface CreateScheduleDTO {
    title: string;
    date: string;              // ISO string
    start_time?: string;
    end_time?: string;
    room?: string;
    status?: string;
}

export interface UpdateScheduleDTO {
    title?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    room?: string;
    status?: string;
    content_summary?: string;
}

// ===================== LESSON_LOGS (Điểm danh từng HS) =====================

export interface ILessonLog {
    id: string;
    schedule_id: string;       // → schedules.id
    student_id: string;        // → student_profiles.id
    attendance_status: boolean;
    student_comment?: string;  // Nhận xét riêng cho HS này
    created_at: Date;
    updated_at: Date;
}

export interface CreateLessonLogDTO {
    student_id: string;
    attendance_status: boolean;
    student_comment?: string;
}

// Bulk: GV điểm danh cả lớp 1 lượt
export interface BulkAttendanceDTO {
    logs: CreateLessonLogDTO[];
}

export interface ISchedulesRepository {
    findByClassId(classId: string): Promise<ISchedule[]>;
    findById(id: string): Promise<ISchedule | null>;
    create(data: Record<string, unknown>): Promise<ISchedule>;
    update(id: string, data: Record<string, unknown>): Promise<ISchedule>;
    delete(id: string): Promise<boolean>;
}

export interface ILessonLogsRepository {
    findByScheduleId(scheduleId: string): Promise<ILessonLog[]>;
    upsertLog(scheduleId: string, studentId: string, status: boolean, comment?: string): Promise<ILessonLog>;
    bulkUpsert(scheduleId: string, logs: { student_id: string; attendance_status: boolean; student_comment?: string }[]): Promise<ILessonLog[]>;
}
