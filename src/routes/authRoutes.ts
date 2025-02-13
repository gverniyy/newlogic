// src/routes/authRoutes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

router.post('/send-registration-code', AuthController.sendRegistrationCode);
router.post('/verify-registration-code', AuthController.verifyRegistrationCode);
router.post('/login', AuthController.login);
router.post('/send-password-reset-code', AuthController.sendPasswordResetCode);
router.post('/reset-password', AuthController.resetPassword);

export default router;