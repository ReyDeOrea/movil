import { Entrada } from "../domain/entrada";
import { EntradaRepository } from "../domain/entradaRepository";

export class GetEntradasUseCase {
  constructor(private entradaRepository: EntradaRepository) {}

  async execute(): Promise<Entrada[]> {
    return await this.entradaRepository.getEntradas();
  }
}