import {
    Controller, Get, Post, Put, Delete,
    Route, Path, Body, Tags, Security, SuccessResponse, Request
} from '@tsoa/runtime';
import { IAssignmentsService } from './assignments.service';
import {
    IAssignment, IQuestion, IAssignmentQuestion, IStudentSubmission,
    CreateAssignmentDTO, UpdateAssignmentDTO,
    CreateQuestionDTO, UpdateQuestionDTO, LinkQuestionDTO,
    SubmitAssignmentDTO, GradeSubmissionDTO
} from './assignments.model';

// --- Types ---
interface RequestWithUser {
    user: { id: string, role: string };
}

@Route('classes/{classId}/assignments')
@Tags('Assignments')
export class ClassAssignmentsController extends Controller {
    constructor(private readonly assignmentsService: IAssignmentsService) { super(); }

    @Security('jwt')
    @Get('/')
    public async getAssignments(@Path() classId: string): Promise<IAssignment[]> {
        return this.assignmentsService.getAssignmentsByClass(classId);
    }

    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createAssignment(@Path() classId: string, @Body() body: CreateAssignmentDTO): Promise<IAssignment> {
        this.setStatus(201);
        return this.assignmentsService.createAssignment(classId, body);
    }
}

@Route('assignments')
@Tags('Assignments')
export class AssignmentsController extends Controller {
    constructor(private readonly assignmentsService: IAssignmentsService) { super(); }

    @Security('jwt')
    @Get('{id}')
    public async getAssignment(@Path() id: string): Promise<IAssignment> {
        return this.assignmentsService.getAssignmentById(id);
    }

    @Security('jwt', ['teacher', 'admin'])
    @Put('{id}')
    public async updateAssignment(@Path() id: string, @Body() body: UpdateAssignmentDTO): Promise<IAssignment> {
        return this.assignmentsService.updateAssignment(id, body);
    }

    @Security('jwt', ['teacher', 'admin'])
    @Delete('{id}')
    public async deleteAssignment(@Path() id: string): Promise<{ message: string }> {
        return this.assignmentsService.deleteAssignment(id);
    }

    // --- ASSIGNMENT QUESTIONS ---

    @Security('jwt')
    @Get('{id}/questions')
    public async getAssignmentQuestions(@Path() id: string): Promise<IAssignmentQuestion[]> {
        return this.assignmentsService.getAssignmentQuestions(id);
    }

    @Security('jwt', ['teacher', 'admin'])
    @Post('{id}/questions')
    public async linkQuestion(@Path() id: string, @Body() body: LinkQuestionDTO): Promise<IAssignmentQuestion> {
        return this.assignmentsService.linkQuestionToAssignment(id, body);
    }

    @Security('jwt', ['teacher', 'admin'])
    @Delete('{id}/questions/{questionId}')
    public async unlinkQuestion(@Path() id: string, @Path() questionId: string): Promise<{ message: string }> {
        return this.assignmentsService.unlinkQuestion(id, questionId);
    }

    // --- SUBMISSIONS ---

    @Security('jwt', ['teacher', 'admin'])
    @Get('{id}/submissions')
    public async getSubmissions(@Path() id: string): Promise<IStudentSubmission[]> {
        return this.assignmentsService.getSubmissions(id);
    }

    @Security('jwt', ['student'])
    @SuccessResponse('201', 'Submitted')
    @Post('{id}/submissions')
    public async submitAssignment(
        @Path() id: string,
        @Request() req: RequestWithUser,
        @Body() body: SubmitAssignmentDTO
    ): Promise<IStudentSubmission> {
        this.setStatus(201);
        // FIXME: Ở thực tế, student_id trong JWT chính là user_id, 
        // nhưng model sinh ra đòi student_profiles.id. Để test đơn giản, tạm nhập bằng API.
        // TSOA chỉ mock jwt token cho demo này.
        // Tạm mượn user.id (coi như là student_profile.id - cần map ở service thực tế)
        return this.assignmentsService.submitAssignment(id, req.user.id, body);
    }
}

@Route('questions')
@Tags('Questions Bank')
export class QuestionsController extends Controller {
    constructor(private readonly assignmentsService: IAssignmentsService) { super(); }

    @Security('jwt', ['teacher', 'admin'])
    @Get('mine')
    public async getMyQuestions(@Request() req: RequestWithUser): Promise<IQuestion[]> {
        // req.user.id là user_id, cần lấy được teacher_profile_id. 
        // Ở đây đơn giản hóa truy vấn theo user.id hoặc client tự gửi logic qua service
        return this.assignmentsService.getQuestionsByTeacher(req.user.id);
    }

    @Security('jwt', ['teacher', 'admin'])
    @Get('{id}')
    public async getQuestion(@Path() id: string): Promise<IQuestion> {
        return this.assignmentsService.getQuestionById(id);
    }

    @Security('jwt', ['teacher', 'admin'])
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createQuestion(@Request() req: RequestWithUser, @Body() body: CreateQuestionDTO): Promise<IQuestion> {
        this.setStatus(201);
        return this.assignmentsService.createQuestion(req.user.id, body);
    }

    @Security('jwt', ['teacher', 'admin'])
    @Put('{id}')
    public async updateQuestion(@Path() id: string, @Body() body: UpdateQuestionDTO): Promise<IQuestion> {
        return this.assignmentsService.updateQuestion(id, body);
    }
}

@Route('submissions')
@Tags('Submissions Grading')
export class SubmissionsController extends Controller {
    constructor(private readonly assignmentsService: IAssignmentsService) { super(); }

    @Security('jwt', ['teacher', 'admin'])
    @Put('{id}/grade')
    public async gradeSubmission(@Path() id: string, @Body() body: GradeSubmissionDTO): Promise<IStudentSubmission> {
        return this.assignmentsService.gradeSubmission(id, body);
    }
}
