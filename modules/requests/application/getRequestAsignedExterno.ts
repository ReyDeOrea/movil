import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class GetRequestsByTecnicoExterno {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(numTecnicoExterno: number): Promise<RequestsForm[]> {

    return await this.repository.getRequestsByTecnicoExterno(numTecnicoExterno);
  }
}