import { Hono } from 'hono';
import { registerHandler, loginHandler } from '../controller/auth-controller';

const userRoutes = new Hono();

userRoutes.post('/register', registerHandler);
userRoutes.post('/login', loginHandler);

export default userRoutes;
