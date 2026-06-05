import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { User } from "../domain/user";

export const loginUser = async (email: string, password: string): Promise<User> => {
  console.log("EMAIL RECIBIDO:", email);
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email.trim())
    .single();


  if (error || !data) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const passwordHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );

 console.log("PASSWORD INGRESADA:", password);
  console.log("HASH GENERADO:", passwordHash);
  console.log("HASH BD:", data.password);

  if (passwordHash !== data.password) {
    throw new Error("Usuario o contraseña incorrectos");
  }
   
  const user: User = {
    numUsuario: data.numusuario,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono ?? "",
    password: data.password,
    imagen: data.imagen ?? "",
    numRol: data.numrol,
    numTipo: data.numtipo,
  };

  await AsyncStorage.setItem("user", JSON.stringify(user));

  return user;
};
