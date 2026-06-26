import { api } from "./api";

export const obtenerUsuarios = async () => {
  const response = await api.get("/usuarios");
  return response.data;
};