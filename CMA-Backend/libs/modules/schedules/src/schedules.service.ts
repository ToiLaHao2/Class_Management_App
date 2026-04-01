import {
    ISchedulesRepository, ILessonLogsRepository,
    ISchedule, ILessonLog,
    CreateScheduleDTO, UpdateScheduleDTO,
    CreateLessonLogDTO, BulkAttendanceDTO
} from './schedules.model';
import { NotFoundError } from '@core/exceptions';

export interface ISchedulesService {
    // Schedules
    getSchedulesByClass(classId: string): Promise<ISchedule[]>;
    getScheduleById(id: string): Promise<ISchedule>;
    createSchedule(classId: string, data: CreateScheduleDTO): Promise<ISchedule>;
    updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ISchedule>;
    deleteSchedule(id: string): Promise<{ message: string }>;

    // Lesson Logs (Điểm danh)
    getAttendance(scheduleId: string): Promise<ILessonLog[]>;
    markAttendance(scheduleId: string, data: CreateLessonLogDTO): Promise<ILessonLog>;
    bulkMarkAttendance(scheduleId: string, data: BulkAttendanceDTO): Promise<ILessonLog[]>;

}

export class SchedulesService implements ISchedulesService {
    private schedulesRepo: ISchedulesRepository;
    private lessonLogsRepo: ILessonLogsRepository;
    constructor({
        schedulesRepository,
        lessonLogsRepository,
    }: {
        schedulesRepository: ISchedulesRepository;
        lessonLogsRepository: ILessonLogsRepository;
    }) {
        this.schedulesRepo = schedulesRepository;
        this.lessonLogsRepo = lessonLogsRepository;
    }

    // ===================== SCHEDULES =====================

    async getSchedulesByClass(classId: string): Promise<ISchedule[]> {
        return this.schedulesRepo.findByClassId(classId);
    }

    async getScheduleById(id: string): Promise<ISchedule> {
        const schedule = await this.schedulesRepo.findById(id);
        if (!schedule) throw new NotFoundError('Lịch học không tồn tại');
        return schedule;
    }

    async createSchedule(classId: string, data: CreateScheduleDTO): Promise<ISchedule> {
        return this.schedulesRepo.create({
            class_id: classId,
            title: data.title,
            date: new Date(data.date),
            start_time: data.start_time,
            end_time: data.end_time,
            room: data.room,
            status: data.status,
        });
    }

    async updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ISchedule> {
        await this.getScheduleById(id);
        const updateData: Record<string, unknown> = { ...data };
        if (data.date) updateData.date = new Date(data.date);
        return this.schedulesRepo.update(id, updateData);
    }

    async deleteSchedule(id: string): Promise<{ message: string }> {
        await this.getScheduleById(id);
        await this.schedulesRepo.delete(id);
        return { message: 'Đã xóa lịch học' };
    }

    // ===================== LESSON LOGS (ĐIỂM DANH) =====================

    async getAttendance(scheduleId: string): Promise<ILessonLog[]> {
        return this.lessonLogsRepo.findByScheduleId(scheduleId);
    }

    async markAttendance(scheduleId: string, data: CreateLessonLogDTO): Promise<ILessonLog> {
        await this.getScheduleById(scheduleId);
        return this.lessonLogsRepo.upsertLog(
            scheduleId,
            data.student_id,
            data.attendance_status,
            data.student_comment
        );
    }

    async bulkMarkAttendance(scheduleId: string, data: BulkAttendanceDTO): Promise<ILessonLog[]> {
        await this.getScheduleById(scheduleId);
        return this.lessonLogsRepo.bulkUpsert(scheduleId, data.logs);
    }

}
