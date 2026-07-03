import { CreateRequest, TipoEvidencia } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class CreateRequestUseCase {
  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(
    request: CreateRequest,
    imagenes: string[] = [],
    tipoEvidencia: TipoEvidencia = "solicitante"
  ): Promise<number> {
    if (!request.numSolicitante) {
      throw new Error("No se encontró el usuario solicitante");
    }

    if (!request.descripcion || !request.descripcion.trim()) {
      throw new Error("La descripción es obligatoria");
    }

    if (!request.numTipo) {
      throw new Error("Selecciona un tipo de solicitud");
    }

    if (!request.numArea) {
      throw new Error("Selecciona un área");
    }

    if (request.numTipo === 2 && !request.numTipoMantenimiento) {
      throw new Error("Selecciona tipo de mantenimiento");
    }

    if (!imagenes || imagenes.length < 1) {
      throw new Error("Debes agregar al menos una imagen como evidencia");
    }

    const numSolicitud = await this.repository.createRequest(request);

    try {
      await this.repository.uploadRequestImages(
        numSolicitud,
        imagenes,
        tipoEvidencia
      );

      return numSolicitud;

    } catch (error) {
      await this.repository.deleteRequest(numSolicitud);

      throw new Error(
        "No se pudieron subir las imágenes. La solicitud no fue guardada"
      );
    }
  }
}