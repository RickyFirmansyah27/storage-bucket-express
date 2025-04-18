import { Hono } from 'hono';
import { createUser, getUsersHandler } from '../controller/user-controller';

const userRoutes = new Hono();

userRoutes.get('/', getUsersHandler);
userRoutes.post('/create', createUser);

export default userRoutes;
