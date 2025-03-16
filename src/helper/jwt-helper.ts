import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../../.env');

config({ path: envPath });

const JWT_SECRET = process.env.JWT_SECRET || 'qwqonddqwiqwh1821j31igbwiduxhn8112ex1h299qhwehq98u';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';

interface TokenPayload {
  userId: number;
  email: string;
}

export const generateJWT = (userId: number, email: string): Promise<string> => {
  const payload: TokenPayload = {
    userId,
    email,
  };

  return new Promise<string>((resolve, reject) => {
    // Import the callback type directly to avoid TypeScript errors
    const jwtSign = require('jsonwebtoken').sign;
    
    jwtSign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION },
      (err: Error | null, token: string | undefined) => {
        if (err) {
          reject(err);
        } else if (token) {
          resolve(token);
        } else {
          reject(new Error('Failed to generate token'));
        }
      }
    );
  });
};

export const verifyJWT = (token: string): JwtPayload | string => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};