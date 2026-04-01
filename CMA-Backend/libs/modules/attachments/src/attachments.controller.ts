import {
    Controller, Get, Post, Delete,
    Route, Path, Query, Tags, Security, SuccessResponse, Request,
    UploadedFile, FormField
} from '@tsoa/runtime';
import { IAttachmentsService } from './attachments.service';
import { IAttachment } from './attachments.model';
import express from 'express';

interface RequestWithUser extends express.Request {
    user: { id: string; role: string };
}

@Route('attachments')
@Tags('Attachments')
export class AttachmentsController extends Controller {
    private readonly attachmentsService: IAttachmentsService;

    constructor({ attachmentsService }: { attachmentsService: IAttachmentsService }) {
        super();
        this.attachmentsService = attachmentsService;
    }

    /** Lấy tệp đính kèm theo loại và ID gốc */
    @Security('jwt')
    @Get('/')
    public async getAttachments(
        @Query() ref_type: string,
        @Query() ref_id: string,
    ): Promise<IAttachment[]> {
        return this.attachmentsService.getAttachments(ref_type, ref_id);
    }

    /** 
     * Upload và Ghim tệp đính kèm mới (Dùng Multipart FormData) 
     * @param ref_type Loại đối tượng (vd: 'schedule', 'assignment')
     * @param ref_id ID của đối tượng
     * @param file Tệp tải lên (Dung lượng Tối đa: 20MB)
     */
    @Security('jwt')
    @SuccessResponse('201', 'Created')
    @Post('/upload')
    public async uploadAttachment(
        @Request() req: RequestWithUser,
        @FormField() ref_type: string,
        @FormField() ref_id: string,
        @UploadedFile() file: Express.Multer.File 
    ): Promise<IAttachment> {
        this.setStatus(201);
        return this.attachmentsService.uploadAndLink(req.user.id, ref_type, ref_id, file);
    }

    /** Xóa tệp đính kèm */
    @Security('jwt')
    @Delete('{id}')
    public async removeAttachment(
        @Request() req: RequestWithUser,
        @Path() id: string
    ): Promise<{ message: string }> {
        return this.attachmentsService.deleteAttachment(req.user.id, id);
    }
}
