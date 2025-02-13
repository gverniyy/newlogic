"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivationRequestStore = void 0;
// src/models/ActivationRequest.ts
const db_1 = require("../db");
class ActivationRequestStore {
    // Создание нового запроса на активацию
    static async create(email, name) {
        try {
            const res = await db_1.pool.query('INSERT INTO activation_requests (email, name) VALUES ($1, $2) RETURNING *', [email, name]);
            return res.rows[0];
        }
        catch (error) {
            console.error('Error creating activation request:', error);
            return null;
        }
    }
    // Поиск запроса по email
    static async find(email) {
        try {
            const res = await db_1.pool.query('SELECT * FROM activation_requests WHERE email = $1 LIMIT 1', [email]);
            if (res.rows.length > 0) {
                return res.rows[0];
            }
            return null;
        }
        catch (error) {
            console.error('Error finding activation request:', error);
            return null;
        }
    }
    // Удаление запроса по id
    static async delete(id) {
        try {
            const res = await db_1.pool.query('DELETE FROM activation_requests WHERE id = $1', [id]);
            return res.rowCount > 0;
        }
        catch (error) {
            console.error('Error deleting activation request:', error);
            return false;
        }
    }
}
exports.ActivationRequestStore = ActivationRequestStore;
