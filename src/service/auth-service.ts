import { getUserByEmail, createUser } from './user-service';
import crypto from 'crypto';
import { generateJWT } from '../helper/jwt-helper';

const registerUser = async (name: string, email: string, passwordRaw: string) => {
  const [existingUser] = await getUserByEmail(email);

  console.log('existingUser', existingUser);
  if (existingUser) {
    throw new Error('Email is already taken');
  }

  // Using crypto for password hashing
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(passwordRaw, salt, 1000, 64, 'sha512').toString('hex');
  const hashedPassword = `${salt}:${hash}`;

  const { user } = await createUser(name, email, hashedPassword);

  return { user };
};

const loginUser = async (email: string, passwordRaw: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  // Verifikasi password using crypto
  const [salt, storedHash] = user[0].password.split(':');
  const hash = crypto.pbkdf2Sync(passwordRaw, salt, 1000, 64, 'sha512').toString('hex');
  const isPasswordValid = storedHash === hash;
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = await generateJWT(user[0].id, user[0].email);

  return { token, user: user[0] };
};

export default {
  registerUser,
  loginUser,
};