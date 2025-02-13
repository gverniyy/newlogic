"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivationController = void 0;
const User_1 = require("../models/User");
const ActivationRequest_1 = require("../models/ActivationRequest");
class ActivationController {
    static async activateProduct(req, res) {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ error: 'Email и имя обязательны.' });
        }
        // Проверяем, существует ли уже пользователь с таким email
        const user = await User_1.UserStore.findByEmail(email);
        if (user) {
            // Если пользователь существует, обновляем его запись, активируя цифровой продукт.
            // Предполагается, что в вашей модели пользователя есть поле digital_activated и поле name.
            const updateRes = await User_1.UserStore.activateDigitalProduct(email, name);
            if (updateRes) {
                return res.json({ message: 'Цифровой продукт успешно активирован для существующего пользователя.' });
            }
            else {
                return res.status(500).json({ error: 'Ошибка при активации продукта.' });
            }
        }
        else {
            // Если пользователя нет, создаём временную запись
            const activationRequest = await ActivationRequest_1.ActivationRequestStore.create(email, name);
            if (activationRequest) {
                return res.json({
                    message: 'Запрос на активацию успешно получен. Для просмотра дополнительного контента, пожалуйста, зарегистрируйтесь.',
                });
            }
            else {
                return res.status(500).json({ error: 'Ошибка при создании запроса на активацию.' });
            }
        }
    }
}
exports.ActivationController = ActivationController;
