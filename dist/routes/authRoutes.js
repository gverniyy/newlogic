"use strict";
// src/routes/authRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/send-registration-code', authController_1.AuthController.sendRegistrationCode);
router.post('/verify-registration-code', authController_1.AuthController.verifyRegistrationCode);
router.post('/login', authController_1.AuthController.login);
router.post('/send-password-reset-code', authController_1.AuthController.sendPasswordResetCode);
router.post('/reset-password', authController_1.AuthController.resetPassword);
exports.default = router;
