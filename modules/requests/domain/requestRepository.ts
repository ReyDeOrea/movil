import {
  CreateRequest,
  Evidence,
  Prioridad,
  RequestsForm,
  TipoEvidencia,
} from "./request";

export interface RequestsRepository {
  getRequests(): Promise<RequestsForm[]>;
  getRequestById(id: number): Promise<RequestsForm | null>;
  getRequestsBySolicitante(numSolicitante: number): Promise<RequestsForm[]>;
  getRequestsByStatus(numStatus: number): Promise<RequestsForm[]>;

  createRequest(request: CreateRequest): Promise<number>;
  updateRequest(id: number, request: Partial<RequestsForm>): Promise<boolean>;
  deleteRequest(id: number): Promise<boolean>;

  getRequestsByTecnicoInterno(numTecnico: number): Promise<RequestsForm[]>;
  getRequestsByTecnicoExterno(numTecnico: number): Promise<RequestsForm[]>;

  uploadRequestImages(
    numSolicitud: number,
    uris: string[],
    tipoEvidencia: TipoEvidencia
  ): Promise<Evidence[]>;

  getImagesByRequest(
    numSolicitud: number,
    tipoEvidencia?: TipoEvidencia
  ): Promise<Evidence[]>;

  assignInternalTechnician(
    numSolicitud: number,
    numTecnicoInterno: number
  ): Promise<boolean>;

  assignExternalTechnician(
    numSolicitud: number,
    numTecnicoExterno: number
  ): Promise<boolean>;

  assignRequest(
    id: number,
    prioridad: Prioridad
  ): Promise<boolean>;

  rejectRequest(
    id: number,
    motivoCancelacion: string
  ): Promise<boolean>;

  completeRequest(
    id: number,
    data: Partial<RequestsForm>
  ): Promise<boolean>;
}