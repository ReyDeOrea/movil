import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsInProgress {
  constructor(private repository: RequestsRepository) {}

  async execute(numUsuario: number, numRol: number): Promise<RequestsForm[]> {
    
    if (numRol === 1) {
      const requests = await this.repository.getRequests();

      return requests.filter((request) => {
        const status = Number(
          request.numStatus ??
          (request as any).numstatus ??
          (request as any).num_status
        );

        return status === 3;
      });
    }

    if (numRol === 2) {
      const requests = await this.repository.getRequestsBySolicitante(numUsuario);

      return requests.filter((request) => {
        const status = Number(
          request.numStatus ??
          (request as any).numstatus ??
          (request as any).num_status
        );

        return status === 3;
      });
    }

    if (numRol === 3) {
      const requests = await this.repository.getRequestsByTecnicoInterno(numUsuario);

      return requests.filter((request) => {
        const status = Number(
          request.numStatus ??
          (request as any).numstatus ??
          (request as any).num_status
        );

        return status === 3;
      });
    }

    return [];
  }
}