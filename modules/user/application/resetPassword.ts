import * as Crypto from 'expo-crypto';
import { User } from '../domain/user';
import { UserRepository } from "../domain/userRepository";


interface ResetPassword {
  user: User;
  newPassword: string;
  confirmPassword: string;
}

export class ResetPasswordUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute({ user, newPassword, confirmPassword }: ResetPassword) {

    if (!newPassword || !confirmPassword) {
      throw new Error("Todos los campos son obligatorios");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }

      const newHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      newPassword
    );

     if (newHash === user.password) {
      throw new Error("La nueva contraseña no puede ser igual a la anterior");
    }


    if (newPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    console.log("usuarios:", user);
console.log("numusuario:", user.numUsuario);

 await this.userRepo.updateProfile({ ...user, password: newHash });  }
}