import { BaseResponse, Logger } from '../helper';
import { Context } from 'hono';
import userService from '../service/user-service';

const contextLogger = 'UserController';
export const getUsersHandler = async (c: Context) => {
  try {
    const users = await userService.getAllUsers();
    Logger.info(`${contextLogger} | getUser`, users);
    return BaseResponse(c, 'User fetched successfully', 'success', users)
  } catch (error) {
    Logger.error(`${contextLogger} | getUser`, error);
    return BaseResponse(c, 'Error fetching user', 'internalServerError');
  }
};

export const createUser = async (c: Context) => {
  try {
    const body = await c.req.json<{
      idCard: string;
      name: string;
      position: string;
      departement: string;
      role?: string;
    }>();

    const { idCard, name, position, departement, role } = body;

    // Validasi input
    if (!idCard || !name || !position || !departement) {
      return BaseResponse(c, 'some fields are missing', 'badRequest');
    }

    // create user melalui service
    const user = await userService.createUser(idCard, name, position, departement, role ?? 'staff');
    console.log(user);

    return BaseResponse(c, 'User created successfully', 'created', [user]);
  } catch (err: any) {
    return BaseResponse(c, err.message || 'Error creating user', 'internalServerError');
  }
};


