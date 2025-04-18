import { BaseResponse } from '../helper';
import authService from '../service/auth-service';
import { Context } from 'hono';

export const registerHandler = async (c: Context) => {
  try {
    const body = await c.req.json<{
      idCard: string;
      role: string;
      username: string;
      password: string;
    }>();

    const { idCard, role, password, username } = body;

    // Validasi input
    if (!idCard || !role || !username || !password) {
      return BaseResponse(c, 'some fields are missing', 'badRequest');
    }

    // Register user melalui service
    const response = await authService.registerUser(idCard, role, username, password);

    return BaseResponse(c, 'User registered successfully', 'created', [response]);
  } catch (err: any) {
    return BaseResponse(c, err.message || 'Error registering user', 'internalServerError');
  }
};

export const loginHandler = async (c: Context) => {
  try {
    const body = await c.req.json<{ username: string; password: string }>();

    // Validasi input
    if (!body.password) {
      return BaseResponse(c, 'username and password are required', 'badRequest');
    }

    // Panggil service untuk login
    const { token, user } = await authService.loginUser(body.username, body.password);

    return BaseResponse(c, 'Login successful', 'success', { token, user });
  } catch (err: any) {
    return BaseResponse(c, err.message, 'unauthorized');
  }
};
