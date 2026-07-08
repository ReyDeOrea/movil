import { api, getImageUrl } from "@/lib/api";
import {
  CreateRequest,
  DetalleMaterial,
  Evidence,
  ImageInput,
  Prioridad,
  RequestsForm,
  TipoEvidencia,
} from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

type SolicitudApi = {
  numsolicitud?: number;
  numSolicitud?: number;

  fecha?: string | null;
  descripcion?: string | null;

  numtipo?: number | null;
  numTipo?: number | null;
  nombreTipo?: string | null;

  numstatus?: number | null;
  numStatus?: number | null;

  numarea?: number | null;
  numArea?: number | null;
  nombreArea?: string | null;

  numsolicitante?: number | null;
  numSolicitante?: number | null;
  nombreSolicitante?: string | null;

  numtipomantenimiento?: number | null;
  numTipoMantenimiento?: number | null;
  nombreTipoMantenimiento?: string | null;

  motivocancelacion?: string | null;
  motivoCancelacion?: string | null;

  comentarios?: string | null;

  fechaasignacion?: string | null;
  fechaAsignacion?: string | null;

  fechaproginicio?: string | null;
  fechaProgInicio?: string | null;

  fechaprogfin?: string | null;
  fechaProgFin?: string | null;

  prioridad?: Prioridad | null;

  fechainicioreal?: string | null;
  fechaInicioReal?: string | null;

  fechafinreal?: string | null;
  fechaFinReal?: string | null;

  evidencias?: EvidenceApi[];
  materiales?: any[];
  tecnicos?: any[];

  tecnicoAsignado?: string | null;
  tecnicoasignado?: string | null;
};

type EvidenceApi = {
  idevidencia?: string;
  idEvidencia?: string;
  numsolicitud?: number;
  numSolicitud?: number;
  tipoevidencia?: "solicitante" | "tecnico";
  tipoEvidencia?: "solicitante" | "tecnico";
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

const toDateOnly = (value?: string | null): string | null => {
  if (!value) return null;
  return String(value).split("T")[0];
};

const toDomainEvidence = (item: EvidenceApi): Evidence => ({
  idEvidencia: String(item.idEvidencia ?? item.idevidencia ?? ""),
  numSolicitud: Number(item.numSolicitud ?? item.numsolicitud ?? 0),
  tipoEvidencia: item.tipoEvidencia ?? item.tipoevidencia ?? "solicitante",
  ruta: getImageUrl(item.ruta) ?? item.ruta,
  fecha: item.fecha,
});

const toDomainMaterial = (item: any): DetalleMaterial => ({
  numSolicitud: Number(item.numSolicitud ?? item.numsolicitud ?? 0),
  numMaterial: Number(item.numMaterial ?? item.nummaterial ?? 0),
  nombre: item.nombre ?? item.nombrematerial ?? "",
  cantidad: Number(item.cantidad ?? 0),
  unidad: item.unidad ?? "unidad",
  stock: Number(item.stockActual ?? item.stock ?? item.existencia ?? 0),
});

const toDomain = (item: SolicitudApi): RequestsForm => ({
  numSolicitud: Number(item.numSolicitud ?? item.numsolicitud ?? 0),
  fecha: item.fecha ?? "",

  numSolicitante: Number(item.numSolicitante ?? item.numsolicitante ?? 0),
  nombreSolicitante: item.nombreSolicitante ?? undefined,

  numTipo: Number(item.numTipo ?? item.numtipo ?? 0),
  nombreTipo: item.nombreTipo ?? undefined,

  numTipoMantenimiento:
    item.numTipoMantenimiento ?? item.numtipomantenimiento ?? undefined,
  nombreTipoMantenimiento: item.nombreTipoMantenimiento ?? undefined,

  numArea: Number(item.numArea ?? item.numarea ?? 0),
  nombreArea: item.nombreArea ?? undefined,

  descripcion: item.descripcion ?? "",

  prioridad: item.prioridad ?? undefined,

  numStatus: Number(item.numStatus ?? item.numstatus ?? 1),

  motivoCancelacion:
    item.motivoCancelacion ?? item.motivocancelacion ?? undefined,

  fechaAsignacion:
    item.fechaAsignacion ?? item.fechaasignacion ?? undefined,

  fechaProgInicio:
    item.fechaProgInicio ?? item.fechaproginicio ?? undefined,

  fechaProgFin:
    item.fechaProgFin ?? item.fechaprogfin ?? undefined,

  fechaInicioReal:
    item.fechaInicioReal ?? item.fechainicioreal ?? undefined,

  fechaFinReal:
    item.fechaFinReal ?? item.fechafinreal ?? undefined,

  comentarios: item.comentarios ?? undefined,

  evidencias: (item.evidencias ?? []).map(toDomainEvidence),
  materiales: (item.materiales ?? []).map(toDomainMaterial),

  tecnicos: item.tecnicos ?? [],
  tecnicoAsignado:
    item.tecnicoAsignado ??
    item.tecnicoasignado ??
    ((item.tecnicos ?? []).length > 0
      ? (item.tecnicos ?? []).map((t: any) => t.nombre).join(", ")
      : undefined),
});

const toApiCreate = (request: CreateRequest) => ({
  fecha: toDateOnly(request.fecha),
  descripcion: request.descripcion,
  numtipo: request.numTipo,
  numarea: request.numArea,
  numsolicitante: request.numSolicitante,
  numtipomantenimiento:
    request.numTipo === 2 ? request.numTipoMantenimiento ?? null : null,
  numstatus: 1,
});

const toApiUpdate = (request: RequestsForm) => ({
  fecha: toDateOnly(request.fecha),
  descripcion: request.descripcion,

  numtipo: request.numTipo,
  numstatus: request.numStatus,
  numarea: request.numArea,
  numsolicitante: request.numSolicitante,

  numtipomantenimiento:
    request.numTipo === 2 ? request.numTipoMantenimiento ?? null : null,

  motivocancelacion: request.motivoCancelacion ?? null,
  comentarios: request.comentarios ?? null,

  fechaasignacion: toDateOnly(request.fechaAsignacion),
  fechaproginicio: toDateOnly(request.fechaProgInicio),
  fechaprogfin: toDateOnly(request.fechaProgFin),

  prioridad: request.prioridad ?? null,

  fechainicioreal: toDateOnly(request.fechaInicioReal),
  fechafinreal: toDateOnly(request.fechaFinReal),
});

const getImageUri = (image: ImageInput): string => {
  if (typeof image === "string") {
    return image;
  }

  return image.uri;
};

const getFileExtension = (uri: string): string => {
  const extension = uri.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5 || extension.includes("?")) {
    return "jpg";
  }

  return extension;
};

const getMimeTypeFromUri = (uri: string): string => {
  const extension = getFileExtension(uri);

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";
  if (extension === "jpg") return "image/jpeg";
  if (extension === "jpeg") return "image/jpeg";

  return "image/jpeg";
};

const getMimeType = (image: ImageInput): string => {
  if (typeof image !== "string") {
    return image.type ?? image.mimeType ?? getMimeTypeFromUri(image.uri);
  }

  return getMimeTypeFromUri(image);
};

const getImageName = (image: ImageInput, index: number): string => {
  if (typeof image !== "string") {
    return image.name ?? image.fileName ?? `evidencia_${index + 1}.jpg`;
  }

  const extension = getFileExtension(image);
  return `evidencia_${index + 1}.${extension}`;
};

export class ApiFastRequestsRepository implements RequestsRepository {
  async createRequest(request: CreateRequest): Promise<number> {
    const response = await api.post<SolicitudApi>(
      "/solicitudes/",
      toApiCreate(request)
    );

    return Number(response.data.numSolicitud ?? response.data.numsolicitud);
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

  async getRequestsBySolicitante(
    numSolicitante: number
  ): Promise<RequestsForm[]> {
    const response = await api.get<SolicitudApi[]>("/solicitudes/", {
      params: {
        numsolicitante: numSolicitante,
      },
    });

    return (response.data ?? []).map(toDomain);
  }

  async getRequestsByStatus(numStatus: number): Promise<RequestsForm[]> {
    const response = await api.get<SolicitudApi[]>("/solicitudes/", {
      params: {
        numstatus: numStatus,
      },
    });

    return (response.data ?? []).map(toDomain);
  }

  async updateRequest(
    id: number,
    request: Partial<RequestsForm>
  ): Promise<boolean> {
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

  async updateRequestStatus(
    id: number,
    numStatus: number
  ): Promise<boolean> {
    return await this.updateRequest(id, {
      numStatus,
    });
  }

  async deleteRequest(id: number): Promise<boolean> {
    await api.delete(`/solicitudes/${id}`);
    return true;
  }

  async uploadRequestImages(
    numSolicitud: number,
    imagenes: ImageInput[],
    tipoEvidencia: TipoEvidencia
  ): Promise<Evidence[]> {
    if (!imagenes || imagenes.length === 0) {
      return [];
    }

    const formData = new FormData();

    imagenes.forEach((image, index) => {
      const uri = getImageUri(image);

      formData.append("files", {
        uri,
        name: getImageName(image, index),
        type: getMimeType(image),
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

  async saveRequestMaterials(
    numSolicitud: number,
    materiales: DetalleMaterial[]
  ): Promise<boolean> {
    const cleanMateriales = (materiales ?? []).filter(
      (item) => Number(item.numMaterial) > 0 && Number(item.cantidad) > 0
    );

    for (const item of cleanMateriales) {
      await api.post("/detalle-material/", {
        numsolicitud: numSolicitud,
        nummaterial: Number(item.numMaterial),
        cantidad: Number(item.cantidad),
        unidad: item.unidad ?? "unidad",
      });
    }

    return true;
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

  async assignRequest(
    id: number,
    prioridad: Prioridad
  ): Promise<boolean> {
    return await this.updateRequest(id, {
      prioridad,
      numStatus: 2,
      fechaAsignacion: new Date().toISOString().split("T")[0],
    });
  }

  async rejectRequest(
    id: number,
    motivoCancelacion: string
  ): Promise<boolean> {
    return await this.updateRequest(id, {
      numStatus: 5,
      motivoCancelacion,
    });
  }

  async completeRequest(
    id: number,
    data: Partial<RequestsForm>
  ): Promise<boolean> {
    const finalData: any = data;

    const fechaInicioReal =
      finalData.fechaInicioReal ??
      finalData.fechainicioreal ??
      finalData.fecha_inicio_real;

    const fechaFinReal =
      finalData.fechaFinReal ??
      finalData.fechafinreal ??
      finalData.fecha_fin_real ??
      new Date().toISOString().split("T")[0];

    const materiales = (finalData.materiales ?? []).map((item: any) => ({
      nummaterial: Number(item.numMaterial ?? item.nummaterial),
      cantidad: Number(item.cantidad),
      unidad: item.unidad ?? "unidad",
    }));

    await api.put(`/solicitudes/${id}/terminar`, {
      fechainicioreal: toDateOnly(fechaInicioReal),
      fechafinreal: toDateOnly(fechaFinReal),
      comentarios: finalData.comentarios ?? "",
      materiales,
    });

    return true;
  }

  async getRequestsByTecnicoInterno(
    numTecnico: number
  ): Promise<RequestsForm[]> {
    const response = await api.get<TecnicoInternoApi[]>("/tecnicos-internos/");

    const ids = (response.data ?? [])
      .filter((item) => Number(item.numtecnicointerno) === Number(numTecnico))
      .map((item) => Number(item.numsolicitud));

    const requests = await this.getRequests();

    return requests.filter((request) =>
      ids.includes(Number(request.numSolicitud))
    );
  }

  async getRequestsByTecnicoExterno(
    numTecnico: number
  ): Promise<RequestsForm[]> {
    const response = await api.get<TecnicoExternoApi[]>(
      "/tecnicos-externos-solicitud/"
    );

    const ids = (response.data ?? [])
      .filter((item) => Number(item.numtecnicoexterno) === Number(numTecnico))
      .map((item) => Number(item.numsolicitud));

    const requests = await this.getRequests();

    return requests.filter((request) =>
      ids.includes(Number(request.numSolicitud))
    );
  }
}

export class SupabaseRequestsRepository extends ApiFastRequestsRepository {}