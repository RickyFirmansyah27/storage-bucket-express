import { deleteFileHandler, downloadFile, getFiles, uploadFile, uploadFileHandler } from '../controller/supabase-controller';
import { Router } from 'express';
import multer from 'multer';

// Use /tmp directory for uploads in serverless environments like Vercel
const upload = multer({ dest: '/tmp/' });

const storageRoute = Router();

storageRoute.route('/supabase').get(getFiles);
storageRoute.route('/supabase').post(upload.single('file'), uploadFileHandler);
storageRoute.route('/supabase/download').get(downloadFile);
storageRoute.route('/supabase/delete').get(deleteFileHandler);

export default storageRoute;
