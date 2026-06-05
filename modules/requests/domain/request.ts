export interface RequestsForm {

    numSolicitud: number;
    fecha: string;

    numSolicitante: number;

    numTipo: number;
    numTipoMantenimiento?: number;

    numArea: number;

    descripcion: string;
    prioridad?: Prioridad; //DB

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

}

export interface Evidence {
    idEvidencia: string;
    numSolicitud: number;
    tipoEvidencia: string;
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
    numSolicitud: number;
    numMaterial: number;
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


export type Prioridad =
    | "baja"
    | "media"
    | "alta";

export enum StatusSolicitud {
    GENERADA = 1,
    ASIGNADA = 2,
    EN_PROCESO = 3,
    TERMINADA = 4,
    RECHAZADA = 5
}
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
>;

export type UpdateRequests = Partial<RequestsForm>;
