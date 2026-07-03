import { api, getImageUrl } from "@/lib/api";
import {
  CreateRequest,
  Evidence,
  Prioridad,
  RequestsForm,
  TipoEvidencia,
} from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

type SolicitudApi = {
  numsolicitud: number;
  fecha?: string | null;
  descripcion?: string | null;
  numtipo?: number | null;
  numstatus?: number | null;
  numarea?: number | null;
  numsolicitante?: number | null;
  numtipomantenimiento?: number | null;
  motivocancelacion?: string | null;
  comentarios?: string | null;
  fechaasignacion?: string | null;
  fechaproginicio?: string | null;
  fechaprogfin?: string | null;
  prioridad?: Prioridad | null;
  fechainicioreal?: string | null;
  fechafinreal?: string | null;
  evidencias?: EvidenceApi[];
};

type EvidenceApi = {
  idevidencia: string;
  numsolicitud: number;
  tipoevidencia: "solicitante" | "tecnico";
  ruta: string;
  fecha: string;
};

type TecnicoInternoApi = {
  id: number;
  numsolicitud: number;
  numtecnicointerno: number;
};

type TecnicoExternoApi = {
  id: number;
  numsolicitud: number;
  numtecnicoexterno: number;
};

const toDateOnly = (value?: string | null) => {
  if (!value) return null;
  return value.split("T")[0];
};

const toDomainEvidence = (item: EvidenceApi): Evidence => ({
  idEvidencia: item.idevidencia,
  numSolicitud: item.numsolicitud,
  tipoEvidencia: item.tipoevidencia,
  ruta: getImageUrl(item.ruta) ?? item.ruta,
  fecha: item.fecha,
});

const toDomain = (item: SolicitudApi): RequestsForm => ({
  numSolicitud: item.numsolicitud,
  fecha: item.fecha ?? "",
  numSolicitante: item.numsolicitante ?? 0,
  numTipo: item.numtipo ?? 0,
  numTipoMantenimiento: item.numtipomantenimiento ?? undefined,
  numArea: item.numarea ?? 0,
  descripcion: item.descripcion ?? "",
  prioridad: item.prioridad ?? undefined,
  numStatus: item.numstatus ?? 1,
  motivoCancelacion: item.motivocancelacion ?? undefined,
  fechaAsignacion: item.fechaasignacion ?? undefined,
  fechaProgInicio: item.fechaproginicio ?? undefined,
  fechaProgFin: item.fechaprogfin ?? undefined,
  fechaInicioReal: item.fechainicioreal ?? undefined,
  fechaFinReal: item.fechafinreal ?? undefined,
  comentarios: item.comentarios ?? undefined,
  evidencias: (item.evidencias ?? []).map(toDomainEvidence),
});

const toApiCreate = (request: CreateRequest) => ({
  fecha: toDateOnly(request.fecha),
  descripcion: request.descripcion,
  numtipo: request.numTipo,
  numarea: request.numArea,
  numsolicitante: request.numSolicitante,
  numtipomantenimiento: request.numTipo === 2
    ? request.numTipoMantenimiento ?? null
    : null,
  numstatus: 1,
});

const toApiUpdate = (request: RequestsForm) => ({
  fecha: toDateOnly(request.fecha),
  descripcion: request.descripcion,
  numtipo: request.numTipo,
  numstatus: request.numStatus,
  numarea: request.numArea,
  numsolicitante: request.numSolicitante,
  numtipomantenimiento: request.numTipo === 2
    ? request.numTipoMantenimiento ?? null
    : null,
  motivocancelacion: request.motivoCancelacion ?? null,
  comentarios: request.comentarios ?? null,
  fechaasignacion: toDateOnly(request.fechaAsignacion),
  fechaproginicio: toDateOnly(request.fechaProgInicio),
  fechaprogfin: toDateOnly(request.fechaProgFin),
  prioridad: request.prioridad ?? null,
  fechainicioreal: toDateOnly(request.fechaInicioReal),
  fechafinreal: toDateOnly(request.fechaFinReal),
});

const getMimeType = (uri: string) => {
  const extension = uri.split(".").pop()?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";

  return "image/jpeg";
};

const getFileExtension = (uri: string) => {
  const extension = uri.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  return extension;
};

export class ApiFastRequestsRepository implements RequestsRepository {
  async createRequest(request: CreateRequest): Promise<number> {
    const response = await api.post<SolicitudApi>(
      "/solicitudes/",
      toApiCreate(request)
    );

    return response.data.numsolicitud;
  }

  async getRequests(): Promise<RequestsForm[]> {
    const response = await api.get<SolicitudApi[]>("/solicitudes/");
    return (response.data ?? []).map(toDomain);
  }

  async getRequestById(id: number): Promise<RequestsForm | null> {
    try {
      const response = await api.get<SolicitudApi>(`/solicitudes/${id}`);
      return toDomain(response.data);
    } catch {
      return null;
    }
  }

  async getRequestsBySolicitante(numSolicitante: number): Promise<RequestsForm[]> {
    const requests = await this.getRequests();

    return requests.filter(
      (request) => request.numSolicitante === numSolicitante
    );
  }

  async getRequestsByStatus(numStatus: number): Promise<RequestsForm[]> {
    const requests = await this.getRequests();

    return requests.filter(
      (request) => request.numStatus === numStatus
    );
  }

  async updateRequest(id: number, request: Partial<RequestsForm>): Promise<boolean> {
    const current = await this.getRequestById(id);

    if (!current) {
      throw new Error("Solicitud no encontrada");
    }

    const merged: RequestsForm = {
      ...current,
      ...request,
      numSolicitud: id,
    };

    await api.put(`/solicitudes/${id}`, toApiUpdate(merged));

    return true;
  }

  async deleteRequest(id: number): Promise<boolean> {
    await api.delete(`/solicitudes/${id}`);
    return true;
  }

  async uploadRequestImages(
    numSolicitud: number,
    uris: string[],
    tipoEvidencia: TipoEvidencia
  ): Promise<Evidence[]> {
    if (uris.length === 0) return [];

    const formData = new FormData();

    uris.forEach((uri, index) => {
      const extension = getFileExtension(uri);

      formData.append("files", {
        uri,
        name: `evidencia_${index + 1}.${extension}`,
        type: getMimeType(uri),
      } as any);
    });

    formData.append("tipoevidencia", tipoEvidencia);

    const response = await api.post<EvidenceApi[]>(
      `/imagenes/solicitud/${numSolicitud}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return (response.data ?? []).map(toDomainEvidence);
  }

  async getImagesByRequest(
    numSolicitud: number,
    tipoEvidencia?: TipoEvidencia
  ): Promise<Evidence[]> {
    const response = await api.get<EvidenceApi[]>(
      `/imagenes/solicitud/${numSolicitud}`,
      {
        params: {
          tipoevidencia: tipoEvidencia,
        },
      }
    );

    return (response.data ?? []).map(toDomainEvidence);
  }

  async assignInternalTechnician(
    numSolicitud: number,
    numTecnicoInterno: number
  ): Promise<boolean> {
    await api.post("/tecnicos-internos/", {
      numsolicitud: numSolicitud,
      numtecnicointerno: numTecnicoInterno,
    });

    return true;
  }

  async assignExternalTechnician(
    numSolicitud: number,
    numTecnicoExterno: number
  ): Promise<boolean> {
    await api.post("/tecnicos-externos-solicitud/", {
      numsolicitud: numSolicitud,
      numtecnicoexterno: numTecnicoExterno,
    });

    return true;
  }

  async assignRequest(id: number, prioridad: Prioridad): Promise<boolean> {
    return await this.updateRequest(id, {
      prioridad,
      numStatus: 2,
      fechaAsignacion: new Date().toISOString().split("T")[0],
    });
  }

  async rejectRequest(id: number, motivoCancelacion: string): Promise<boolean> {
    return await this.updateRequest(id, {
      numStatus: 5,
      motivoCancelacion,
    });
  }

  async completeRequest(id: number, data: Partial<RequestsForm>): Promise<boolean> {
    return await this.updateRequest(id, {
      ...data,
      numStatus: 4,
      fechaFinReal: new Date().toISOString().split("T")[0],
    });
  }

  async getRequestsByTecnicoInterno(numTecnico: number): Promise<RequestsForm[]> {
    const response = await api.get<TecnicoInternoApi[]>("/tecnicos-internos/");

    const ids = (response.data ?? [])
      .filter((item) => item.numtecnicointerno === numTecnico)
      .map((item) => item.numsolicitud);

    const requests = await this.getRequests();

    return requests.filter(
      (request) => ids.includes(request.numSolicitud)
    );
  }

  async getRequestsByTecnicoExterno(numTecnico: number): Promise<RequestsForm[]> {
    const response = await api.get<TecnicoExternoApi[]>("/tecnicos-externos-solicitud/");

    const ids = (response.data ?? [])
      .filter((item) => item.numtecnicoexterno === numTecnico)
      .map((item) => item.numsolicitud);

    const requests = await this.getRequests();

    return requests.filter(
      (request) => ids.includes(request.numSolicitud)
    );
  }
}

export class SupabaseRequestsRepository extends ApiFastRequestsRepository {}