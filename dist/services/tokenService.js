"use strict";
// src/services/tokenService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;
class TokenService {
    static generateToken(user, rememberMe) {
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
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
    }
}
exports.TokenService = TokenService;
