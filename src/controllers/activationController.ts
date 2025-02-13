// src/controllers/activationController.ts
import { Request, Response } from 'express';
import { UserStore } from '../models/User';
import { ActivationRequestStore } from '../models/ActivationRequest';

export class ActivationController {
  static async activateProduct(req: Request, res: Response) {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email и имя обязательны.' });
    }

    // Проверяем, существует ли уже пользователь с таким email
    const user = await UserStore.findByEmail(email);
    if (user) {
      // Если пользователь существует, обновляем его запись, активируя цифровой продукт.
      // Предполагается, что в вашей модели пользователя есть поле digital_activated и поле name.
      const updateRes = await UserStore.activateDigitalProduct(email, name);
      if (updateRes) {
        return res.json({ message: 'Цифровой продукт успешно активирован для существующего пользователя.' });
      } else {
        return res.status(500).json({ error: 'Ошибка при активации продукта.' });
      }
    } else {
      // Если пользователя нет, создаём временную запись
      const activationRequest = await ActivationRequestStore.create(email, name);
      if (activationRequest) {
        return res.json({
          message:
            'Запрос на активацию успешно получен. Для просмотра дополнительного контента, пожалуйста, зарегистрируйтесь.',
        });
      } else {
        return res.status(500).json({ error: 'Ошибка при создании запроса на активацию.' });
      }
    }
  }
}