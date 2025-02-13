"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/activationRoutes.ts
const express_1 = require("express");
const activationController_1 = require("../controllers/activationController");
const router = (0, express_1.Router)();
router.post('/activation', activationController_1.ActivationController.activateProduct);
exports.default = router;
