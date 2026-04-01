import {
    Controller, Get, Post, Put, Delete,
    Route, Path, Body, Query, Tags, Security, SuccessResponse, Request
} from '@tsoa/runtime';
import { ISchedulesService } from './schedules.service';
import {
    ISchedule, ILessonLog, IAttachment,
    CreateScheduleDTO, UpdateScheduleDTO,
    CreateLessonLogDTO, BulkAttendanceDTO,
    CreateAttachmentDTO
} from './schedules.model';

interface RequestWithUser {
    user: { id: string; role: string };
}

// ===================== SCHEDULES =====================

@Route('classes/{classId}/schedules')
@Tags('Schedules')
export class ClassSchedulesController extends Controller {
    private readonly schedulesService: ISchedulesService;

    constructor({ schedulesService }: { schedulesService: ISchedulesService }) {
        super();
        this.schedulesService = schedulesService;
    }

    /** Lấy toàn bộ lịch dạy của lớp */
    @Security('jwt')
    @Get('/')
    public async getSchedules(@Path() classId: string): Promise<ISchedule[]> {
        return this.schedulesService.getSchedulesByClass(classId);
    }

    /** Tạo lịch dạy mới */
    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createSchedule(@Path() classId: string, @Body() body: CreateScheduleDTO): Promise<ISchedule> {
        this.setStatus(201);
        return this.schedulesService.createSchedule(classId, body);
    }
}

@Route('schedules')
@Tags('Schedules')
export class SchedulesController extends Controller {
    private readonly schedulesService: ISchedulesService;

    constructor({ schedulesService }: { schedulesService: ISchedulesService }) {
        super();
        this.schedulesService = schedulesService;
    }

    /** Xem chi tiết lịch */
    @Security('jwt')
    @Get('{id}')
    public async getSchedule(@Path() id: string): Promise<ISchedule> {
        return this.schedulesService.getScheduleById(id);
    }

    /** Cập nhật lịch (đổi giờ, phòng, nội dung buổi học) */
    @Security('jwt', ['teacher', 'admin'])
    @Put('{id}')
    public async updateSchedule(@Path() id: string, @Body() body: UpdateScheduleDTO): Promise<ISchedule> {
        return this.schedulesService.updateSchedule(id, body);
    }

    /** Xóa lịch */
    @Security('jwt', ['teacher', 'admin'])
    @Delete('{id}')
    public async deleteSchedule(@Path() id: string): Promise<{ message: string }> {
        return this.schedulesService.deleteSchedule(id);
    }

    // --- ĐIỂM DANH (Lesson Logs) ---

    /** Lấy danh sách điểm danh của buổi học */
    @Security('jwt', ['teacher', 'admin'])
    @Get('{id}/attendance')
    public async getAttendance(@Path() id: string): Promise<ILessonLog[]> {
        return this.schedulesService.getAttendance(id);
    }

    /** Điểm danh 1 học sinh */
    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('{id}/attendance')
    public async markAttendance(@Path() id: string, @Body() body: CreateLessonLogDTO): Promise<ILessonLog> {
        this.setStatus(201);
        return this.schedulesService.markAttendance(id, body);
    }

    /** Điểm danh hàng loạt cả lớp (Bulk) — Dành cho gia sư dạy tại chỗ */
    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('{id}/attendance/bulk')
    public async bulkAttendance(@Path() id: string, @Body() body: BulkAttendanceDTO): Promise<ILessonLog[]> {
        this.setStatus(201);
        return this.schedulesService.bulkMarkAttendance(id, body);
    }
}

// ===================== ATTACHMENTS (Dùng chung) =====================

@Route('attachments')
@Tags('Attachments')
export class AttachmentsController extends Controller {
    private readonly schedulesService: ISchedulesService;

    constructor({ schedulesService }: { schedulesService: ISchedulesService }) {
        super();
        this.schedulesService = schedulesService;
    }

    /** Lấy tệp đính kèm theo loại và ID gốc */
    @Security('jwt')
    @Get('/')
    public async getAttachments(
        @Query() ref_type: string,
        @Query() ref_id: string,
    ): Promise<IAttachment[]> {
        return this.schedulesService.getAttachments(ref_type, ref_id);
    }

    /** Upload/Đăng ký tệp đính kèm mới */
    @Security('jwt')
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async addAttachment(
        @Request() req: RequestWithUser,
        @Body() body: CreateAttachmentDTO,
    ): Promise<IAttachment> {
        this.setStatus(201);
        return this.schedulesService.addAttachment(req.user.id, body);
    }

    /** Xóa tệp đính kèm */
    @Security('jwt')
    @Delete('{id}')
    public async removeAttachment(@Path() id: string): Promise<{ message: string }> {
        return this.schedulesService.removeAttachment(id);
    }
}
