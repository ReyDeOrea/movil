import { User } from "./user";

export interface UserRepository {

  getUsers(): Promise<User[]>;
  getUserById(numUsuario: number): Promise<User | null>;
updateUser(user: User): Promise<void>;

  getProfile(numUsuario: number): Promise<User | null>;

  createProfile(profile: User): Promise<void>;
  checkIfProfileExists(numUsuario: number): Promise<boolean>;

  updateProfile(profile: User): Promise<void>;

  login(email: string, password: string): Promise<User | null>;
  verifyUserEmail(nombre: string, email: string): Promise<User | null>;

  createUserProfile(
    numUsuario: number,
    nombre?: string,
    telefono?: string
  ): Promise<void>;
  resetPassword(email: string): Promise<void>;

  deleteUser(numUsuario: number): Promise<boolean>;

}