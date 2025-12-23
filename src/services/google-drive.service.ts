import { google } from 'googleapis';
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

export interface FileUploadData {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
}

export interface FileInfo {
    id?: string | null;
    name?: string | null;
    mimeType?: string | null;
    webViewLink?: string | null;
    webContentLink?: string | null;
}

export const GoogleDriveService = {
    /**
     * Upload file to Google Drive
     */
    async uploadFile(file: FileUploadData): Promise<FileInfo> {
        const folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim().replace(/['"]/g, '');

        const response = await drive.files.create({
            requestBody: {
                name: file.originalname,
                mimeType: file.mimetype,
                parents: [folderId],
            },
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
        });

        return response.data as FileInfo;
    },

    /**
     * Delete file from Google Drive
     */
    async deleteFile(fileId: string): Promise<{ fileId: string; status: number }> {
        const response = await drive.files.delete({
            fileId: fileId,
        });

        return {
            fileId,
            status: response.status,
        };
    },

    /**
     * Get file info and make it publicly accessible
     */
    async getFile(fileId: string): Promise<FileInfo> {
        // Make file publicly accessible
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

        return result.data as FileInfo;
    },

    /**
     * List all files in the configured folder
     */
    async listFiles(): Promise<FileInfo[]> {
        let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (folderId) {
            folderId = folderId.trim().replace(/['"]/g, '');
        }

        console.log(`Using Google Drive Folder ID: '${folderId}'`);

        if (!folderId) {
            throw new Error('Google Drive Folder ID is not configured');
        }

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
        });

        return (response.data.files || []) as FileInfo[];
    },
};
