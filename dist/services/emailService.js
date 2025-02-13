"use strict";
// src/services/emailService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
class EmailService {
    static sendEmail(toEmail, subject, body) {
        console.log(`Sending email to ${toEmail} with subject "${subject}" and body: ${body}`);
        // В production‑версии подключите реальный email‑сервис (например, SMTP, SendGrid и т.д.)
    }
}
exports.EmailService = EmailService;
