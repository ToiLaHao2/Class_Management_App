/**
 * User Model — TypeScript Interface & Response DTO
 * Schema mới: UUID, username, date_of_birth, is_active
 */
export interface IUser {
    id: string; // UUID
    username: string;
    email: string;
    full_name: string;
    date_of_birth?: Date;
    avatar_url?: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * Entity lưu trong Database (chứa Password Hash)
 */
export interface IUserEntity extends IUser {
    hashed_password: string;
}

/**
 * Contact info liên kết với User
 */
export interface IContact {
    id: string; // UUID
    user_id: string;
    category_id?: string;
    contact_value: string;
    is_public: boolean;
    is_primary: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * DTO for User Login
 */
export interface LoginDTO {
    identifier: string; // Có thể là Email hoặc Username
    password: string;
}

/**
 * Interface Repository cho module Users
 */
export interface IUsersRepository {
    findById(id: string): Promise<IUserEntity | null>;
    findByEmail(email: string): Promise<IUserEntity | null>;
    findByUsername(username: string): Promise<IUserEntity | null>;
    findAll(): Promise<IUserEntity[]>;
    create(data: Omit<IUserEntity, 'id' | 'created_at' | 'updated_at'>): Promise<IUserEntity>;
    update(id: string, partialData: Partial<IUserEntity>): Promise<IUserEntity>;
}

/**
 * Interface Repository cho Contacts
 */
export interface IContactsRepository {
    findByUserId(userId: string): Promise<IContact[]>;
    create(data: Omit<IContact, 'id' | 'created_at' | 'updated_at'>): Promise<IContact>;
    update(id: string, data: Partial<IContact>): Promise<IContact>;
    delete(id: string): Promise<boolean>;
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDTO {
    email?: string; // Optional để trẻ em có thể để trống
    password: string;
    username: string;
    full_name: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
    avatar_url?: string;
    date_of_birth?: string; // ISO string
    // Profile extra fields
    bio?: string;
    experience?: string;
    subject_ids?: string[];
    school?: string;
    grade?: string;
}

/**
 * DTO for updating a user
 */
export interface UpdateUserDTO {
    username?: string;
    avatar_url?: string;
    role?: 'student' | 'teacher' | 'parent' | 'admin';
    date_of_birth?: string;
    is_active?: boolean;
}

/**
 * DTO for creating a contact
 */
export interface CreateContactDTO {
    contact_value: string;
    category_id?: string;
    is_public?: boolean;
    is_primary?: boolean;
}
