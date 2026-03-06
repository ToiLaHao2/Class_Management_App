/**
 * User Model — TypeScript Interface & Response DTO
 */
export interface IUser {
    id: string;
    email: string;
    fullName: string;
    role: 'student' | 'teacher' | 'admin';
    avatar?: string;
    createdAt: Date;
    // Mật khẩu đã mã hoá sẽ lưu dưới DB, không bao giờ lộ ra ngoài API (nên không đưa vào dto response)
    isDeleted: boolean;
}

/**
 * Entity lưu trong Database (Mở rộng từ IUser để chứa Password Hash)
 */
export interface IUserEntity extends IUser {
    passwordHash: string;
}

/**
 * DTO for User Login
 */
export interface LoginDTO {
    email: string;
    password: string;
}

/**
 * Interface Repository Cam Kết Cấu Trúc Data Cho Module Users
 */
export interface IUsersRepository {
    findById(id: string): Promise<IUserEntity | null>;
    findByEmail(email: string): Promise<IUserEntity | null>;
    create(data: Omit<IUserEntity, 'id' | 'createdAt' | 'isDeleted'>): Promise<IUserEntity>;
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDTO {
    email: string;
    password: string;
    fullName: string;
    role: 'student' | 'teacher' | 'admin';
    avatar?: string;
}

/**
 * DTO for updating a user
 */
export interface UpdateUserDTO {
    fullName?: string;
    avatar?: string;
    role?: 'student' | 'teacher' | 'admin';
}
