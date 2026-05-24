import { CreateRequests, RequestsForm } from "./request";


export interface RequestsRepository {

  getRequests(): Promise<RequestsForm[]>;

  getRequestById(id: string): Promise<RequestsForm | null>;

  addRequest(
    request: CreateRequests
  ): Promise<RequestsForm | null>;

  updateRequest(
    id: string,
    request: Partial<RequestsForm>
  ): Promise<boolean>;

  deleteRequest(id: string): Promise<boolean>;


  //Admin
  assignRequest(
    id: string,
    tecnico_id: string,
    prioridad: "baja" | "media" | "alta"
  ): Promise<boolean>;

  rejectRequest(
    id: string,
    motivo_rechazo: string
  ): Promise<boolean>;

  
  //Tec
  completeRequest(
    id: string,
    data: Partial<RequestsForm>
  ): Promise<boolean>;


  getRequestsBySolicitante(
    solicitante_id: string
  ): Promise<RequestsForm[]>;

  getRequestsByTecnico(
    tecnico_id: string
  ): Promise<RequestsForm[]>;

}
