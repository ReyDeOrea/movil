import { RequestsRepository } from "../domain/requestRepository";

export class CancelRequestUseCase {
  constructor(
    private repository: RequestsRepository
  ) {}

  async execute(
    numSolicitud: number,
    motivoCancelacion: string
  ): Promise<boolean> {
    if (!numSolicitud) {
      throw new Error("No se encontró la solicitud");
    }

    if (!motivoCancelacion || !motivoCancelacion.trim()) {
      throw new Error("Escribe el motivo de cancelación");
    }

    if (motivoCancelacion.trim().length < 5) {
      throw new Error("El motivo de cancelación es demasiado corto");
    }

    return await this.repository.rejectRequest(
      numSolicitud,
      motivoCancelacion.trim()
    );
  }
}