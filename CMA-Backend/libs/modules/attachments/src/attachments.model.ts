export interface IAttachment {
    id: string;
    ref_type: string;          // 'schedule' | 'lesson' | 'assignment' | 'submission' ...
    ref_id: string;            // UUID của record gốc
    
    file_name: string;         // 'toan.pdf'
    file_type: string;         // 'application/pdf'
    file_size: number;         // bytes
    
    url: string;               // Public link
    provider: string;          // 'cloudinary', 's3', 'r2'
    provider_public_id: string;// ID để xoá file trên Provider
    
    uploaded_by?: string;      // → users.id
    created_at: Date;
}

export interface CreateAttachmentDTO {
    ref_type: string;
    ref_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    url: string;
    provider: string;
    provider_public_id: string;
}

export interface IAttachmentsRepository {
    findByRef(refType: string, refId: string): Promise<IAttachment[]>;
    findById(id: string): Promise<IAttachment | null>;
    create(data: Record<string, unknown>): Promise<IAttachment>;
    delete(id: string): Promise<boolean>;
}
