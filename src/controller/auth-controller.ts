import { BaseResponse } from '../helper';
import authService from '../service/auth-service';
import { Context } from 'hono';

export const registerHandler = async (c: Context) => {
  try {
    const body = await c.req.json<{ name: string; email: string; password: string }>();

    // Validasi input
    if (!body.name || !body.email || !body.password) {
      return BaseResponse(c, 'Name, email, and password are required', 'badRequest');
    }

    // Panggil service untuk register
    const { user } = await authService.registerUser(body.name, body.email, body.password);

    return BaseResponse(c, 'User registered successfully', 'created', { user });
  } catch (err: any) {
    return BaseResponse(c, err.message || 'Error registering user', 'internalServerError');
  }
};

export const loginHandler = async (c: Context) => {
  try {
    const body = await c.req.json<{ email: string; password: string }>();

    // Validasi input
    if (!body.email || !body.password) {
      return BaseResponse(c, 'Email and password are required', 'badRequest');
    }

    // Panggil service untuk login
    const { token, user } = await authService.loginUser(body.email, body.password);

    return BaseResponse(c, 'Login successful', 'success', { token, user });
  } catch (err: any) {
    return BaseResponse(c, err.message, 'unauthorized');
  }
};
