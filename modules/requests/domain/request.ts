export interface RequestsForm {

    id: string;
    solicitante_id: string;
    tecnico_id?: string;
    administrador_id?: string;
    fecha_solicitud: string;
    tipo_solicitud: TipoS;
    tipo_mantenimiento?: TipoM;
    area_id: string;
    descripcion: string;
    prioridad?: Prioridad;
    estado: EstadoS;
    motivo_rechazo?: string;
    persona_asignada?: string;
    fecha_asignada?: string;
    fecha_programada_inicio?: string;
    fecha_programada_fin?: string;
    fecha_real_inicio?: string;
    fecha_real_fin?: string;
    comentarios?: string;
    evidencia_S?: string;
    evidencia_T?: string;
    externo: boolean;
    compra?: string;
    created_at: string;
}

export type Prioridad =
    | "baja"
    | "media"
    | "alta";

export type EstadoS =
    | "generada"
    | "asignada"
    | "en_proceso"
    | "terminada"
    | "cancelada"
    | "rechazada";

export type TipoS =
    | "servicio"
    | "mantenimiento";

export type TipoM =
    | "preventivo"
    | "correctivo"
    | "reactivo";

export type CreateRequests = Omit<
    RequestsForm,
    | "id"
    | "created_at"
    | "estado"
    | "administrador_id"
    | "tecnico_id"
    | "motivo_rechazo"
    | "fecha_asignada"
    | "fecha_programada_inicio"
    | "fecha_programada_fin"
    | "fecha_real_inicio"
    | "fecha_real_fin"
    | "comentarios"
    | "compra"
>;

export type UpdateRequests = Partial<RequestsForm>;