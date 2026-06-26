import { api } from "@/lib/api";
import * as Crypto from "expo-crypto";
import { User } from "../domain/user";
import { UserRepository } from "../domain/userRepository";

type UsuarioApi = {
  numusuario: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  password: string;
  imagen?: string | null;
  numrol: number;
  numtipo: number;
};

const toDomain = (item: UsuarioApi): User => ({
  numUsuario: item.numusuario,
  nombre: item.nombre,
  email: item.email ?? "",
  telefono: item.telefono ?? "",
  password: item.password ?? "",
  imagen: item.imagen ?? "",
  numRol: item.numrol,
  numTipo: item.numtipo,
});

const toApiCreate = (user: User) => ({
  numusuario: user.numUsuario,
  nombre: user.nombre,
  email: user.email.trim().toLowerCase(),
  telefono: user.telefono,
  password: user.password,
  imagen: user.imagen ?? null,
  numrol: user.numRol,
  numtipo: user.numTipo,
});

const toApiUpdate = (user: User) => ({
  nombre: user.nombre,
  email: user.email.trim().toLowerCase(),
  telefono: user.telefono,
  password: user.password,
  imagen: user.imagen ?? null,
  numrol: user.numRol,
  numtipo: user.numTipo,
});

export class ApiFastUserRepository implements UserRepository {
  async getUsers(): Promise<User[]> {
    const response = await api.get<UsuarioApi[]>("/usuarios/");
    return (response.data ?? []).map(toDomain);
  }

  async getProfile(numUsuario: number): Promise<User | null> {
    return this.getUserById(numUsuario);
  }

  async getUserById(numUsuario: number): Promise<User | null> {
    try {
      const response = await api.get<UsuarioApi>(`/usuarios/${numUsuario}`);
      return toDomain(response.data);
    } catch {
      return null;
    }
  }

  async updateProfile(profile: User): Promise<void> {
    await api.put(`/usuarios/${profile.numUsuario}`, toApiUpdate(profile));
  }

  async updateUser(user: User): Promise<void> {
    await api.put(`/usuarios/${user.numUsuario}`, toApiUpdate(user));
  }

  async createProfile(profile: User): Promise<void> {
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      profile.password
    );

    await api.post("/usuarios/", {
      ...toApiCreate(profile),
      password: hashedPassword,
    });
  }

  async login(email: string, password: string): Promise<User | null> {
    const users = await this.getUsers();
    const user = users.find(
      (item) => item.email.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) return null;

    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    if (passwordHash !== user.password) return null;

    return user;
  }

  async verifyUserEmail(nombre: string, email: string): Promise<User | null> {
    const users = await this.getUsers();

    return (
      users.find(
        (user) =>
          user.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
          user.email.trim().toLowerCase() === email.trim().toLowerCase()
      ) ?? null
    );
  }

  async checkIfProfileExists(numUsuario: number): Promise<boolean> {
    const user = await this.getUserById(numUsuario);
    return !!user;
  }

  async deleteUser(numUsuario: number): Promise<boolean> {
    try {
      await api.delete(`/usuarios/${numUsuario}`);
      return true;
    } catch {
      return false;
    }
  }

  async createUserProfile(
    numUsuario: number,
    nombre?: string,
    telefono?: string
  ): Promise<void> {
    await api.post("/usuarios/", {
      numusuario: numUsuario,
      nombre: nombre ?? "",
      telefono: telefono ?? "",
      email: "",
      password: "",
      imagen: null,
      numrol: 2,
      numtipo: 1,
    });
  }

  async resetPassword(email: string): Promise<void> {
    throw new Error("No implementado en este sistema sin Auth");
  }
}

export class SupabaseUserRepository extends ApiFastUserRepository {}
