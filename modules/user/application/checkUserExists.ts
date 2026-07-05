import { ApiFastUserRepository } from "../infraestructure/userDataSource";

export const checkUserExists = async (
  numUsuario: string,
  email: string,
  nombre: string,
  telefono: string
) => {
  const repository = new ApiFastUserRepository();
  const users = await repository.getUsers();

  const cleanNumUsuario = Number(numUsuario.trim());
  const cleanEmail = email.trim().toLowerCase();
  const cleanNombre = nombre.trim().toLowerCase();
  const cleanTelefono = telefono.trim();

  if (users.some((user) => Number(user.numUsuario) === cleanNumUsuario)) {
    throw new Error("El número de trabajador ya existe");
  }

  if (
    users.some(
      (user) => user.email.trim().toLowerCase() === cleanEmail
    )
  ) {
    throw new Error("Este correo electrónico ya está registrado");
  }

  if (
    users.some(
      (user) => user.telefono.trim() === cleanTelefono
    )
  ) {
    throw new Error("Este número de celular ya está registrado");
  }

  if (
    users.some(
      (user) => user.nombre.trim().toLowerCase() === cleanNombre
    )
  ) {
    throw new Error("Este nombre de trabajador ya existe");
  }
};