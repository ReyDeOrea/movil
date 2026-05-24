// getRequestsCompleted.ts

import { RequestsForm } from "../domain/request";

import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsCompleted {

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
          "terminada"
      );
    }

    if (rol === "tecnico") {

      return requests.filter(
        (request) =>
          request.estado ===
            "terminada" &&

          request.tecnico_id ===
            userId
      );
    }

    if (rol === "solicitante") {

      return requests.filter(
        (request) =>
          request.estado ===
            "terminada" &&

          request.solicitante_id ===
            userId
      );
    }

    return [];
  }
}