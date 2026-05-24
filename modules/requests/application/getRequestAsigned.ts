import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";


export class GetRequestsByTecnico {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(tecnico_id: string ): Promise<RequestsForm[]> {
    
    return await this.repository
      .getRequestsByTecnico(
        tecnico_id
      );
  }
}