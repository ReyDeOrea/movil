export interface RequestsForm {
  numSolicitud: number;
  fecha: string;

  numSolicitante: number;
  nombreSolicitante?: string;

  numTipo: number;
  nombreTipo?: string;

  numTipoMantenimiento?: number;
  nombreTipoMantenimiento?: string;

  numArea: number;
  nombreArea?: string;

  descripcion: string;
  prioridad?: Prioridad;

  numStatus: StatusSolicitud;

  motivoCancelacion?: string;

  fechaAsignacion?: string;
  fechaProgInicio?: string;
  fechaProgFin?: string;

  fechaInicioReal?: string;
  fechaFinReal?: string;

  comentarios?: string;

  evidencias?: Evidence[];
  bitacora?: Bitacora[];
  materiales?: DetalleMaterial[];

  tecnicoInterno?: SolicitudTecnicoInterno;
  tecnicoExterno?: SolicitudTecnicoExterno;

  tecnicos?: TecnicoAsignado[];
  tecnicoAsignado?: string;
}

export interface Evidence {
  idEvidencia: string;
  numSolicitud: number;
  tipoEvidencia: "solicitante" | "tecnico";
  ruta: string;
  fecha: string;
}

export interface Bitacora {
  numBitacora: number;
  numSolicitud: number;
  numUsuario: number;
  fecha: string;
  accion: string;
  descripcion: string;
}

export interface DetalleMaterial {
  numSolicitud?: number;
  numMaterial: number;
  nombre?: string;
  cantidad: number;
  unidad: string;
}

export interface SolicitudTecnicoInterno {
  id: number;
  numSolicitud: number;
  numTecnicoInterno: number;
}

export interface SolicitudTecnicoExterno {
  id: number;
  numSolicitud: number;
  numTecnicoExterno: number;
}

export interface TecnicoAsignado {
  id: number;
  tipo: "interno" | "externo";
  numTecnico: number;
  nombre: string;
  telefono?: string;
  email?: string;
  empresa?: string;
  especialidad?: string;
}

export type ImageInput =
  | string
  | {
      uri: string;
      name?: string;
      type?: string;
      fileName?: string;
      mimeType?: string;
    };

export type Prioridad =
  | "baja"
  | "media"
  | "alta";

export enum StatusSolicitud {
  GENERADA = 1,
  ASIGNADA = 2,
  EN_PROCESO = 3,
  TERMINADA = 4,
  RECHAZADA = 5,
}

export type TipoEvidencia = "solicitante" | "tecnico";

export type CreateRequest = Omit<
  RequestsForm,
  | "numSolicitud"
  | "numStatus"
  | "motivoCancelacion"
  | "fechaAsignacion"
  | "fechaProgInicio"
  | "fechaProgFin"
  | "fechaInicioReal"
  | "fechaFinReal"
  | "comentarios"
  | "evidencias"
  | "bitacora"
  | "materiales"
  | "prioridad"
  | "tecnicoInterno"
  | "tecnicoExterno"
  | "tecnicos"
  | "tecnicoAsignado"
  | "nombreSolicitante"
  | "nombreTipo"
  | "nombreTipoMantenimiento"
  | "nombreArea"
>;

export type UpdateRequests = Partial<RequestsForm>;