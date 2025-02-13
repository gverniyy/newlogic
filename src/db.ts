// src/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Подгружает переменные из .env

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});