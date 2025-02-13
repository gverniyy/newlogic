// src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserStore } from '../models/User';
import { VerificationCodeStore } from '../models/VerificationCode';
import { EmailService } from '../services/emailService';
import { TokenService } from '../services/tokenService';

const SALT_ROUNDS = 10;

export class AuthController {
  static async sendRegistrationCode(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email обязателен.' });
    }

    const existingUser = UserStore.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Этот email уже зарегистрирован. Пожалуйста, используйте функцию входа.' });
    }

    // Генерация 4-значного кода
    const code = (Math.floor(Math.random() * 9000) + 1000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    VerificationCodeStore.create(email, code, 'Registration', expiresAt);
    EmailService.sendEmail(email, 'Код регистрации', `Ваш код регистрации: ${code}`);

    return res.json({ message: 'Код регистрации отправлен на вашу почту.' });
  }

  static async verifyRegistrationCode(req: Request, res: Response) {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ error: 'Все поля обязательны.' });
    }

    const verification = VerificationCodeStore.find(email, code, 'Registration');
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Неверный или истекший код.' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = UserStore.create(email, hashedPassword);

    // Удаляем использованный код
    VerificationCodeStore.delete(verification.id);

    // При регистрации автоматический вход с rememberMe = true
    const token = TokenService.generateToken(newUser, true);

    return res.json({ message: 'Регистрация успешна.', token });
  }

  static async login(req: Request, res: Response) {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны.' });
    }

    const user = UserStore.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Неверный email или пароль.' });
    }

    const token = TokenService.generateToken(user, rememberMe);
    return res.json({ message: 'Вход выполнен успешно.', token });
  }

  static async sendPasswordResetCode(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email обязателен.' });
    }

    const user = UserStore.findByEmail(email);
    if (!user) {
      // Не выдаём информацию о том, существует ли пользователь
      return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
    }

    const code = (Math.floor(Math.random() * 9000) + 1000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    VerificationCodeStore.create(email, code, 'PasswordReset', expiresAt);
    EmailService.sendEmail(email, 'Код восстановления пароля', `Ваш код восстановления: ${code}`);

    return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Все поля обязательны.' });
    }

    const verification = VerificationCodeStore.find(email, code, 'PasswordReset');
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Неверный или истекший код.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const success = UserStore.updatePassword(email, hashedPassword);
    if (!success) {
      return res.status(400).json({ error: 'Пользователь не найден.' });
    }

    VerificationCodeStore.delete(verification.id);
    return res.json({ message: 'Пароль успешно сброшен. Теперь вы можете войти в аккаунт.' });
  }
}