
import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsRejected {

  constructor( private repository: RequestsRepository) {}

  async execute( numUsuario: number, numRol: number): Promise<RequestsForm[]> {

    const requests = await this.repository
        .getRequests();

    if (numRol === 1) {

      return requests.filter(
        (request) =>
          request.numStatus === 5 );
    }

    if (numRol === 2) {

      return requests.filter(
        (request) =>
          request.numStatus === 5 &&
          request.numSolicitante === numUsuario
      );
    }

    return [];
  }
}