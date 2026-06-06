import { User } from "../domain/user";
import { UserRepository } from "../domain/userRepository";

export class GetUserByIdUseCase {

  constructor(
    private userRepository: UserRepository
  ) {}

  async execute(
    numUsuario: number
  ): Promise<User | null> {

    if (!numUsuario) {
      throw new Error("ID de usuario inválido");
    }

    return await this.userRepository.getUserById(
      numUsuario
    );
  }
}