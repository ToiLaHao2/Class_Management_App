/**
 * Assignments Module — TypeScript Interfaces & DTOs
 */

// ===================== ASSIGNMENTS =====================

export interface IAssignment {
    id: string;
    class_id: string;     // UUID → classes.id
    title: string;
    description?: string;
    deadline?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface CreateAssignmentDTO {
    title: string;
    description?: string;
    deadline?: string;
}

export interface UpdateAssignmentDTO {
    title?: string;
    description?: string;
    deadline?: string;
}

// ===================== QUESTIONS (NGÂN HÀNG TRONG KHO) =====================

export interface IQuestion {
    id: string;
    teacher_id: string;     // Chủ sở hữu câu hỏi (teacher_profiles.id)
    question_text: string;
    options?: Record<string, string>; // { "A": "...", "B": "..." }
    correct_answer?: string; // "A"
    question_type?: string;  // UUID → categories (type: question_type)
    created_at: Date;
    updated_at: Date;
}

export interface CreateQuestionDTO {
    question_text: string;
    options?: Record<string, string>;
    correct_answer?: string;
    question_type?: string;
}

export interface UpdateQuestionDTO {
    question_text?: string;
    options?: Record<string, string>;
    correct_answer?: string;
    question_type?: string;
}

// ===================== ASSIGNMENT_QUESTIONS (BẢNG NỐI) =====================

export interface IAssignmentQuestion {
    id: string;
    assignment_id: string;
    question_id: string;
    order_index: number;
    created_at: Date;
    updated_at: Date;
}

export interface LinkQuestionDTO {
    question_id: string;
    order_index?: number;
}

export interface UpdateQuestionOrderDTO {
    order_index: number;
}

// ===================== STUDENT_SUBMISSIONS =====================

export interface IStudentSubmission {
    id: string;
    assignment_id: string;
    student_id: string;
    grade?: number; // DECIMAL
    status?: string; // UUID → categories (type: submission_status)
    feedback?: string;
    submission_data?: Record<string, any>; // {"answers": {"q1_id": "A", "q2_id": "Text"}, "files": [...]}
    submission_date?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface SubmitAssignmentDTO {
    submission_data: Record<string, any>;
}

export interface GradeSubmissionDTO {
    grade: number;
    feedback?: string;
    status?: string;
}

// ===================== REPOSITORY INTERFACES =====================

export interface IAssignmentsRepository {
    findByClassId(classId: string): Promise<IAssignment[]>;
    findById(id: string): Promise<IAssignment | null>;
    create(data: Record<string, unknown>): Promise<IAssignment>;
    update(id: string, data: Record<string, unknown>): Promise<IAssignment>;
    delete(id: string): Promise<boolean>;
}

export interface IQuestionsRepository {
    findByTeacherId(teacherId: string): Promise<IQuestion[]>;
    findById(id: string): Promise<IQuestion | null>;
    create(data: Record<string, unknown>): Promise<IQuestion>;
    update(id: string, data: Record<string, unknown>): Promise<IQuestion>;
    delete(id: string): Promise<boolean>;
}

export interface IAssignmentQuestionsRepository {
    findByAssignmentId(assignmentId: string): Promise<IAssignmentQuestion[]>;
    linkQuestion(assignmentId: string, questionId: string, orderIndex: number): Promise<IAssignmentQuestion>;
    updateOrder(assignmentId: string, questionId: string, orderIndex: number): Promise<IAssignmentQuestion>;
    unlinkQuestion(assignmentId: string, questionId: string): Promise<boolean>;
}

export interface IStudentSubmissionsRepository {
    findByAssignmentId(assignmentId: string): Promise<IStudentSubmission[]>;
    findByStudent(studentId: string, assignmentId?: string): Promise<IStudentSubmission[]>;
    findById(id: string): Promise<IStudentSubmission | null>;
    upsertSubmission(assignmentId: string, studentId: string, submissionData: Record<string, unknown>): Promise<IStudentSubmission>;
    gradeSubmission(submissionId: string, grade: number, feedback?: string, status?: string): Promise<IStudentSubmission>;
}
