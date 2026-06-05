import { supabase } from "@/lib/supabase";
import { User } from "../domain/user";


export async function ImgUsers(): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from("evidencias")
      .list("avatar");

    if (error) throw error;

    return (data || []).map(
      (item) =>
        `https://hrojphcqktmijvagyrha.supabase.co/storage/v1/object/public/evidencias/avatar/${item.name}`
    );
  } catch (e) {
    console.log("ERROR ImgUsers:", e);
    return [];
  }
}


export async function saveUserDB(user: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nombre: user.nombre ?? "Sin nombre",
          email: user.email ?? "",
          telefono: user.telefono ?? "",
          password: user.password ?? "",
          imagen: user.imagen ?? "",
          numrol: user.numRol ?? 0,
          numtipo: user.numTipo ?? 0,
        },
      ])
      .select();

    if (error) throw error;

    return data ? data[0] : null;
  } catch (e) {
    console.log("ERROR saveUserDB:", e);
    return null;
  }
}


export async function saveAvatar(file: { uri: string }): Promise<string | null> {
  try {
    if (!file?.uri) throw new Error("No file URI provided");

    const fileExt = file.uri.split(".").pop() ?? "jpeg";
    const fileName = `${Date.now()}.${fileExt}`;

    const arrayBuffer = await fetch(file.uri).then((res) =>
      res.arrayBuffer()
    );

    const { error } = await supabase.storage
      .from("evidencias")
      .upload(`avatar/${fileName}`, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("evidencias")
      .getPublicUrl(`avatar/${fileName}`);

    return `https://hrojphcqktmijvagyrha.supabase.co/storage/v1/object/public/evidencias/avatar/${fileName}`;
  } catch (e) {
    console.log("ERROR saveAvatar:", e);
    return null;
  }
}