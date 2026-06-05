import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsCompleted {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(
    numUsuario: number,
    numRol: number
  ): Promise<RequestsForm[]> {

    const requests = await this.repository.getRequests();

    if (numRol === 1) {
      return requests.filter(
        (request) => request.numStatus === 4
      );
    }

    if (numRol === 2) {
      return requests.filter(
        (request) =>
          request.numStatus === 4 &&
          request.numSolicitante === numUsuario
      );
    }

    if (numRol === 3) {
      return requests.filter(
        (request) => request.numStatus === 4
      );
    }

    return [];
  }
}