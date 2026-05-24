import { CreateRequests, RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";


export class CreateRequest {

  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(
    request: CreateRequests
  ): Promise<RequestsForm | null> {

    if (!request.descripcion.trim()) {
      throw new Error(
        "La descripción es obligatoria"
      );
    }

    if (!request.tipo_solicitud) {
      throw new Error(
        "Selecciona un tipo de solicitud"
      );
    }

    if (!request.area_id) {
      throw new Error(
        "Selecciona un área"
      );
    }

    if (
      request.tipo_solicitud === "mantenimiento" &&
      !request.tipo_mantenimiento
    ) {
      throw new Error(
        "Selecciona un tipo de mantenimiento"
      );
    }

    return this.repository.addRequest(request);
  }
}