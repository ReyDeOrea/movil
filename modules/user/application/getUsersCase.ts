import { User } from "../domain/user";
import { UserRepository } from "../domain/userRepository";

export class GetUsersUseCase {

  constructor(
    private userRepository: UserRepository
  ) {}

  async execute(): Promise<User[]> {

    return await this.userRepository.getUsers();

  }
}