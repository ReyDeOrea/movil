import { EntradaRepository } from "../domain/entradaRepository";

export class DeleteEntradaUseCase {
  constructor(private entradaRepository: EntradaRepository) {}

  async execute(idEntrada: string): Promise<void> {
    if (!idEntrada) {
      throw new Error("No se encontró la entrada");
    }

    await this.entradaRepository.deleteEntrada(idEntrada);
  }
}