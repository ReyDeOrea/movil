import AsyncStorage from "@react-native-async-storage/async-storage";
import { SupabaseUserRepository } from "../infraestructure/userDataSource";

const repository = new SupabaseUserRepository();

export async function loginUser(email: string, password: string) {

  const user = await repository.login(email, password);

  console.log("LOGIN RESULT:", user);

  if (!user) {
    throw new Error("Correo o contraseña incorrectos");
  }

  await AsyncStorage.setItem("user", JSON.stringify(user));

  return user;
}