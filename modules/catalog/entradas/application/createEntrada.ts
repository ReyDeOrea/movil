import { Entrada, EntradaInput } from "../domain/entrada";
import { EntradaRepository } from "../domain/entradaRepository";

export class CreateEntradaUseCase {
  constructor(private entradaRepository: EntradaRepository) {}

  async execute(entrada: EntradaInput): Promise<Entrada> {
    if (!entrada.numMaterial || entrada.numMaterial <= 0) {
      throw new Error("Selecciona un material");
    }

    if (!entrada.cantidad || entrada.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    return await this.entradaRepository.createEntrada(entrada);
  }
}