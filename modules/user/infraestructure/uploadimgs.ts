import { api } from "@/lib/api";
import { User } from "../domain/user";
import { ApiFastUserRepository } from "./userDataSource";

export async function ImgUsers(): Promise<string[]> {
  try {
    const response = await api.get<string[]>("/uploads/avatar");
    return response.data ?? [];
  } catch (e) {
    console.log("ERROR ImgUsers:", e);
    return [];
  }
}

export async function saveUserDB(user: Partial<User>): Promise<User | null> {
  try {
    if (!user.numUsuario) {
      throw new Error("numUsuario es obligatorio");
    }

    const repository = new ApiFastUserRepository();

    await repository.createProfile({
      numUsuario: user.numUsuario,
      nombre: user.nombre ?? "Sin nombre",
      email: user.email ?? "",
      telefono: user.telefono ?? "",
      password: user.password ?? "",
      imagen: user.imagen ?? "",
      numRol: user.numRol ?? 2,
      numTipo: user.numTipo ?? 1,
    });

    return await repository.getUserById(user.numUsuario);
  } catch (e) {
    console.log("ERROR saveUserDB:", e);
    return null;
  }
}

export async function saveAvatar(file: { uri: string }): Promise<string | null> {
  try {
    if (!file?.uri) throw new Error("No file URI provided");

    const fileExt = file.uri.split(".").pop() ?? "jpg";
    const fileName = `avatar_${Date.now()}.${fileExt}`;

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: fileName,
      type: "image/jpeg",
    } as any);

    const response = await api.post("/uploads/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
    });

    return response.data.path ?? response.data.url;
  } catch (e) {
    console.log("ERROR saveAvatar:", e);
    return null;
  }
}
