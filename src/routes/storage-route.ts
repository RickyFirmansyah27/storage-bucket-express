import { Hono } from 'hono';
import { getFilesHanlder, uploadFileHandler } from '../controller/supabase-controller';

const storageRoute = new Hono();

storageRoute.get('/supabase', getFilesHanlder);
storageRoute.post('/supabase', uploadFileHandler);

export default storageRoute;
