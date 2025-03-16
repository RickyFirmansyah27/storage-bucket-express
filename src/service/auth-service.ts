import { getUserByEmail, createUser } from './user-service';
import { password } from "bun";
import { generateJWT } from '../helper/jwt-helper';

const registerUser = async (name: string, email: string, passwordRaw: string) => {
  const [existingUser] = await getUserByEmail(email);

  console.log('existingUser', existingUser);
  if (existingUser) {
    throw new Error('Email is already taken');
  }

  const hashedPassword = await password.hash(passwordRaw);

  const { user } = await createUser(name, email, hashedPassword);

  return { user };
};

const loginUser = async (email: string, passwordRaw: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  // Verifikasi password
  const isPasswordValid = await password.verify(passwordRaw, user[0].password);
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
