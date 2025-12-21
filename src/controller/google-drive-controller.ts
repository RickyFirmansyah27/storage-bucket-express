import { Request, Response } from 'express';
import { google } from 'googleapis';
import { BaseResponse } from '../helper/base-response';
import { Readable } from 'stream';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

export const uploadFileGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            BaseResponse(res, 'No file uploaded', 'badRequest');
            return;
        }

        const file = files[0];

        const response = await drive.files.create({
            requestBody: {
                name: file.originalname,
                mimeType: file.mimetype,
                parents: [(process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim().replace(/['"]/g, '')], // Upload to specific folder
            },
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
        });

        BaseResponse(res, 'File uploaded successfully', 'created', response.data);
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

        const response = await drive.files.delete({
            fileId: fileId,
        });

        BaseResponse(res, 'File deleted successfully', 'success', {
            fileId,
            status: response.status,
        });
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

        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        const result = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, webViewLink, webContentLink',
        });

        BaseResponse(res, 'File retrieved successfully', 'success', result.data);

    } catch (error: any) {
        BaseResponse(res, error.message, 'internalServerError');
    }
};

export const getFilesGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (folderId) {
            folderId = folderId.trim().replace(/['"]/g, '');
        }
        console.log(`Using Google Drive Folder ID: '${folderId}'`);
        if (!folderId) {
            BaseResponse(res, 'Google Drive Folder ID is not configured', 'internalServerError');
            return;
        }

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
        });

        BaseResponse(res, 'Files retrieved successfully', 'success', response.data.files);
    } catch (error: any) {
        BaseResponse(res, error.message, 'internalServerError');
    }
};
