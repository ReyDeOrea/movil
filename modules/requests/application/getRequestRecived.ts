import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";


export class GetAllRequests {

  constructor(private repository: RequestsRepository) {}

  async execute(): Promise<RequestsForm[]> {

    const data = await this.repository
        .getRequests();

    return data || [];
  }
}