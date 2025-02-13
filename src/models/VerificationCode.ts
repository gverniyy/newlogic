// src/models/VerificationCode.ts

export interface VerificationCode {
    id: number;
    email: string;
    code: string;
    purpose: 'Registration' | 'PasswordReset';
    expiresAt: Date;
  }
  
  export class VerificationCodeStore {
    private static codes: VerificationCode[] = [];
    private static idCounter = 1;
  
    static create(email: string, code: string, purpose: 'Registration' | 'PasswordReset', expiresAt: Date): VerificationCode {
      const newCode: VerificationCode = {
        id: this.idCounter++,
        email,
        code,
        purpose,
        expiresAt,
      };
      this.codes.push(newCode);
      return newCode;
    }
  
    static find(email: string, code: string, purpose: 'Registration' | 'PasswordReset'): VerificationCode | undefined {
      return this.codes.find(c => c.email === email && c.code === code && c.purpose === purpose);
    }
  
    static delete(id: number): boolean {
      const index = this.codes.findIndex(c => c.id === id);
      if (index !== -1) {
        this.codes.splice(index, 1);
        return true;
      }
      return false;
    }
  }