import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../domain/user";

export const updateUser = async (
  user: User,
  updates: {
    nombre: string;
    email: string;
    telefono: string;
  }
): Promise<User> => {

  const { error } = await supabase
    .from("usuarios")
    .update({
      nombre: updates.nombre,
      email: updates.email,
      telefono: updates.telefono,
    })
    .eq("numusuario", user.numUsuario);

  if (error) {
    console.log("ERROR updateUserProfile:", error);
    throw error;
  }

  const updatedUser: User = {
    ...user,
    nombre: updates.nombre,
    email: updates.email,
    telefono: updates.telefono,
  };

  await AsyncStorage.setItem(
    "user",
    JSON.stringify(updatedUser)
  );

  return updatedUser;
};