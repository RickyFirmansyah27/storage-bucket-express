import { downloadFile, getFiles, uploadFile } from '../controller/supabase-controller';
import { Router } from 'express';
import multer from 'multer';

// Use /tmp directory for uploads in serverless environments like Vercel
const upload = multer({ dest: '/tmp/' });

const storageRoute = Router();

storageRoute.route('/supabase').get(getFiles);
storageRoute.route('/supabase').post(upload.single('file'), uploadFile);
storageRoute.route('/supabase/download').get(downloadFile);

export default storageRoute;
