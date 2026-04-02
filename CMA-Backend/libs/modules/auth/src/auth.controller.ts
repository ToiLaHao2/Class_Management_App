import { Controller, Post, Body, Route, Tags, Response, Security, Request, Get, Put } from '@tsoa/runtime';
import { IAuthService } from './auth.service';
import { IUsersService, LoginDTO, CreateUserDTO, IUser, UpdateUserDTO } from '@modules/users';
import { ValidateError } from '@tsoa/runtime';
import { UnauthorizedError } from '@core/exceptions';

interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}

interface UpdateProfileDTO {
    username?: string;
    avatar_url?: string;
}

interface RegisterChildDTO {
    username: string;
    full_name: string;
}

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
    private readonly authService: IAuthService;
    private readonly usersService: IUsersService;

    constructor({ authService, usersService }: { authService: IAuthService, usersService: IUsersService }) {
        super();
        this.authService = authService;
        this.usersService = usersService;
    }

    /**
     * Xác thực thông tin người dùng và sinh chuỗi Token truy cập.
     */
    @Post('login')
    @Response<ValidateError>(422, 'Validation Failed')
    @Response(401, 'Unauthorized')
    public async login(@Body() body: LoginDTO) {
        return this.authService.login(body);
    }

    /**
     * Đăng kí tài khoản mới vào hệ thống.
     */
    @Post('register')
    @Response<ValidateError>(422, 'Validation Failed')
    @Response(400, 'Bad Request - Email Exists')
    public async register(@Body() body: CreateUserDTO) {
        const user = await this.authService.register(body);
        this.setStatus(201);
        return {
            message: "Đăng ký tài khoản thành công",
            user
        };
    }

    /**
     * Phụ huynh đăng ký tài khoản cho con (Chỉ role Parent).
     */
    @Security('jwt', ['parent'])
    @Post('register-child')
    @Response<ValidateError>(422, 'Validation Failed')
    @Response(403, 'Forbidden')
    public async registerChild(@Request() req: any, @Body() body: RegisterChildDTO) {
        const parentId = req?.user?.userId;
        if (!parentId) {
            throw new UnauthorizedError('Unauthorized');
        }
        this.setStatus(201);
        return this.authService.registerChild(parentId, body);
    }

    /**
     * Lấy thông tin người dùng hiện tại (dựa trên JWT).
     */
    @Security('jwt')
    @Get('me')
    @Response(401, 'Unauthorized')
    public async getMe(@Request() req: any): Promise<IUser> {
        const userId = req?.user?.userId;
        if (!userId) {
            throw new UnauthorizedError('Unauthorized');
        }
        const user = await this.usersService.getUserById(userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }
        const { hashed_password: _, ...safeUser } = user;
        return safeUser as unknown as IUser;
    }

    /**
     * Cập nhật thông tin hồ sơ người dùng hiện tại.
     */
    @Security('jwt')
    @Put('me')
    @Response(401, 'Unauthorized')
    public async updateMe(@Request() req: any, @Body() body: UpdateProfileDTO): Promise<IUser> {
        const userId = req?.user?.userId;
        if (!userId) {
            throw new UnauthorizedError('Unauthorized');
        }
        const updated = await this.usersService.updateProfile(userId, body);
        return updated as unknown as IUser;
    }

    /**
     * Đổi mật khẩu (bắt buộc đăng nhập).
     */
    @Security('jwt')
    @Post('change-password')
    @Response<ValidateError>(422, 'Validation Failed')
    @Response(401, 'Unauthorized')
    public async changePassword(@Request() req: any, @Body() body: ChangePasswordDTO) {
        const userId = req?.user?.userId;
        if (!userId) {
            throw new UnauthorizedError('Unauthorized');
        }
        return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
    }
}
