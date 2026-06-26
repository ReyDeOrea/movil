import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../domain/user";
import { ApiFastUserRepository } from "../infraestructure/userDataSource";

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  const repository = new ApiFastUserRepository();
  const user = await repository.login(email, password);

  if (!user) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  await AsyncStorage.setItem("user", JSON.stringify(user));
  return user;
};
