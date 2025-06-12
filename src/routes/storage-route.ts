import { deleteFileHandler, downloadFile, getFiles, uploadFile } from '../controller/supabase-controller';
import { Router } from 'express';
import multer from 'multer';

// Gunakan memory storage untuk Vercel
const upload = multer({ storage: multer.memoryStorage() });

const storageRoute = Router();

storageRoute.route('/supabase').get(getFiles);
storageRoute.route('/supabase').post(upload.array('file'), uploadFile);
storageRoute.route('/supabase/download').get(downloadFile);
storageRoute.route('/supabase/delete').get(deleteFileHandler);

export default storageRoute;
