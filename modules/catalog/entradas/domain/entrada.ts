export interface Entrada {
  idEntrada: string;

  numMaterial: number;
  nombreMaterial?: string;
  unidad?: string;
  stockActual?: number;

  cantidad: number;
  fecha?: string;
  observaciones?: string;

  numUsuario?: number | null;
  nombreUsuario?: string | null;

  numTecnicoExterno?: number | null;
  nombreTecnicoExterno?: string | null;
  empresaTecnicoExterno?: string | null;

  createdAt?: string;
}

export interface EntradaInput {
  numMaterial: number;
  cantidad: number;
  fecha?: string | null;
  observaciones?: string | null;
  numUsuario?: number | null;
  numTecnicoExterno?: number | null;
}