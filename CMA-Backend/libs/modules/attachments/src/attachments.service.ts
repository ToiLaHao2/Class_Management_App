import { IAttachmentsRepository, IAttachment } from './attachments.model';
import { NotFoundError, BadRequestError } from '@core/exceptions';
import { IStorageProvider } from '@core/storage';

export interface IAttachmentsService {
    getAttachments(refType: string, refId: string): Promise<IAttachment[]>;
    uploadAndLink(
        userId: string, 
        refType: string, 
        refId: string, 
        file: Express.Multer.File
    ): Promise<IAttachment>;
    deleteAttachment(userId: string, id: string): Promise<{ message: string }>;
}

export class AttachmentsService implements IAttachmentsService {
    private attachmentsRepo: IAttachmentsRepository;
    private storageProvider: IStorageProvider;

    constructor({
        attachmentsRepository,
        storageProvider,
    }: {
        attachmentsRepository: IAttachmentsRepository;
        storageProvider: IStorageProvider;
    }) {
        this.attachmentsRepo = attachmentsRepository;
        this.storageProvider = storageProvider;
    }

    async getAttachments(refType: string, refId: string): Promise<IAttachment[]> {
        return this.attachmentsRepo.findByRef(refType, refId);
    }

    async uploadAndLink(
        userId: string, 
        refType: string, 
        refId: string, 
        file: Express.Multer.File
    ): Promise<IAttachment> {
        if (!file) throw new BadRequestError('Không tìm thấy file để upload');

        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        // 1. Upload file lên Cloud
        const folderName = `cma_${refType}s`; 
        const result = await this.storageProvider.uploadFileFromBuffer(
            file.buffer, 
            originalName, 
            file.mimetype, 
            folderName
        );

        // 2. Lưu Metadata vào Database
        return this.attachmentsRepo.create({
            ref_type: refType,
            ref_id: refId,
            file_name: originalName,
            file_type: file.mimetype,
            file_size: file.size,
            url: result.url,
            provider: result.provider,
            provider_public_id: result.publicId,
            uploaded_by: userId
        });
    }

    async deleteAttachment(userId: string, id: string): Promise<{ message: string }> {
        const attachment = await this.attachmentsRepo.findById(id);
        if (!attachment) throw new NotFoundError('Tệp đính kèm không tồn tại');

        // (Optional) Check permission here using userId

        // 1. Xóa file trên Cloud
        if (attachment.provider_public_id) {
            try {
                await this.storageProvider.deleteFile(attachment.provider_public_id);
            } catch (err) {
                console.error(`Lỗi xóa file cloud (${attachment.provider}):`, err);
                // Vẫn tiếp tục xóa DB để không bị kẹt data
            }
        }

        // 2. Xóa DB
        await this.attachmentsRepo.delete(id);
        
        return { message: 'Đã xóa tệp đính kèm' };
    }
}
