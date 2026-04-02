import {
    IClassesRepository, ITeachersClassesRepository,
    IClassesStudentsRepository, ILessonsRepository,
    IClass, ITeacherClass, IClassStudent, ILesson,
    CreateClassDTO, UpdateClassDTO,
    AddTeacherToClassDTO,
    EnrollStudentDTO, UpdateStudentStatusDTO,
    CreateLessonDTO, UpdateLessonDTO,
} from './classes.model';
import { NotFoundError, BadRequestError } from '@core/exceptions';

export interface IClassesService {
    // Classes
    getClassById(id: string): Promise<IClass | null>;
    getAllClasses(filters?: Record<string, unknown>): Promise<IClass[]>;
    createClass(data: CreateClassDTO): Promise<IClass>;
    updateClass(id: string, data: UpdateClassDTO): Promise<IClass>;

    // Teachers in class
    getTeachersInClass(classId: string): Promise<ITeacherClass[]>;
    addTeacherToClass(classId: string, data: AddTeacherToClassDTO): Promise<ITeacherClass>;
    removeTeacherFromClass(classId: string, teacherId: string): Promise<{ message: string }>;

    // Students in class
    getStudentsInClass(classId: string): Promise<IClassStudent[]>;
    getClassesByStudent(studentId: string): Promise<IClassStudent[]>;
    enrollStudent(classId: string, data: EnrollStudentDTO): Promise<IClassStudent>;
    updateStudentStatus(classId: string, studentId: string, data: UpdateStudentStatusDTO): Promise<IClassStudent>;

    // Lessons
    getLessons(classId: string): Promise<ILesson[]>;
    createLesson(classId: string, data: CreateLessonDTO): Promise<ILesson>;
    updateLesson(lessonId: string, data: UpdateLessonDTO): Promise<ILesson>;
}

export class ClassesService implements IClassesService {
    private classesRepo: IClassesRepository;
    private teachersClassesRepo: ITeachersClassesRepository;
    private classesStudentsRepo: IClassesStudentsRepository;
    private lessonsRepo: ILessonsRepository;

    constructor({
        classesRepository,
        teachersClassesRepository,
        classesStudentsRepository,
        lessonsRepository,
    }: {
        classesRepository: IClassesRepository;
        teachersClassesRepository: ITeachersClassesRepository;
        classesStudentsRepository: IClassesStudentsRepository;
        lessonsRepository: ILessonsRepository;
    }) {
        this.classesRepo = classesRepository;
        this.teachersClassesRepo = teachersClassesRepository;
        this.classesStudentsRepo = classesStudentsRepository;
        this.lessonsRepo = lessonsRepository;
    }

    // ===================== CLASSES =====================

    async getClassById(id: string): Promise<IClass | null> {
        return this.classesRepo.findById(id);
    }

    async getAllClasses(filters?: Record<string, unknown>): Promise<IClass[]> {
        return this.classesRepo.findAll(filters);
    }

    async createClass(data: CreateClassDTO): Promise<IClass> {
        if (!data.owner_id) {
            throw new BadRequestError('owner_id (teacher_profiles.id) là bắt buộc');
        }

        const newClass = await this.classesRepo.create(data as unknown as Record<string, unknown>);

        // Tự động thêm owner vào danh sách teachers_classes
        await this.teachersClassesRepo.addTeacher(newClass.id, data.owner_id);

        return newClass;
    }

    async updateClass(id: string, data: UpdateClassDTO): Promise<IClass> {
        const existing = await this.classesRepo.findById(id);
        if (!existing) throw new NotFoundError('Lớp học không tồn tại');
        return this.classesRepo.update(id, data as unknown as Record<string, unknown>);
    }

    // ===================== TEACHERS IN CLASS =====================

    async getTeachersInClass(classId: string): Promise<ITeacherClass[]> {
        return this.teachersClassesRepo.findByClassId(classId);
    }

    async addTeacherToClass(classId: string, data: AddTeacherToClassDTO): Promise<ITeacherClass> {
        const existingClass = await this.classesRepo.findById(classId);
        if (!existingClass) throw new NotFoundError('Lớp học không tồn tại');
        return this.teachersClassesRepo.addTeacher(classId, data.teacher_id);
    }

    async removeTeacherFromClass(classId: string, teacherId: string): Promise<{ message: string }> {
        // Không cho phép xóa owner
        const existing = await this.classesRepo.findById(classId);
        if (!existing) throw new NotFoundError('Lớp học không tồn tại');
        if (existing.owner_id === teacherId) {
            throw new BadRequestError('Không thể xóa chủ sở hữu lớp khỏi danh sách giáo viên');
        }

        const removed = await this.teachersClassesRepo.removeTeacher(classId, teacherId);
        if (!removed) throw new NotFoundError('Giáo viên không có trong lớp này');
        return { message: 'Đã xóa giáo viên khỏi lớp' };
    }

    // ===================== STUDENTS IN CLASS =====================

    async getStudentsInClass(classId: string): Promise<IClassStudent[]> {
        return this.classesStudentsRepo.findByClassId(classId);
    }

    async getClassesByStudent(userId: string): Promise<any[]> {
        return this.classesStudentsRepo.findEnrolledByUserId(userId);
    }

    async enrollStudent(classId: string, data: EnrollStudentDTO): Promise<IClassStudent> {
        const existing = await this.classesRepo.findById(classId);
        if (!existing) throw new NotFoundError('Lớp học không tồn tại');

        return this.classesStudentsRepo.enroll({
            class_id: classId,
            student_id: data.student_id,
            status: data.status,
            startdate: data.startdate ? new Date(data.startdate) : null,
            enddate: data.enddate ? new Date(data.enddate) : null,
        });
    }

    async updateStudentStatus(classId: string, studentId: string, data: UpdateStudentStatusDTO): Promise<IClassStudent> {
        return this.classesStudentsRepo.updateStatus(classId, studentId, {
            status: data.status,
            enddate: data.enddate ? new Date(data.enddate) : null,
        });
    }

    // ===================== LESSONS =====================

    async getLessons(classId: string): Promise<ILesson[]> {
        return this.lessonsRepo.findByClassId(classId);
    }

    async createLesson(classId: string, data: CreateLessonDTO): Promise<ILesson> {
        const existing = await this.classesRepo.findById(classId);
        if (!existing) throw new NotFoundError('Lớp học không tồn tại');

        // Nếu không truyền teacher_id thì mặc định dùng owner
        const teacherId = data.teacher_id || existing.owner_id;

        return this.lessonsRepo.create({
            class_id: classId,
            teacher_id: teacherId,
            title: data.title,
            description: data.description,
            order_index: data.order_index ?? 0,
        });
    }

    async updateLesson(lessonId: string, data: UpdateLessonDTO): Promise<ILesson> {
        const existing = await this.lessonsRepo.findById(lessonId);
        if (!existing) throw new NotFoundError('Bài giảng không tồn tại');
        return this.lessonsRepo.update(lessonId, data as unknown as Record<string, unknown>);
    }
}
