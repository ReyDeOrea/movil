import { TecnicoExternoRepository } from "../domain/proveedorRepository";

export class DeleteTecnicoExternoUseCase {

  constructor( private repository: TecnicoExternoRepository) {}

  async execute(
    id: number
  ): Promise<void> {

    const exists =
      await this.repository.getTecnicoExternoById(
        id
      );

    if (!exists) {
      throw new Error(
        "El técnico externo no existe"
      );
    }

    await this.repository.deleteTecnicoExterno(
      id
    );
  }
}