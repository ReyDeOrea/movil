const checkUserNameExistsUpdate = async (
  nombre: string,
  numUsuario: number
) => {
  const { ApiFastUserRepository } = await import(
    "../infraestructure/userDataSource"
  );

  const repository = new ApiFastUserRepository();
  const users = await repository.getUsers();

  const cleanNombre = nombre.trim().toLowerCase();
  const currentId = Number(numUsuario);

  const existingUser = users.find(
    (user) =>
      (user.nombre ?? "").trim().toLowerCase() === cleanNombre &&
      Number(user.numUsuario) !== currentId
  );

  if (existingUser) {
    throw new Error(
      "Ya existe un usuario registrado con ese nombre"
    );
  }
};

export default checkUserNameExistsUpdate;
