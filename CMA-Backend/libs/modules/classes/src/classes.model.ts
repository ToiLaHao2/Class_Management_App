/**
 * Classes Module — TypeScript Interfaces & DTOs
 * Bao gồm: classes, teachers_classes, classes_students, lessons
 * (lesson_logs sẽ được thêm ở Phase 5 cùng schedules)
 */

// ===================== CLASSES =====================

export interface IClass {
    id: string;
    class_category_id?: string;   // UUID → categories (type: class_category)
    owner_id: string;             // UUID → teacher_profiles.id
    name: string;
    description?: string;
    thumbnail_url?: string;
    teaching_model?: string;      // UUID → categories (type: teaching_model)
    price?: number;               // DECIMAL
    payment_category_id?: string; // UUID → categories (type: payment)
    status?: string;              // UUID → categories (type: status)
    created_at: Date;
    updated_at: Date;
}

export interface CreateClassDTO {
    class_category_id?: string;
    owner_id: string;             // teacher_profiles.id — Admin có thể truyền id GV
    name: string;
    description?: string;
    thumbnail_url?: string;
    teaching_model?: string;
    price?: number;
    payment_category_id?: string;
    status?: string;
}

export interface UpdateClassDTO {
    class_category_id?: string;
    name?: string;
    description?: string;
    thumbnail_url?: string;
    teaching_model?: string;
    price?: number;
    payment_category_id?: string;
    status?: string;
}

// ===================== TEACHERS_CLASSES =====================

export interface ITeacherClass {
    id: string;
    teacher_id: string;  // → teacher_profiles.id
    class_id: string;    // → classes.id
    created_at: Date;
    updated_at: Date;
}

export interface AddTeacherToClassDTO {
    teacher_id: string;
}

// ===================== CLASSES_STUDENTS =====================

export interface IClassStudent {
    id: string;
    class_id: string;      // → classes.id
    student_id: string;    // → student_profiles.id
    status?: string;       // UUID → categories (type: status)
    startdate?: Date;
    enddate?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface EnrollStudentDTO {
    student_id: string;
    status?: string;
    startdate?: string;
    enddate?: string;
}

export interface UpdateStudentStatusDTO {
    status: string;
    enddate?: string;
}

// ===================== LESSONS =====================

export interface ILesson {
    id: string;
    class_id: string;     // → classes.id
    teacher_id: string;   // → teacher_profiles.id
    title: string;
    description?: string;
    order_index?: number;
    created_at: Date;
    updated_at: Date;
}

export interface CreateLessonDTO {
    teacher_id?: string;   // Nếu GV đang đăng nhập thì tự lấy
    title: string;
    description?: string;
    order_index?: number;
}

export interface UpdateLessonDTO {
    title?: string;
    description?: string;
    order_index?: number;
}

// ===================== REPOSITORY INTERFACES =====================

export interface IClassesRepository {
    findById(id: string): Promise<IClass | null>;
    findAll(filters?: Record<string, unknown>): Promise<IClass[]>;
    create(data: Record<string, unknown>): Promise<IClass>;
    update(id: string, data: Record<string, unknown>): Promise<IClass>;
}

export interface ITeachersClassesRepository {
    findByClassId(classId: string): Promise<ITeacherClass[]>;
    addTeacher(classId: string, teacherId: string): Promise<ITeacherClass>;
    removeTeacher(classId: string, teacherId: string): Promise<boolean>;
}

export interface IClassesStudentsRepository {
    findByClassId(classId: string): Promise<IClassStudent[]>;
    findByStudentId(studentId: string): Promise<IClassStudent[]>;
    findEnrolledByUserId(userId: string): Promise<any[]>; // Trả về thông tin lớp kèm enrollment
    enroll(data: Record<string, unknown>): Promise<IClassStudent>;
    updateStatus(classId: string, studentId: string, data: Record<string, unknown>): Promise<IClassStudent>;
}

export interface ILessonsRepository {
    findByClassId(classId: string): Promise<ILesson[]>;
    findById(id: string): Promise<ILesson | null>;
    create(data: Record<string, unknown>): Promise<ILesson>;
    update(id: string, data: Record<string, unknown>): Promise<ILesson>;
}
