import {
    IAssignmentsRepository, IQuestionsRepository,
    IAssignmentQuestionsRepository, IStudentSubmissionsRepository,
    IAssignment, IQuestion, IAssignmentQuestion, IStudentSubmission,
    CreateAssignmentDTO, UpdateAssignmentDTO,
    CreateQuestionDTO, UpdateQuestionDTO, LinkQuestionDTO,
    SubmitAssignmentDTO, GradeSubmissionDTO
} from './assignments.model';
import { NotFoundError, BadRequestError } from '@core/exceptions';
import { IProfilesService } from '@modules/profiles';

export interface IAssignmentsService {
    // Assignments
    getAssignmentsByClass(classId: string): Promise<IAssignment[]>;
    getAssignmentById(id: string): Promise<IAssignment>;
    createAssignment(classId: string, data: CreateAssignmentDTO): Promise<IAssignment>;
    updateAssignment(id: string, data: UpdateAssignmentDTO): Promise<IAssignment>;
    deleteAssignment(id: string): Promise<{ message: string }>;

    // Questions (Bank)
    getQuestionsByTeacher(teacherId: string): Promise<IQuestion[]>;
    getQuestionById(id: string): Promise<IQuestion>;
    createQuestion(teacherId: string, data: CreateQuestionDTO): Promise<IQuestion>;
    updateQuestion(id: string, data: UpdateQuestionDTO): Promise<IQuestion>;

    // Assignment Questions (Bank -> Assignment)
    getAssignmentQuestions(assignmentId: string): Promise<IAssignmentQuestion[]>;
    linkQuestionToAssignment(assignmentId: string, data: LinkQuestionDTO): Promise<IAssignmentQuestion>;
    unlinkQuestion(assignmentId: string, questionId: string): Promise<{ message: string }>;

    // Submissions
    getSubmissions(assignmentId: string): Promise<IStudentSubmission[]>;
    getStudentSubmissions(studentId: string, assignmentId?: string): Promise<IStudentSubmission[]>;
    submitAssignment(assignmentId: string, studentId: string, data: SubmitAssignmentDTO): Promise<IStudentSubmission>;
    gradeSubmission(submissionId: string, data: GradeSubmissionDTO): Promise<IStudentSubmission>;
}

export class AssignmentsService implements IAssignmentsService {
    constructor(
        private assignmentsRepository: IAssignmentsRepository,
        private questionsRepository: IQuestionsRepository,
        private assignmentQuestionsRepository: IAssignmentQuestionsRepository,
        private studentSubmissionsRepository: IStudentSubmissionsRepository,
        private profilesService: IProfilesService
    ) {}

    // ===================== ASSIGNMENTS =====================

    async getAssignmentsByClass(classId: string): Promise<IAssignment[]> {
        return this.assignmentsRepository.findByClassId(classId);
    }

    async getAssignmentById(id: string): Promise<IAssignment> {
        const assignment = await this.assignmentsRepository.findById(id);
        if (!assignment) throw new NotFoundError('Bài tập không tồn tại');
        return assignment;
    }

    async createAssignment(classId: string, data: CreateAssignmentDTO): Promise<IAssignment> {
        return this.assignmentsRepository.create({
            class_id: classId,
            title: data.title,
            description: data.description,
            deadline: data.deadline ? new Date(data.deadline) : null
        });
    }

    async updateAssignment(id: string, data: UpdateAssignmentDTO): Promise<IAssignment> {
        await this.getAssignmentById(id);
        return this.assignmentsRepository.update(id, data as Record<string, unknown>);
    }

    async deleteAssignment(id: string): Promise<{ message: string }> {
        await this.getAssignmentById(id);
        await this.assignmentsRepository.delete(id);
        return { message: 'Đã xóa bài tập' };
    }

    // ===================== QUESTIONS BANK =====================

    async getQuestionsByTeacher(teacherId: string): Promise<IQuestion[]> {
        return this.questionsRepository.findByTeacherId(teacherId);
    }

    async getQuestionById(id: string): Promise<IQuestion> {
        const question = await this.questionsRepository.findById(id);
        if (!question) throw new NotFoundError('Câu hỏi không tồn tại');
        return question;
    }

    async createQuestion(userId: string, data: CreateQuestionDTO): Promise<IQuestion> {
        const teacherProfile = await this.profilesService.getTeacher(userId);
        if (!teacherProfile) throw new BadRequestError('Bạn chưa tạo hồ sơ giáo viên');
        return this.questionsRepository.create({
            teacher_id: teacherProfile.id,
            question_text: data.question_text,
            options: data.options,
            correct_answer: data.correct_answer,
            question_type: data.question_type
        });
    }

    async updateQuestion(id: string, data: UpdateQuestionDTO): Promise<IQuestion> {
        await this.getQuestionById(id);
        return this.questionsRepository.update(id, data as Record<string, unknown>);
    }

    // ===================== ASSIGNMENT QUESTIONS =====================

    async getAssignmentQuestions(assignmentId: string): Promise<IAssignmentQuestion[]> {
        return this.assignmentQuestionsRepository.findByAssignmentId(assignmentId);
    }

    async linkQuestionToAssignment(assignmentId: string, data: LinkQuestionDTO): Promise<IAssignmentQuestion> {
        await this.getAssignmentById(assignmentId);
        await this.getQuestionById(data.question_id);
        return this.assignmentQuestionsRepository.linkQuestion(assignmentId, data.question_id, data.order_index ?? 0);
    }

    async unlinkQuestion(assignmentId: string, questionId: string): Promise<{ message: string }> {
        const unlinked = await this.assignmentQuestionsRepository.unlinkQuestion(assignmentId, questionId);
        if (!unlinked) throw new NotFoundError('Câu hỏi không nằm trong bài tập này');
        return { message: 'Đã gỡ câu hỏi khỏi bài tập' };
    }

    // ===================== SUBMISSIONS =====================

    async getSubmissions(assignmentId: string): Promise<IStudentSubmission[]> {
        return this.studentSubmissionsRepository.findByAssignmentId(assignmentId);
    }

    async getStudentSubmissions(userId: string, assignmentId?: string): Promise<IStudentSubmission[]> {
        const studentProfile = await this.profilesService.getStudent(userId);
        if (!studentProfile) throw new BadRequestError('Bạn chưa tạo hồ sơ học sinh');
        return this.studentSubmissionsRepository.findByStudent(studentProfile.id, assignmentId);
    }

    async submitAssignment(assignmentId: string, userId: string, data: SubmitAssignmentDTO): Promise<IStudentSubmission> {
        await this.getAssignmentById(assignmentId);
        
        const studentProfile = await this.profilesService.getStudent(userId);
        if (!studentProfile) throw new BadRequestError('Bạn chưa tạo hồ sơ học sinh');

        if (!data.submission_data || Object.keys(data.submission_data).length === 0) {
            throw new BadRequestError('Dữ liệu nộp bài không được để trống');
        }
        return this.studentSubmissionsRepository.upsertSubmission(assignmentId, studentProfile.id, data.submission_data);
    }

    async gradeSubmission(submissionId: string, data: GradeSubmissionDTO): Promise<IStudentSubmission> {
        const submission = await this.studentSubmissionsRepository.findById(submissionId);
        if (!submission) throw new NotFoundError('Lượt nộp bài không tồn tại');
        
        return this.studentSubmissionsRepository.gradeSubmission(
            submissionId,
            data.grade,
            data.feedback,
            data.status
        );
    }
}
