import { executeSQLQuery } from '../config/dbPoolInfra';
import { getUserByIdCard, getUserByName } from './user-service';
import * as crypto from 'crypto';
import * as cuid from 'cuid';
import { generateJWT } from '../helper/jwt-helper';

export const createAuth = async (idCard: string, role: string, username: string, password: string) => {
  const query = `
    INSERT INTO "Auth" (idCard, role, username, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const queryParams = [idCard, role, username, password];

  return executeSQLQuery(query, queryParams);
};

const getUserAuthByUsername = (username: string) => {
  const query = 'SELECT * FROM "Auth" WHERE username = $1';
  const params = [username];

  return executeSQLQuery(query, params);
};

const registerUser = async (
  idCard: string,
  role: string,
  username: string,
  password: string
) => {
  const [existingUser] = await getUserAuthByUsername(username);

  if (existingUser) {
    throw new Error('username already exists');
  }

  // Using crypto for password hashing
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  const hashedPassword = `${salt}:${hash}`;

  const user = await createAuth(idCard, role, username, hashedPassword);

  return [user];
};



const loginUser = async (username: string, passwordRaw: string) => {
  const [userAuth] = await getUserAuthByUsername(username);
  if (!userAuth) {
    throw new Error('User not found');
  }

  // Verifikasi password using crypto
  const [salt, storedHash] = userAuth.password.split(':');
  const hash = crypto.pbkdf2Sync(passwordRaw, salt, 1000, 64, 'sha512').toString('hex');
  const isPasswordValid = storedHash === hash;
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = await generateJWT(userAuth.idCard, userAuth.password);
  return { token, user: userAuth };
};


export default {
  registerUser,
  loginUser,
};