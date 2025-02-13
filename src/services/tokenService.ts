// src/services/tokenService.ts

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_ISSUER = process.env.JWT_ISSUER as string;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE as string;

export class TokenService {
  static generateToken(user: User, rememberMe: boolean): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresIn = rememberMe ? 90 * 24 * 60 * 60 : 24 * 60 * 60; // 90 дней или 1 день
    const payload = {
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      iat: issuedAt,
      exp: issuedAt + expiresIn,
      sub: user.email,
      userId: user.id,
    };

    return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
  }
}