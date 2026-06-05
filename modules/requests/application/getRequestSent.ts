import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";


export class GetRequestsBySolicitante {
constructor( private repository: RequestsRepository ) {}

  async execute(numSolcitante: number): Promise<RequestsForm[]> {

    return await this.repository
      .getRequestsBySolicitante(
        numSolcitante
      );
  }
}