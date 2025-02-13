import { pool } from '../db';

export interface User {
  id: number;
  email: string;
  password: string;
  created_at: Date;
  digital_activated?: boolean;
  name?: string;
}

export class UserStore {
  static async findByEmail(email: string): Promise<User | null> {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows.length > 0 ? (res.rows[0] as User) : null;
  }

  static async create(email: string, password: string): Promise<User | null> {
    try {
      const res = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
        [email, password]
      );
      return res.rows[0] as User;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async updatePassword(email: string, newPassword: string): Promise<boolean> {
    try {
      const res = await pool.query('UPDATE users SET password = $1 WHERE email = $2', [newPassword, email]);
      return (res.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  // Новый метод для активации цифрового продукта
  static async activateDigitalProduct(email: string, name: string): Promise<boolean> {
    try {
      const res = await pool.query(
        'UPDATE users SET digital_activated = true, name = $1 WHERE email = $2',
        [name, email]
      );
      return (res.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error activating digital product for user:', error);
      return false;
    }
  }
}