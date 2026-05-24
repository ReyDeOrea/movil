import { supabase } from "@/lib/supabase";
import { User } from "../domain/user";
import { UserRepository } from "../domain/userRepository";

export class SupabaseUserRepository implements UserRepository {
  getProfile(id: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  updateProfile(profile: User): Promise<void> {
    throw new Error("Method not implemented.");
  }
  createProfile(profile: User): Promise<void> {
    throw new Error("Method not implemented.");
  }
  verifyUserEmail(username: string, email: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  checkIfProfileExists(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  createUserProfile(id: string, username?: string, phone?: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resetPassword(email: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async login(email: string, password: string): Promise<User | null> {

    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        *,
        roles:roles(rol),
        areas:areas(nombre)
      `)
      .eq("email", email.trim())
      .eq("contrasena", password)
      .single();

    if (error || !data) {
      console.log("LOGIN ERROR:", error);
      return null;
    }

    return {
      id: data.id,
      nombre: data.nombre,
      num_trabajador: data.num_trabajador,
      area_id: data.area_id,
      rol_id: data.rol_id,
      email: data.email,
      telefono: data.telefono,
      contrasena: data.contrasena,
      tipo_trabajador_id: data.tipo_trabajador_id,
      created_at: data.created_at,
      rol: data.roles?.rol,
      area: data.areas?.nombre,
    };
  }

  async getUserById(id: string): Promise<User | null> {

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return data as User;
  }
}