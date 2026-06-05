import { User } from "../domain/user";
import { UserRepository } from "../domain/userRepository";

export class VerifyUserUseCase {
    constructor(private userRepo: UserRepository) { }

    async execute(username: string, email: string): Promise<User> {
        if (!username || !email) {
            throw new Error("Todos los campos son obligatorios");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Correo inválido");
        }

        const user = await this.userRepo.verifyUserEmail(username, email);
        if (!user) {
            throw new Error("Usuario o correo incorrectos");
        }
        return user;
    }
}