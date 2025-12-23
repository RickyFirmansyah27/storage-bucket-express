import { Request, Response } from 'express';
import { BaseResponse } from '../helper/base-response';
import { GoogleDriveService } from '../services/google-drive.service';

export const uploadFileGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            BaseResponse(res, 'No file uploaded', 'badRequest');
            return;
        }

        const file = files[0];
        const result = await GoogleDriveService.uploadFile({
            originalname: file.originalname,
            mimetype: file.mimetype,
            buffer: file.buffer,
        });

        BaseResponse(res, 'File uploaded successfully', 'created', result);
    } catch (error: any) {
        BaseResponse(res, error.message, 'internalServerError');
    }
};

export const deleteFileGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fileId } = req.params;
        if (!fileId) {
            BaseResponse(res, 'File ID is required', 'badRequest');
            return;
        }

        const result = await GoogleDriveService.deleteFile(fileId);
        BaseResponse(res, 'File deleted successfully', 'success', result);
    } catch (error: any) {
        BaseResponse(res, error.message, 'internalServerError');
    }
};

export const getFileGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fileId } = req.params;
        if (!fileId) {
            BaseResponse(res, 'File ID is required', 'badRequest');
            return;
        }

        const result = await GoogleDriveService.getFile(fileId);
        BaseResponse(res, 'File retrieved successfully', 'success', result);
    } catch (error: any) {
        BaseResponse(res, error.message, 'internalServerError');
    }
};

export const getFilesGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await GoogleDriveService.listFiles();
        BaseResponse(res, 'Files retrieved successfully', 'success', result);
    } catch (error: any) {
        BaseResponse(res, error.message, 'internalServerError');
    }
};
