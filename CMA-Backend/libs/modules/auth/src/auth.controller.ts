import { Controller, Post, Body, Route, Tags, Response } from '@tsoa/runtime';
import { IAuthService } from './auth.service';
import { IUsersService, LoginDTO, CreateUserDTO } from '@modules/users';
import { ValidateError } from '@tsoa/runtime';

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
    private readonly authService: IAuthService;
    private readonly usersService: IUsersService;

    // 1. Tiêm 2 Service vào Controller thông qua Injector PROXY Object
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
        // Validation role (nếu cần thiết, hoặc để Swagger config enum lo)
        const user = await this.usersService.createUser(body);
        this.setStatus(201); // Created
        return {
            message: "Đăng ký tài khoản thành công",
            user
        };
    }
}
