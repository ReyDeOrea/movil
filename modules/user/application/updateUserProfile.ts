import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../domain/user";
import { ApiFastUserRepository } from "../infraestructure/userDataSource";

export const updateUserProfile = async (
  user: User,
  updates: {
    email: string;
    telefono: string;
    imagen?: string;
  }
): Promise<User> => {
  const repository = new ApiFastUserRepository();

  const updatedUser: User = {
    ...user,
    email: updates.email,
    telefono: updates.telefono,
    imagen: updates.imagen ?? user.imagen,
  };

  await repository.updateProfile(updatedUser);

  await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

  return updatedUser;
};
