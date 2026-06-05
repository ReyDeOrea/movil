import { CreateRequest, Prioridad, RequestsForm } from "./request";


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

  //Admin
  assignRequest(
    id: number,
    prioridad: Prioridad
  ): Promise<boolean>;

  rejectRequest(
    id: number,
    motivoCancelacion: string
  ): Promise<boolean>;


  //Tec
  completeRequest(
    id: number,
    data: Partial<RequestsForm>
  ): Promise<boolean>;

  // startRequest(
  // id: number
  //): Promise<boolean>;

}
