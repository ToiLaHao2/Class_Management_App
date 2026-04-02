import { IUsersRepository, IContactsRepository, CreateUserDTO, IUserEntity, IUser, IContact, CreateContactDTO, UpdateUserDTO } from './user.model';
import { BadRequestError } from '@core/exceptions';
import { hashPassword } from '@core/utils';

export interface IUsersService {
    getUserById(id: string): Promise<IUserEntity | null>;
    getUserByEmail(email: string): Promise<IUserEntity | null>;
    getUserByUsername(username: string): Promise<IUserEntity | null>;
    getUserByIdentifier(identifier: string): Promise<IUserEntity | null>;
    getAllUsers(): Promise<IUser[]>;
    createUser(data: CreateUserDTO): Promise<IUser>;
    updatePasswordHash(userId: string, hashedPassword: string): Promise<void>;
    updateProfile(userId: string, data: UpdateUserDTO): Promise<IUser>;
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
    // Contacts
    getUserContacts(userId: string): Promise<IContact[]>;
    addContact(userId: string, data: CreateContactDTO): Promise<IContact>;
    updateContact(contactId: string, data: Partial<IContact>): Promise<IContact>;
    deleteContact(contactId: string): Promise<{ message: string }>;
}

/**
 * Loại bỏ hashed_password từ IUserEntity → IUser
 */
function toSafeUser(entity: IUserEntity): IUser {
    const { hashed_password: _, ...safe } = entity;
    return safe;
}

export class UsersService implements IUsersService {
    private usersRepository: IUsersRepository;
    private contactsRepository: IContactsRepository;

    constructor({ usersRepository, contactsRepository }: {
        usersRepository: IUsersRepository;
        contactsRepository: IContactsRepository;
    }) {
        this.usersRepository = usersRepository;
        this.contactsRepository = contactsRepository;
    }

    async getUserById(id: string): Promise<IUserEntity | null> {
        return this.usersRepository.findById(id);
    }

    async getUserByEmail(email: string): Promise<IUserEntity | null> {
        return this.usersRepository.findByEmail(email);
    }

    async getUserByUsername(username: string): Promise<IUserEntity | null> {
        return this.usersRepository.findByUsername(username);
    }

    async getUserByIdentifier(identifier: string): Promise<IUserEntity | null> {
        // Kiểm tra xem identifier có phải là email không
        const isEmail = identifier.includes('@');
        if (isEmail) {
            return this.usersRepository.findByEmail(identifier);
        }
        return this.usersRepository.findByUsername(identifier);
    }

    async getAllUsers(): Promise<IUser[]> {
        const users = await this.usersRepository.findAll();
        return users.map(toSafeUser);
    }

    async createUser(data: CreateUserDTO): Promise<IUser> {
        // 1. Kiểm tra Username (Bắt buộc)
        const existingUsername = await this.usersRepository.findByUsername(data.username);
        if (existingUsername) {
            throw new BadRequestError('Tên đăng nhập đã tồn tại');
        }

        // 2. Kiểm tra Email (Nếu có)
        if (data.email) {
            const existingEmail = await this.usersRepository.findByEmail(data.email);
            if (existingEmail) {
                throw new BadRequestError('Email đã được sử dụng');
            }
        }

        const hashed_password = await hashPassword(data.password);

        const payload: Omit<IUserEntity, 'id' | 'created_at' | 'updated_at'> = {
            email: data.email as string, 
            username: data.username,
            full_name: data.full_name,
            hashed_password,
            role: data.role,
            is_active: true,
            date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
            avatar_url: data.avatar_url,
        };

        const newUser = await this.usersRepository.create(payload);
        return toSafeUser(newUser);
    }

    async updatePasswordHash(userId: string, hashedPassword: string): Promise<void> {
        await this.usersRepository.update(userId, { hashed_password: hashedPassword });
    }

    async updateProfile(userId: string, data: UpdateUserDTO): Promise<IUser> {
        const updatePayload: Partial<IUserEntity> = {};
        if (data.username) updatePayload.username = data.username;
        if (data.avatar_url) updatePayload.avatar_url = data.avatar_url;
        if (data.role) updatePayload.role = data.role as IUserEntity['role'];
        if (data.date_of_birth) updatePayload.date_of_birth = new Date(data.date_of_birth);
        if (data.is_active !== undefined) updatePayload.is_active = data.is_active;

        const updated = await this.usersRepository.update(userId, updatePayload);
        return toSafeUser(updated);
    }

    async softDeleteUser(userId: string): Promise<{ message: string }> {
        await this.usersRepository.update(userId, { is_active: false });
        return { message: `Người dùng ${userId} đã bị vô hiệu hóa.` };
    }

    async getDashboardStats() {
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

        return { totalUsers, roleDistribution, recentGrowth: '+5% tuần này' };
    }

    async getSystemHealth() {
        return {
            services: [
                { name: 'Core API Server', status: 'healthy' as const, latency: '24ms' },
                { name: 'PostgreSQL DB', status: 'healthy' as const, latency: '15ms' },
                { name: 'Auth Module', status: 'healthy' as const, latency: '8ms' },
            ],
            uptime: '99.9%'
        };
    }

    // === Contacts ===

    async getUserContacts(userId: string): Promise<IContact[]> {
        return this.contactsRepository.findByUserId(userId);
    }

    async addContact(userId: string, data: CreateContactDTO): Promise<IContact> {
        return this.contactsRepository.create({
            user_id: userId,
            contact_value: data.contact_value,
            category_id: data.category_id,
            is_public: data.is_public ?? false,
            is_primary: data.is_primary ?? false,
        });
    }

    async updateContact(contactId: string, data: Partial<IContact>): Promise<IContact> {
        return this.contactsRepository.update(contactId, data);
    }

    async deleteContact(contactId: string): Promise<{ message: string }> {
        await this.contactsRepository.delete(contactId);
        return { message: 'Contact deleted' };
    }
}
