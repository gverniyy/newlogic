import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import activationRoutes from './routes/activationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем CORS для всех источников (или настройте, если нужно ограничить)
app.use(cors());

app.use('/api', activationRoutes);
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});