import { Entrada } from "../domain/entrada";
import { EntradaRepository } from "../domain/entradaRepository";

export class GetEntradaByIdUseCase {
  constructor(private entradaRepository: EntradaRepository) {}

  async execute(idEntrada: string): Promise<Entrada | null> {
    if (!idEntrada) {
      throw new Error("No se encontró la entrada");
    }

    return await this.entradaRepository.getEntradaById(idEntrada);
  }
}