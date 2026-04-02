import 'reflect-metadata';
import {
    Controller, Get, Post, Put, Delete,
    Route, Path, Body, Query, Tags, Security, SuccessResponse, Request,
} from '@tsoa/runtime';
import { IClassesService } from './classes.service';
import type {
    IClass, ITeacherClass, IClassStudent, ILesson,
    CreateClassDTO, UpdateClassDTO,
    AddTeacherToClassDTO,
    EnrollStudentDTO, UpdateStudentStatusDTO,
    CreateLessonDTO, UpdateLessonDTO,
} from './classes.model';

@Route('classes')
@Tags('Classes')
export class ClassesController extends Controller {
    private readonly classesService: IClassesService;

    constructor({ classesService }: { classesService: IClassesService }) {
        super();
        this.classesService = classesService;
    }

    // ===================== CLASSES CRUD =====================

    /**
     * Lấy danh sách tất cả lớp học (có thể filter theo owner_id, class_category_id)
     */
    @Security('jwt')
    @Get('/')
    public async getClasses(
        @Query() owner_id?: string,
        @Query() class_category_id?: string,
    ): Promise<IClass[]> {
        const filters: Record<string, unknown> = {};
        if (owner_id) filters.owner_id = owner_id;
        if (class_category_id) filters.class_category_id = class_category_id;
        return this.classesService.getAllClasses(
            Object.keys(filters).length > 0 ? filters : undefined
        );
    }

    /**
     * Lấy danh sách các lớp học mà Học sinh hiện tại đang tham gia (Role: Student)
     */
    @Security('jwt', ['student'])
    @Get('enrolled')
    public async getEnrolledClasses(@Request() req: any): Promise<any[]> {
        const userId = req.user.userId;
        // Logic: Tìm student_profile -> Lấy danh sách lớp
        // Để nhanh gọn, tôi sẽ xử lý thông qua Service
        return this.classesService.getClassesByStudent(userId); 
    }

    /**
     * Lấy chi tiết một lớp học
     */
    @Security('jwt')
    @Get('{classId}')
    public async getClass(@Path() classId: string): Promise<IClass | null> {
        return this.classesService.getClassById(classId);
    }

    /**
     * Tạo lớp học mới (Teacher hoặc Admin tạo hộ)
     */
    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createClass(@Body() body: CreateClassDTO): Promise<IClass> {
        this.setStatus(201);
        return this.classesService.createClass(body);
    }

    /**
     * Cập nhật thông tin lớp học
     */
    @Security('jwt', ['teacher', 'admin'])
    @Put('{classId}')
    public async updateClass(@Path() classId: string, @Body() body: UpdateClassDTO): Promise<IClass> {
        return this.classesService.updateClass(classId, body);
    }

    // ===================== TEACHERS IN CLASS =====================

    /**
     * Danh sách giáo viên trong lớp
     */
    @Security('jwt')
    @Get('{classId}/teachers')
    public async getTeachersInClass(@Path() classId: string): Promise<ITeacherClass[]> {
        return this.classesService.getTeachersInClass(classId);
    }

    /**
     * Thêm trợ giảng vào lớp
     */
    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('{classId}/teachers')
    public async addTeacher(@Path() classId: string, @Body() body: AddTeacherToClassDTO): Promise<ITeacherClass> {
        this.setStatus(201);
        return this.classesService.addTeacherToClass(classId, body);
    }

    /**
     * Xóa trợ giảng khỏi lớp
     */
    @Security('jwt', ['teacher', 'admin'])
    @Delete('{classId}/teachers/{teacherId}')
    public async removeTeacher(
        @Path() classId: string,
        @Path() teacherId: string,
    ): Promise<{ message: string }> {
        return this.classesService.removeTeacherFromClass(classId, teacherId);
    }

    // ===================== STUDENTS IN CLASS =====================

    /**
     * Danh sách học sinh trong lớp
     */
    @Security('jwt', ['teacher', 'admin'])
    @Get('{classId}/students')
    public async getStudents(@Path() classId: string): Promise<IClassStudent[]> {
        return this.classesService.getStudentsInClass(classId);
    }

    /**
     * Đăng ký / Thêm học sinh vào lớp
     */
    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('{classId}/enroll')
    public async enrollStudent(@Path() classId: string, @Body() body: EnrollStudentDTO): Promise<IClassStudent> {
        this.setStatus(201);
        return this.classesService.enrollStudent(classId, body);
    }

    /**
     * Cập nhật trạng thái học sinh (Nghỉ, Tốt nghiệp...)
     */
    @Security('jwt', ['teacher', 'admin'])
    @Put('{classId}/students/{studentId}/status')
    public async updateStudentStatus(
        @Path() classId: string,
        @Path() studentId: string,
        @Body() body: UpdateStudentStatusDTO,
    ): Promise<IClassStudent> {
        return this.classesService.updateStudentStatus(classId, studentId, body);
    }
}

// ===================== LESSONS CONTROLLER (tách route riêng) =====================

@Route('classes')
@Tags('Lessons')
export class LessonsController extends Controller {
    private readonly classesService: IClassesService;

    constructor({ classesService }: { classesService: IClassesService }) {
        super();
        this.classesService = classesService;
    }

    /**
     * Danh sách bài giảng trong lớp
     */
    @Security('jwt')
    @Get('{classId}/lessons')
    public async getLessons(@Path() classId: string): Promise<ILesson[]> {
        return this.classesService.getLessons(classId);
    }

    /**
     * Tạo bài giảng mới
     */
    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('{classId}/lessons')
    public async createLesson(@Path() classId: string, @Body() body: CreateLessonDTO): Promise<ILesson> {
        this.setStatus(201);
        return this.classesService.createLesson(classId, body);
    }
}

// Lessons Update cần route /lessons/:id nên tách controller riêng
@Route('lessons')
@Tags('Lessons')
export class LessonsUpdateController extends Controller {
    private readonly classesService: IClassesService;

    constructor({ classesService }: { classesService: IClassesService }) {
        super();
        this.classesService = classesService;
    }

    /**
     * Cập nhật bài giảng
     */
    @Security('jwt', ['teacher', 'admin'])
    @Put('{lessonId}')
    public async updateLesson(@Path() lessonId: string, @Body() body: UpdateLessonDTO): Promise<ILesson> {
        return this.classesService.updateLesson(lessonId, body);
    }
}
