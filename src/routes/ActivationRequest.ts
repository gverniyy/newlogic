// src/models/ActivationRequest.ts
import { pool } from '../db';

export interface ActivationRequest {
  id: number;
  email: string;
  name: string;
  requested_at: Date;
}

export class ActivationRequestStore {
  // Создание нового запроса на активацию
  static async create(email: string, name: string): Promise<ActivationRequest | null> {
    try {
      const res = await pool.query(
        'INSERT INTO activation_requests (email, name) VALUES ($1, $2) RETURNING *',
        [email, name]
      );
      return res.rows[0] as ActivationRequest;
    } catch (error) {
      console.error('Error creating activation request:', error);
      return null;
    }
  }

  // Поиск запроса по email
  static async find(email: string): Promise<ActivationRequest | null> {
    try {
      const res = await pool.query(
        'SELECT * FROM activation_requests WHERE email = $1 LIMIT 1',
        [email]
      );
      if (res.rows.length > 0) {
        return res.rows[0] as ActivationRequest;
      }
      return null;
    } catch (error) {
      console.error('Error finding activation request:', error);
      return null;
    }
  }

  // Удаление запроса по id
  static async delete(id: number): Promise<boolean> {
    try {
      const res = await pool.query('DELETE FROM activation_requests WHERE id = $1', [id]);
      return res.rowCount > 0;
    } catch (error) {
      console.error('Error deleting activation request:', error);
      return false;
    }
  }
}