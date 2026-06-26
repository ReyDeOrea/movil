import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../domain/user";
import { ApiFastUserRepository } from "../infraestructure/userDataSource";

export const updateUser = async (
  user: User,
  updates: {
    nombre: string;
    email: string;
    telefono: string;
  }
): Promise<User> => {
  const repository = new ApiFastUserRepository();

  const updatedUser: User = {
    ...user,
    nombre: updates.nombre,
    email: updates.email,
    telefono: updates.telefono,
  };

  await repository.updateUser(updatedUser);

  await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

  return updatedUser;
};
