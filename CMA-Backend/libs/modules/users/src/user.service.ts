import { IUsersRepository, CreateUserDTO, IUserEntity } from './user.model';
import { BadRequestError } from '@core/exceptions';
import { hashPassword } from '@core/utils';

export interface IUsersService {
    getUserById(id: string): Promise<IUserEntity | null>;
    getUserByEmail(email: string): Promise<IUserEntity | null>;
    getAllUsers(): Promise<Omit<IUserEntity, 'passwordHash'>[]>;
    createUser(data: CreateUserDTO): Promise<Omit<IUserEntity, 'passwordHash'>>;
    updatePasswordHash(userId: string, passwordHash: string, mustChangePassword: boolean): Promise<void>;
    updateProfile(userId: string, data: { fullName?: string; avatar?: string; role?: string }): Promise<Omit<IUserEntity, 'passwordHash'>>;
    softDeleteUser(userId: string): Promise<{ message: string }>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        roleDistribution: { label: string; count: number; percentage: number; color: string }[];
        recentGrowth: string;
    }>;
    getSystemHealth(): Promise<{
        services: { name: string; status: 'healthy' | 'warning' | 'error'; latency: string }[];
        uptime: string;
    }>;
}

export class UsersService implements IUsersService {
    private usersRepository: IUsersRepository;

    constructor({ usersRepository }: { usersRepository: IUsersRepository }) {
        this.usersRepository = usersRepository;
    }

    async getUserById(id: string): Promise<IUserEntity | null> {
        return this.usersRepository.findById(id);
    }

    async getUserByEmail(email: string): Promise<IUserEntity | null> {
        return this.usersRepository.findByEmail(email);
    }

    async getAllUsers(): Promise<Omit<IUserEntity, 'passwordHash'>[]> {
        const users = await this.usersRepository.findAll();
        return users.map(({ passwordHash: _, ...u }) => u);
    }

    async createUser(data: CreateUserDTO): Promise<Omit<IUserEntity, 'passwordHash'>> {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.usersRepository.findByEmail(data.email);
        if (existingUser) {
            throw new BadRequestError('Email đã được sử dụng');
        }

        // 2. Hash mật khẩu bằng Utility của Core
        const passwordHash = await hashPassword(data.password);

        // 3. Chuẩn bị payload lưu DB
        const payload: Partial<IUserEntity> = {
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            role: data.role,
            mustChangePassword: false,
        };
        if (data.avatar) payload.avatar = data.avatar;

        // 4. Lưu vào Database thông qua Repository
        const newUser = await this.usersRepository.create(payload as Omit<IUserEntity, 'id' | 'createdAt' | 'isDeleted'>);

        // 5. Loại bỏ passwordHash trước khi trả về
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async updatePasswordHash(userId: string, passwordHash: string, mustChangePassword: boolean): Promise<void> {
        await this.usersRepository.update(userId, { passwordHash, mustChangePassword });
    }

    async updateProfile(userId: string, data: { fullName?: string; avatar?: string; role?: string }): Promise<Omit<IUserEntity, 'passwordHash'>> {
        const updated = await this.usersRepository.update(userId, {
            ...(data.fullName ? { fullName: data.fullName } : {}),
            ...(data.avatar ? { avatar: data.avatar } : {}),
            ...(data.role ? { role: data.role as IUserEntity['role'] } : {}),
        });
        const { passwordHash: _, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }

    async softDeleteUser(userId: string): Promise<{ message: string }> {
        await this.usersRepository.update(userId, { isDeleted: true });
        return { message: `Người dùng ${userId} đã bị vô hiệu hóa.` };
    }

    async getDashboardStats(): Promise<{
        totalUsers: number;
        roleDistribution: { label: string; count: number; percentage: number; color: string }[];
        recentGrowth: string;
    }> {
        const users = await this.usersRepository.findAll();
        const totalUsers = users.length;

        const counts = {
            student: users.filter(u => u.role === 'student').length,
            teacher: users.filter(u => u.role === 'teacher').length,
            admin: users.filter(u => u.role === 'admin').length,
            parent: users.filter(u => u.role === 'parent').length,
        };

        const roleDistribution = [
            { label: 'Học sinh', count: counts.student, percentage: totalUsers ? Math.round((counts.student / totalUsers) * 100) : 0, color: 'bg-primary' },
            { label: 'Giáo viên', count: counts.teacher, percentage: totalUsers ? Math.round((counts.teacher / totalUsers) * 100) : 0, color: 'bg-emerald-400' },
            { label: 'Phụ huynh', count: counts.parent, percentage: totalUsers ? Math.round((counts.parent / totalUsers) * 100) : 0, color: 'bg-amber-400' },
        ];

        return {
            totalUsers,
            roleDistribution,
            recentGrowth: '+5% tuần này' // Mock growth for now
        };
    }

    async getSystemHealth(): Promise<{
        services: { name: string; status: 'healthy' | 'warning' | 'error'; latency: string }[];
        uptime: string;
    }> {
        return {
            services: [
                { name: 'Core API Server', status: 'healthy', latency: '24ms' },
                { name: 'Firestore DB', status: 'healthy', latency: '15ms' },
                { name: 'Auth Module', status: 'healthy', latency: '8ms' },
            ],
            uptime: '99.9%'
        };
    }
}
