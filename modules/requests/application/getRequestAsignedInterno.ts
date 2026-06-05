import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsByTecnicoInterno {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(numTecnicoInterno: number): Promise<RequestsForm[]> {

    return await this.repository.getRequestsByTecnicoInterno(numTecnicoInterno);
  }
}