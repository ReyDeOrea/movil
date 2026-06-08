const checkUserNameExistsUpdate = async (
  nombre: string,
  numUsuario: number
) => {

  const { SupabaseUserRepository } = await import(
    "../infraestructure/userDataSource"
  );

  const repository = new SupabaseUserRepository();

  const users = await repository.getUsers();

  const existingUser = users.find(
    (user) =>
      user.nombre.trim().toLowerCase() ===
      nombre.trim().toLowerCase() &&
      user.numUsuario !== numUsuario
  );

  if (existingUser) {
    throw new Error(
      "Ya existe un usuario registrado con ese nombre"
    );
  }
};

export default checkUserNameExistsUpdate;