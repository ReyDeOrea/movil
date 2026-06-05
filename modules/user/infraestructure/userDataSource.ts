import { supabase } from "@/lib/supabase";
import * as Crypto from "expo-crypto";
import { User } from "../domain/user";
import { UserRepository } from "../domain/userRepository";

export class SupabaseUserRepository implements UserRepository {

  async getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*");

  if (error) throw error;

  return (data ?? []) as User[];
}
  async getProfile(numUsuario: number): Promise<User | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("numusuario", numUsuario)
      .single();

    if (error || !data) return null;
   return {
  numUsuario: data.numusuario,
  nombre: data.nombre,
  email: data.email,
  telefono: data.telefono ?? "",
  password: data.password,
  imagen: data.imagen ?? "",
  numRol: data.numrol,
  numTipo: data.numtipo,
};
  }

  async updateProfile(profile: User): Promise<void> {
      console.log("ACTUALIZANDO PASSWORD:", profile.password);
    const { error } = await supabase
      .from("usuarios")
      .update({
        nombre: profile.nombre,
        email: profile.email,
        telefono: profile.telefono,
        imagen: profile.imagen,
        numrol: profile.numRol,
        numtipo: profile.numTipo,
        ...(profile.password ? { password: profile.password } : {})
      })
      .eq("numusuario", profile.numUsuario);

    if (error) throw error;
  }

  async createProfile(profile: User): Promise<void> {
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      profile.password
    );

    const { error } = await supabase
      .from("usuarios")
      .insert([
        {
          ...profile,
          password: hashedPassword
        }
      ]);

    if (error) throw error;
  }

  async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !data) return null;

    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    console.log("Password ingresada:", password);
console.log("Hash generado:", passwordHash);
console.log("Hash BD:", data.password);

    if (passwordHash !== data.password) return null;

    return {
      numUsuario: data.numusuario,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono ?? "",
      password: data.password,
      imagen: data.imagen ?? "",
      numRol: data.numrol,
      numTipo: data.numtipo
    };
  }

  async verifyUserEmail(nombre: string, email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("nombre", nombre.trim())
      .eq("email", email.trim())
      .single();

    if (error || !data) return null;

  const user = {
    numUsuario: data.numusuario,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono ?? "",
    password: data.password,
    imagen: data.imagen ?? "",
    numRol: data.numrol,
    numTipo: data.numtipo,
  };

  console.log("VERIFY RETURN:", user);

  return user;
}

  async checkIfProfileExists(numUsuario: number): Promise<boolean> {
    const { data } = await supabase
      .from("usuarios")
      .select("numusuario")
      .eq("numusuario", numUsuario)
      .single();

    return !!data;
  }

  async deleteUser(numUsuario: number): Promise<boolean> {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("numusuario", numUsuario);

    return !error;
  }

  async createUserProfile(
  numUsuario: number,
  nombre?: string,
  telefono?: string
): Promise<void> {
  const { error } = await supabase
    .from("usuarios")
    .insert([
      {
        numusuario: numUsuario,
        nombre: nombre ?? "",
        telefono: telefono ?? "",
        email: "",
        password: "",
        imagen: null,
        numrol: 2,
        numtipo: 1,
      },
    ]);

  if (error) throw error;
}
  async resetPassword(email: string): Promise<void> {
    throw new Error("No implementado en este sistema sin Auth");
  }
}