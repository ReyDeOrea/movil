
import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsRejected {

  constructor(
    private repository:
      RequestsRepository
  ) {}

  async execute(
    userId: string,
    rol: string
  ): Promise<RequestsForm[]> {

    const requests =
      await this.repository
        .getRequests();

    if (rol === "administrador") {

      return requests.filter(
        (request) =>
          request.estado ===
          "rechazada"
      );
    }

    if (rol === "solicitante") {

      return requests.filter(
        (request) =>
          request.estado ===
            "rechazada" &&

          request.solicitante_id ===
            userId
      );
    }

    return [];
  }
}