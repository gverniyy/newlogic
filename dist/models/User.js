"use strict";
// src/models/User.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStore = void 0;
class UserStore {
    static findByEmail(email) {
        return this.users.find(u => u.email === email);
    }
    static create(email, password) {
        const newUser = {
            id: this.idCounter++,
            email,
            password,
            createdAt: new Date(),
        };
        this.users.push(newUser);
        return newUser;
    }
    static updatePassword(email, newPassword) {
        const user = this.findByEmail(email);
        if (!user)
            return false;
        user.password = newPassword;
        return true;
    }
}
exports.UserStore = UserStore;
UserStore.users = [];
UserStore.idCounter = 1;
// src/routes/activationRoutes.ts
const express_1 = require("express");
const activationController_1 = require("../controllers/activationController");
const router = (0, express_1.Router)();
router.post('/activation', activationController_1.ActivationController.activateProduct);
exports.default = router;
