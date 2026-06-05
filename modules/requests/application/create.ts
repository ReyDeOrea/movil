import { CreateRequest } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class CreateRequestUseCase {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(
    request: CreateRequest
  ): Promise<number> {

    if (!request.descripcion.trim()) {
      throw new Error("La descripción es obligatoria");
    }

    if (!request.numTipo) {
      throw new Error("Selecciona un tipo de solicitud");
    }

    if (!request.numArea) {
      throw new Error("Selecciona un área");
    }

    if (
      request.numTipoMantenimiento &&
      request.numTipo === 1 && 
      !request.numTipoMantenimiento
    ) {
      throw new Error("Selecciona tipo de mantenimiento");
    }

    return await this.repository.createRequest(request);
  }
}