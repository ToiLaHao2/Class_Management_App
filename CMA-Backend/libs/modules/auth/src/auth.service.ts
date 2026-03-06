import * as jwt from 'jsonwebtoken';
import { IUsersService, LoginDTO } from '@modules/users';
import { UnauthorizedError } from '@core/exceptions';
import { securityConfig } from '@core/config';
import { comparePassword } from '@core/utils';

export interface IAuthService {
    login(data: LoginDTO): Promise<{ accessToken: string, user: Record<string, any> }>;
}

export class AuthService implements IAuthService {
    private usersService: IUsersService;

    constructor({ usersService }: { usersService: IUsersService }) {
        this.usersService = usersService;
    }

    async login(data: LoginDTO) {
        // 1. Tìm user theo email (qua UsersService, KHÔNG gọi trực tiếp Repo)
        const user = await this.usersService.getUserByEmail(data.email);
        if (!user) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        // 2. So sánh mật khẩu bằng utility
        const isPasswordValid = await comparePassword(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        if (user.isDeleted) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        // 3. Sinh Access Token (JWT)
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const secretKey = securityConfig.jwtSecret || 'secret123456789'; // Ưu tiên cấu hình môi trường
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1d' });

        // 4. Lọc bỏ các trường nhạy cảm trả về UI
        const { passwordHash: _, isDeleted, ...safeUser } = user;

        return {
            accessToken,
            user: safeUser
        };
    }
}
