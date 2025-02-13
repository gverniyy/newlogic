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
const ActivationRequest_1 = require("../models/ActivationRequest");
const SALT_ROUNDS = 10;
class AuthController {
    static async sendRegistrationCode(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email обязателен.' });
            }
            const existingUser = await User_1.UserStore.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Этот email уже зарегистрирован. Пожалуйста, используйте функцию входа.' });
            }
            // Генерация 4-значного кода
            const code = (Math.floor(Math.random() * 9000) + 1000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
            await VerificationCode_1.VerificationCodeStore.create(email, code, 'Registration', expiresAt);
            emailService_1.EmailService.sendEmail(email, 'Код регистрации', `Ваш код регистрации: ${code}`);
            return res.json({ message: 'Код регистрации отправлен на вашу почту.' });
        }
        catch (error) {
            console.error('Ошибка при отправке кода регистрации:', error);
            return res.status(500).json({ error: 'Ошибка сервера.' });
        }
    }
    static async verifyRegistrationCode(req, res) {
        try {
            const { email, code, password } = req.body;
            if (!email || !code || !password) {
                return res.status(400).json({ error: 'Все поля обязательны.' });
            }
            const verification = await VerificationCode_1.VerificationCodeStore.find(email, code, 'Registration');
            if (!verification || new Date(verification.expiresAt) < new Date()) {
                return res.status(400).json({ error: 'Неверный или истекший код.' });
            }
            // Хэширование пароля
            const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
            const newUser = await User_1.UserStore.create(email, hashedPassword);
            if (!newUser) {
                return res.status(500).json({ error: 'Ошибка при регистрации.' });
            }
            // Интеграция: проверяем наличие запроса на активацию для данного email
            const activationRequest = await ActivationRequest_1.ActivationRequestStore.find(email);
            if (activationRequest) {
                // Активируем цифровой продукт для пользователя
                await User_1.UserStore.activateDigitalProduct(email, activationRequest.name);
                // Удаляем запись из activation_requests
                await ActivationRequest_1.ActivationRequestStore.delete(activationRequest.id);
            }
            // Удаляем использованный код
            await VerificationCode_1.VerificationCodeStore.delete(verification.id);
            // Генерируем JWT-токен для автоматического входа (rememberMe = true)
            const token = tokenService_1.TokenService.generateToken(newUser, true);
            return res.json({ message: 'Регистрация успешна.', token });
        }
        catch (error) {
            console.error('Ошибка при проверке кода регистрации:', error);
            return res.status(500).json({ error: 'Ошибка сервера.' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password, rememberMe } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email и пароль обязательны.' });
            }
            const user = await User_1.UserStore.findByEmail(email);
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
        catch (error) {
            console.error('Ошибка при входе:', error);
            return res.status(500).json({ error: 'Ошибка сервера.' });
        }
    }
    static async sendPasswordResetCode(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email обязателен.' });
            }
            const user = await User_1.UserStore.findByEmail(email);
            if (!user) {
                // Не выдаём информацию о том, существует ли пользователь
                return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
            }
            const code = (Math.floor(Math.random() * 9000) + 1000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
            await VerificationCode_1.VerificationCodeStore.create(email, code, 'PasswordReset', expiresAt);
            emailService_1.EmailService.sendEmail(email, 'Код восстановления пароля', `Ваш код восстановления: ${code}`);
            return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
        }
        catch (error) {
            console.error('Ошибка при отправке кода восстановления пароля:', error);
            return res.status(500).json({ error: 'Ошибка сервера.' });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email, code, newPassword } = req.body;
            if (!email || !code || !newPassword) {
                return res.status(400).json({ error: 'Все поля обязательны.' });
            }
            const verification = await VerificationCode_1.VerificationCodeStore.find(email, code, 'PasswordReset');
            if (!verification || new Date(verification.expiresAt) < new Date()) {
                return res.status(400).json({ error: 'Неверный или истекший код.' });
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
            const success = await User_1.UserStore.updatePassword(email, hashedPassword);
            if (!success) {
                return res.status(400).json({ error: 'Пользователь не найден.' });
            }
            await VerificationCode_1.VerificationCodeStore.delete(verification.id);
            return res.json({ message: 'Пароль успешно сброшен. Теперь вы можете войти в аккаунт.' });
        }
        catch (error) {
            console.error('Ошибка при сбросе пароля:', error);
            return res.status(500).json({ error: 'Ошибка сервера.' });
        }
    }
}
exports.AuthController = AuthController;
