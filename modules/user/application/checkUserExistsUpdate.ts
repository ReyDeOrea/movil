import { ApiFastUserRepository } from "../infraestructure/userDataSource";

export const checkUserExistsUpdate = async (
  email: string,
  telefono: string,
  currentUserId: number
): Promise<void> => {
  const repository = new ApiFastUserRepository();
  const users = await repository.getUsers();

  const cleanEmail = email.trim().toLowerCase();
  const cleanTelefono = telefono.trim();
  const currentId = Number(currentUserId);

  if (
    cleanEmail &&
    users.some(
      (user) =>
        (user.email ?? "").trim().toLowerCase() === cleanEmail &&
        Number(user.numUsuario) !== currentId
    )
  ) {
    throw new Error("Este correo ya está registrado");
  }

  if (
    cleanTelefono &&
    users.some(
      (user) =>
        (user.telefono ?? "").trim() === cleanTelefono &&
        Number(user.numUsuario) !== currentId
    )
  ) {
    throw new Error("Este número ya está registrado");
  }
};
