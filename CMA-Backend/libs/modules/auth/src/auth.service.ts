// libs/modules/auth/src/auth.service.ts
import * as jwt from 'jsonwebtoken';
import { IUsersService, LoginDTO, CreateUserDTO, IUser } from '@modules/users';
import { IProfilesService } from '@modules/profiles';
import { UnauthorizedError, BadRequestError } from '@core/exceptions';
import { securityConfig } from '@core/config';
import { comparePassword, hashPassword } from '@core/utils';

export interface IAuthService {
    login(data: LoginDTO): Promise<{ accessToken: string, user: Record<string, any> }>;
    register(data: CreateUserDTO): Promise<IUser>;
    registerChild(parentId: string, data: { username: string, full_name: string }): Promise<{ message: string, studentId: string }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }>;
}

export class AuthService implements IAuthService {
    private usersService: IUsersService;
    private profilesService: IProfilesService;

    constructor({ usersService, profilesService }: { usersService: IUsersService, profilesService: IProfilesService }) {
        this.usersService = usersService;
        this.profilesService = profilesService;
    }

    async login(data: LoginDTO) {
        // ... (login logic remains)
        const user = await this.usersService.getUserByIdentifier(data.identifier);
        if (!user) {
            throw new UnauthorizedError('Thông tin đăng nhập hoặc mật khẩu không chính xác');
        }

        const isPasswordValid = await comparePassword(data.password, user.hashed_password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Thông tin đăng nhập hoặc mật khẩu không chính xác');
        }

        if (!user.is_active) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        const payload = {
            userId: user.id,
            email: user.email || '',
            username: user.username,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, securityConfig.jwtSecret, { expiresIn: '1d' });
        const { hashed_password: _, ...safeUser } = user;

        return { accessToken, user: safeUser };
    }

    /**
     * Luồng Đăng ký chuẩn: Tạo User -> Tạo Profile tương ứng Role
     */
    async register(data: CreateUserDTO) {
        // 1. Tạo User (Lưu username, email, full_name, password_hash)
        const user = await this.usersService.createUser(data);

        // 2. Tự động tạo Profile dựa trên Role và gán dữ liệu mở rộng
        if (data.role === 'teacher') {
            await this.profilesService.upsertTeacher(user.id, {
                bio: data.bio,
                experience: data.experience,
                subject_ids: data.subject_ids
            });
        } else if (data.role === 'student') {
            await this.profilesService.upsertStudent(user.id, {
                school: data.school,
                grade: data.grade
            });
        } else if (data.role === 'parent') {
            await this.profilesService.upsertParent(user.id, {});
        }

        return user;
    }

    async registerChild(parentId: string, data: { username: string, full_name: string }) {
        const defaultPassword = 'Classify@123';
        const studentUser = await this.usersService.createUser({
            username: data.username,
            full_name: data.full_name,
            password: defaultPassword,
            role: 'student'
        });

        await this.profilesService.upsertStudent(studentUser.id, {
            parent_id: parentId
        });

        return { 
            message: 'Đăng ký tài khoản cho con thành công',
            studentId: studentUser.id 
        };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.usersService.getUserById(userId);
        if (!user) {
            throw new UnauthorizedError('Người dùng không tồn tại');
        }
        if (!user.is_active) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        const isPasswordValid = await comparePassword(currentPassword, user.hashed_password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Mật khẩu hiện tại không đúng');
        }

        const newHash = await hashPassword(newPassword);
        await this.usersService.updatePasswordHash(userId, newHash);

        return { message: 'Đổi mật khẩu thành công' };
    }
}
