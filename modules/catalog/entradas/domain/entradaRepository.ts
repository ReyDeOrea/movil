import { Entrada, EntradaInput } from "./entrada";

export interface EntradaRepository {
  getEntradas(): Promise<Entrada[]>;
  getEntradaById(idEntrada: string): Promise<Entrada | null>;
  createEntrada(entrada: EntradaInput): Promise<Entrada>;
  updateEntrada(idEntrada: string, entrada: EntradaInput): Promise<Entrada>;
  deleteEntrada(idEntrada: string): Promise<void>;
}