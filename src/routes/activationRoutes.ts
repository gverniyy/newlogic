// src/routes/activationRoutes.ts
import { Router } from 'express';
import { ActivationController } from '../controllers/activationController';

const router = Router();

router.post('/activation', ActivationController.activateProduct);

export default router;