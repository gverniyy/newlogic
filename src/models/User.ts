// src/models/User.ts

export interface User {
    id: number;
    email: string;
    password: string; // хэшированный пароль
    createdAt: Date;
  }
  
  export class UserStore {
    private static users: User[] = [];
    private static idCounter = 1;
  
    static findByEmail(email: string): User | undefined {
      return this.users.find(u => u.email === email);
    }
  
    static create(email: string, password: string): User {
      const newUser: User = {
        id: this.idCounter++,
        email,
        password,
        createdAt: new Date(),
      };
      this.users.push(newUser);
      return newUser;
    }
  
    static updatePassword(email: string, newPassword: string): boolean {
      const user = this.findByEmail(email);
      if (!user) return false;
      user.password = newPassword;
      return true;
    }
  }

  // src/routes/activationRoutes.ts
import { Router } from 'express';
import { ActivationController } from '../controllers/activationController';

const router = Router();

router.post('/activation', ActivationController.activateProduct);

export default router;