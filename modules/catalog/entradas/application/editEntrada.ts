import { Entrada, EntradaInput } from "../domain/entrada";
import { EntradaRepository } from "../domain/entradaRepository";

export class EditEntradaUseCase {
  constructor(private entradaRepository: EntradaRepository) {}

  async execute(idEntrada: string, entrada: EntradaInput): Promise<Entrada> {
    if (!idEntrada) {
      throw new Error("No se encontró la entrada");
    }

    if (!entrada.numMaterial || entrada.numMaterial <= 0) {
      throw new Error("Selecciona un material");
    }

    if (!entrada.cantidad || entrada.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    return await this.entradaRepository.updateEntrada(idEntrada, entrada);
  }
}