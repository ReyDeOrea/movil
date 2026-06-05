
import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsInProgress {

  constructor(private repository: RequestsRepository) { }

  async execute(numUsuario: number,  numRol: number): Promise<RequestsForm[]> {

    const requests = await this.repository
      .getRequests();

    if (numRol === 1) {

      return requests.filter(
        (request) =>
          request.numStatus === 3
      );
    }

    if (numRol === 2) {

      return requests.filter(
        (request) =>
          request.numStatus === 3 &&

          request.numSolicitante === numUsuario
      );
    }

    if (numRol === 3) {

      return requests.filter(
        request =>
          request.numStatus === 3
      );
    }
    return [];
  }
}