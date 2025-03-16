import { BaseResponse, Logger } from '../helper';
import { Context } from 'hono';

const contextLogger = 'UserController';
export const getUsersHandler = (c: Context) => {
  const users = { data: [] };
  Logger.info(`${contextLogger} | getUser`, users);
  return BaseResponse(c, 'User created successfully', 'success', { data: users })
};


