import { Hono } from 'hono';
import { insertAttendanceHandler, getAttendances } from '../controller/attendance-controller';

const userRoutes = new Hono();

userRoutes.get('/', getAttendances);
userRoutes.post('/add', insertAttendanceHandler);

export default userRoutes;
