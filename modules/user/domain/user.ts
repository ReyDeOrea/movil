export interface User {

  id: string;
  nombre: string;
  num_trabajador: string;
  area_id: string;
  rol_id: string;
  email: string;
  telefono: string;
  contrasena: string;
  tipo_trabajador_id: string;
  created_at: string;
  rol?: string;
  area?: string;
}