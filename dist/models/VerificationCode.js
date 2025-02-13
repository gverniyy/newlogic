"use strict";
// src/models/VerificationCode.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationCodeStore = void 0;
class VerificationCodeStore {
    static create(email, code, purpose, expiresAt) {
        const newCode = {
            id: this.idCounter++,
            email,
            code,
            purpose,
            expiresAt,
        };
        this.codes.push(newCode);
        return newCode;
    }
    static find(email, code, purpose) {
        return this.codes.find(c => c.email === email && c.code === code && c.purpose === purpose);
    }
    static delete(id) {
        const index = this.codes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.codes.splice(index, 1);
            return true;
        }
        return false;
    }
}
exports.VerificationCodeStore = VerificationCodeStore;
VerificationCodeStore.codes = [];
VerificationCodeStore.idCounter = 1;
