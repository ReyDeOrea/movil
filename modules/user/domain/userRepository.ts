import { User } from "./user";

export interface UserRepository {
  getProfile(id: string): Promise<User | null>;
  updateProfile(profile: User): Promise<void>;

  createProfile(profile: User): Promise<void>;
  login(email: string, password: string): Promise<User | null>;
  verifyUserEmail(username: string, email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;

   checkIfProfileExists(id: string): Promise<boolean>;

  createUserProfile(id: string, username?: string, phone?: string): Promise<void>;

   resetPassword(email: string): Promise<void>;
}