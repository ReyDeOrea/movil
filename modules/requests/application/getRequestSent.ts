import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";


export class GetRequestsBySolicitante {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(
    solicitante_id: string
  ): Promise<RequestsForm[]> {

    return await this.repository
      .getRequestsBySolicitante(
        solicitante_id
      );
  }
}