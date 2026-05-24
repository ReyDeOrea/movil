import { RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";


export class UpdateRequestStatus {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(
    requestId: string,

    request:
    Partial<RequestsForm>

  ): Promise<boolean> {

    if (!requestId) {

      throw new Error(
        "ID de solicitud inválido"
      );
    }

    return await this.repository
      .updateRequest(
        requestId,
        request
      );
  }
}