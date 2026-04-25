import { IUsersRepository, IContactsRepository, CreateUserDTO, IUserEntity, IUser, IContact, CreateContactDTO, UpdateUserDTO } from './user.model';
import { BadRequestError } from '@core/exceptions';
import { hashPassword } from '@core/utils';
import { storageConfig } from '@core/config';

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
        systemMetrics: {
            activeClassesCount: number;
            attachmentsCount: number;
            attachmentsSizeMb: number;
            storageProvider: string;
            storageLimitGb: number;
        };
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
    private db: any;

    private mongoDb: any;

    constructor({ usersRepository, contactsRepository, db, mongoDb }: {
        usersRepository: IUsersRepository;
        contactsRepository: IContactsRepository;
        db: any;
        mongoDb: any;
    }) {
        this.usersRepository = usersRepository;
        this.contactsRepository = contactsRepository;
        this.db = db;
        this.mongoDb = mongoDb;
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
            { label: 'Quản trị viên', count: counts.admin, percentage: totalUsers ? Math.round((counts.admin / totalUsers) * 100) : 0, color: 'bg-rose-400' },
        ];

        let activeClassesCount = 0;
        let attachmentsCount = 0;
        let attachmentsSizeMb = 0;

        try {
            const pool = this.db.getDB();
            // Count active classes safely if table exists
            const classRes = await pool.query(`SELECT COUNT(*) FROM classes WHERE status = 'active'`);
            activeClassesCount = parseInt(classRes.rows[0].count, 10);
        } catch (e) {
            // tables might not exist yet
        }

        try {
            const pool = this.db.getDB();
            const attachRes = await pool.query(`SELECT COUNT(*) as count, SUM(size_bytes) as total_size FROM attachments`);
            attachmentsCount = parseInt(attachRes.rows[0].count, 10);
            const totalBytes = parseInt(attachRes.rows[0].total_size || '0', 10);
            attachmentsSizeMb = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
        } catch (e) {
            // tables might not exist yet
        }

        return { 
            totalUsers, 
            roleDistribution, 
            recentGrowth: '+5% tuần này',
            systemMetrics: {
                activeClassesCount,
                attachmentsCount,
                attachmentsSizeMb,
                storageProvider: storageConfig.provider,
                storageLimitGb: storageConfig.storageLimitGb,
            }
        };
    }

    async getSystemHealth() {
        const start = Date.now();
        let dbStatus: 'healthy' | 'error' = 'error';
        let latencyStr = '...';
        try {
            if (this.db && typeof this.db.getDB === 'function') {
                await this.db.getDB().query('SELECT 1');
                dbStatus = 'healthy';
                latencyStr = `${Date.now() - start}ms`;
            } else if (this.db && typeof this.db.query === 'function') {
                await this.db.query('SELECT 1');
                dbStatus = 'healthy';
                latencyStr = `${Date.now() - start}ms`;
            }
        } catch (e) {
            latencyStr = 'timeout';
        }

        // MongoDB Health check
        let mongoStatus: 'healthy' | 'warning' | 'error' = 'error';
        let mongoLatency = 'offline';
        if (this.mongoDb && typeof this.mongoDb.isConnected === 'function' && this.mongoDb.isConnected()) {
            const startM = Date.now();
            try {
                // Use the adapter's ping method if available
                if (typeof this.mongoDb.ping === 'function') {
                    const pingTime = await this.mongoDb.ping();
                    if (pingTime >= 0) {
                        mongoStatus = 'healthy';
                        mongoLatency = `${pingTime}ms`;
                    }
                } else {
                    mongoStatus = 'healthy';
                    mongoLatency = `${Date.now() - startM}ms`;
                }
            } catch (e) {
                mongoStatus = 'error';
                mongoLatency = 'error';
            }
        } else if (this.mongoDb) {
            mongoStatus = 'warning';
            mongoLatency = 'not connected';
        }

        return {
            services: [
                { name: 'Core API Gateway', status: 'healthy' as const, latency: '2ms' },
                { name: 'PostgreSQL Database', status: dbStatus, latency: latencyStr },
                { name: 'MongoDB (Logs)', status: mongoStatus, latency: mongoLatency },
                { name: 'JWT Auth Module', status: 'healthy' as const, latency: '1ms' },
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
