// src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserStore } from '../models/User';
import { VerificationCodeStore } from '../models/VerificationCode';
import { EmailService } from '../services/emailService';
import { TokenService } from '../services/tokenService';
import { ActivationRequestStore } from '../models/ActivationRequest';

const SALT_ROUNDS = 10;

export class AuthController {
  static async sendRegistrationCode(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email обязателен.' });
      }

      const existingUser = await UserStore.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Этот email уже зарегистрирован. Пожалуйста, используйте функцию входа.' });
      }

      // Генерация 4-значного кода
      const code = (Math.floor(Math.random() * 9000) + 1000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

      await VerificationCodeStore.create(email, code, 'Registration', expiresAt);
      EmailService.sendEmail(email, 'Код регистрации', `Ваш код регистрации: ${code}`);

      return res.json({ message: 'Код регистрации отправлен на вашу почту.' });
    } catch (error) {
      console.error('Ошибка при отправке кода регистрации:', error);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }

  static async verifyRegistrationCode(req: Request, res: Response) {
    try {
      const { email, code, password } = req.body;
      if (!email || !code || !password) {
        return res.status(400).json({ error: 'Все поля обязательны.' });
      }

      const verification = await VerificationCodeStore.find(email, code, 'Registration');
      if (!verification || new Date(verification.expiresAt) < new Date()) {
        return res.status(400).json({ error: 'Неверный или истекший код.' });
      }

      // Хэширование пароля
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = await UserStore.create(email, hashedPassword);
      if (!newUser) {
        return res.status(500).json({ error: 'Ошибка при регистрации.' });
      }

      // Интеграция: проверяем наличие запроса на активацию для данного email
      const activationRequest = await ActivationRequestStore.find(email);
      if (activationRequest) {
        // Активируем цифровой продукт для пользователя
        await UserStore.activateDigitalProduct(email, activationRequest.name);
        // Удаляем запись из activation_requests
        await ActivationRequestStore.delete(activationRequest.id);
      }

      // Удаляем использованный код
      await VerificationCodeStore.delete(verification.id);

      // Генерируем JWT-токен для автоматического входа (rememberMe = true)
      const token = TokenService.generateToken(newUser, true);

      return res.json({ message: 'Регистрация успешна.', token });
    } catch (error) {
      console.error('Ошибка при проверке кода регистрации:', error);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны.' });
      }

      const user = await UserStore.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Неверный email или пароль.' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: 'Неверный email или пароль.' });
      }

      const token = TokenService.generateToken(user, rememberMe);
      return res.json({ message: 'Вход выполнен успешно.', token });
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }

  static async sendPasswordResetCode(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email обязателен.' });
      }

      const user = await UserStore.findByEmail(email);
      if (!user) {
        // Не выдаём информацию о том, существует ли пользователь
        return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
      }

      const code = (Math.floor(Math.random() * 9000) + 1000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

      await VerificationCodeStore.create(email, code, 'PasswordReset', expiresAt);
      EmailService.sendEmail(email, 'Код восстановления пароля', `Ваш код восстановления: ${code}`);

      return res.json({ message: 'Если этот email зарегистрирован, код восстановления отправлен.' });
    } catch (error) {
      console.error('Ошибка при отправке кода восстановления пароля:', error);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Все поля обязательны.' });
      }

      const verification = await VerificationCodeStore.find(email, code, 'PasswordReset');
      if (!verification || new Date(verification.expiresAt) < new Date()) {
        return res.status(400).json({ error: 'Неверный или истекший код.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      const success = await UserStore.updatePassword(email, hashedPassword);
      if (!success) {
        return res.status(400).json({ error: 'Пользователь не найден.' });
      }

      await VerificationCodeStore.delete(verification.id);
      return res.json({ message: 'Пароль успешно сброшен. Теперь вы можете войти в аккаунт.' });
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }
}