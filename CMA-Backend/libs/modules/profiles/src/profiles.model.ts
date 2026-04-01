/**
 * Profiles Model — TypeScript Interfaces & DTOs
 */

// === TEACHER PROFILE ===
export interface ITeacherProfile {
    id: string; // UUID
    user_id: string; // UUID
    bio?: string;
    subjects?: string; // Nối chuỗi, vd: "Toán, Lý, Hóa"
    experience?: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UpsertTeacherProfileDTO {
    bio?: string;
    subject_ids?: string[];
    experience?: string;
}

// === PARENT PROFILE ===
export interface IParentProfile {
    id: string; // UUID
    user_id: string; // UUID
    // contact_lists đã bị loại bỏ, sử dụng bảng contacts chung
    created_at: Date;
    updated_at: Date;
}

// Parent profile không có fields update nào ngoài ID, nên dto rỗng hiện tại
export interface UpsertParentProfileDTO {
    // Để mở rộng sau này
}

// === STUDENT PROFILE ===
export interface IStudentProfile {
    id: string; // UUID
    user_id: string; // UUID
    parent_id?: string; // UUID (liên kết với parent_profiles)
    school?: string;
    grade?: string;
    academic_level?: string; // UUID (tham chiếu categories)
    learning_goal?: string;
    health_notes?: string;
    nickname?: string;
    special_notes?: string;
    created_at: Date;
    updated_at: Date;
}

export interface UpsertStudentProfileDTO {
    parent_id?: string;
    school?: string;
    grade?: string;
    academic_level?: string;
    learning_goal?: string;
    health_notes?: string;
    nickname?: string;
    special_notes?: string;
}

// === REPOSITORY INTERFACE ===
export interface IProfilesRepository {
    getTeacher(userId: string): Promise<ITeacherProfile | null>;
    upsertTeacher(userId: string, data: { bio?: string, subjects?: string, experience?: string }): Promise<ITeacherProfile>;

    getParent(userId: string): Promise<IParentProfile | null>;
    upsertParent(userId: string, data?: UpsertParentProfileDTO): Promise<IParentProfile>;

    getStudent(userId: string): Promise<IStudentProfile | null>;
    upsertStudent(userId: string, data: UpsertStudentProfileDTO): Promise<IStudentProfile>;
    
    // (Admin/Teacher) Link student to parent
    linkStudentToParent(studentId: string, parentId: string): Promise<boolean>;
}
