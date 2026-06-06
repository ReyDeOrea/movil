import { User } from "../domain/user";
import { UserRepository } from "../domain/userRepository";

export class EditUserUseCase {

  constructor(
    private userRepository: UserRepository
  ) {}

  async execute(user: User): Promise<void> {

    if (!user.nombre.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    if (!user.email.trim()) {
      throw new Error("El correo es obligatorio");
    }

    const existingUser =
      await this.userRepository.getUserById(
        user.numUsuario
      );

    if (!existingUser) {
      throw new Error("El usuario no existe");
    }

    await this.userRepository.updateUser(user);
  }
}