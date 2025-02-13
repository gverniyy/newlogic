// src/services/emailService.ts

export class EmailService {
    static sendEmail(toEmail: string, subject: string, body: string): void {
      console.log(`Sending email to ${toEmail} with subject "${subject}" and body: ${body}`);
      // В production‑версии подключите реальный email‑сервис (например, SMTP, SendGrid и т.д.)
    }
  }