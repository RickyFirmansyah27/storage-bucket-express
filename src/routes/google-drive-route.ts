import { Router } from 'express';
import multer from 'multer';
import { uploadFileGoogle, deleteFileGoogle, getFileGoogle, getFilesGoogle } from '../controller/google-drive-controller';

const upload = multer({ storage: multer.memoryStorage() });
const googleDriveRoute = Router();

googleDriveRoute.post('/upload', upload.array('file'), uploadFileGoogle);
googleDriveRoute.delete('/delete/:fileId', deleteFileGoogle);
googleDriveRoute.get('/file/:fileId', getFileGoogle);
googleDriveRoute.get('/list', getFilesGoogle);

export default googleDriveRoute;
