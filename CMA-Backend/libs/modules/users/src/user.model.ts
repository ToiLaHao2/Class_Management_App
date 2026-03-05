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
    isDeleted: boolean;
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
