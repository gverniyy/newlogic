"use strict";
// src/controllers/authController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const VerificationCode_1 = require("../models/VerificationCode");
const emailService_1 = require("../services/emailService");
const tokenService_1 = require("../services/tokenService");
const SALT_ROUNDS = 10;
class AuthController {
    static async sendRegistrationCode(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email обязателен.' });
        }
        const existingUser = User_1.UserStore.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Этот email уже зарегистрирован. Пожалуйста, используйте функцию входа.' });
        }
        // Генерация 4-значного кода
        const code = (Math.floor(Math.random() * 9000) + 1000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
        VerificationCode_1.VerificationCodeStore.create(email, code, 'Registration', expiresAt);
        emailService_1.EmailService.sendEmail(email, 'Код регистрации', `Ваш код регистрации: ${code}`);
        return res.json({ message: 'Код регистрации отправлен на вашу почту.' });
    }
    static async verifyRegistrationCode(req, res) {
        const { email, code, password } = req.body;
        if (!email || !code || !password) {
            return res.status(400).json({ error: 'Все поля обязательны.' });
        }
        const verification = VerificationCode_1.VerificationCodeStore.find(email, code, 'Registration');
        if (!verification || verification.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Неверный или истекший код.' });
        }
        // Хэширование пароля
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const newUser = User_1.UserStore.create(email, hashedPassword);
        // Удаляем использованный код
        VerificationCode_1.VerificationCodeStore.delete(verification.id);
        // При регистрации автоматический вход с rememberMe = true
        const token = tokenService_1.TokenService.generateToken(newUser, true);
        return res.json({ message: 'Регистрация успешна.', token });
    }
    static async login(req, res) {
        const { email, password, rememberMe } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны.' });
        }
        const user = User_1.UserStore.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Неверный email или пароль.' });
        }
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ error: 'Неверный email или пароль.' });
        }
        const token = tokenService_1.TokenService.generateToken(user, rememberMe);
        return res.json({ message: 'Вход выполнен успешно.', token });
    }
    static async sendPasswordResetCode(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email обязателен.' });
        }
        const user = User_1.UserStore.findByEmail(email);
        if (!user) {
            // Не выдаём информацию о том, существует ли пользователь
            return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
        }
        const code = (Math.floor(Math.random() * 9000) + 1000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
        VerificationCode_1.VerificationCodeStore.create(email, code, 'PasswordReset', expiresAt);
        emailService_1.EmailService.sendEmail(email, 'Код восстановления пароля', `Ваш код восстановления: ${code}`);
        return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
    }
    static async resetPassword(req, res) {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Все поля обязательны.' });
        }
        const verification = VerificationCode_1.VerificationCodeStore.find(email, code, 'PasswordReset');
        if (!verification || verification.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Неверный или истекший код.' });
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
        const success = User_1.UserStore.updatePassword(email, hashedPassword);
        if (!success) {
            return res.status(400).json({ error: 'Пользователь не найден.' });
        }
        VerificationCode_1.VerificationCodeStore.delete(verification.id);
        return res.json({ message: 'Пароль успешно сброшен. Теперь вы можете войти в аккаунт.' });
    }
}
exports.AuthController = AuthController;
