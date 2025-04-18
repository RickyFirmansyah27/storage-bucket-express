import { Hono } from 'hono';
import { registerHandler, loginHandler } from '../controller/auth-controller';

const authRoute = new Hono();

authRoute.post('/register', registerHandler);
authRoute.post('/login', loginHandler);

export default authRoute;
