import { ApiFastUserRepository } from "../infraestructure/userDataSource";

export const registerUser = async (data: {
  numUsuario: number;
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  numRol: number;
  numTipo: number;
  imagen?: string;
}) => {
  const repository = new ApiFastUserRepository();

  await repository.createProfile({
    numUsuario: data.numUsuario,
    nombre: data.nombre,
    email: data.email,
    password: data.password,
    telefono: data.telefono,
    numRol: data.numRol,
    numTipo: data.numTipo,
    imagen: data.imagen ?? "",
  });

  return true;
};
