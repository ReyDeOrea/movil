import { api } from "@/lib/api";
import { TipoMaterial } from "../../materiales/domain/material";
import { Entrada, EntradaInput } from "../domain/entrada";
import { EntradaRepository } from "../domain/entradaRepository";

type EntradaApi = {
  idEntrada?: string;
  identrada?: string;

  numMaterial?: number;
  nummaterial?: number;
  nombreMaterial?: string | null;
  nombrematerial?: string | null;
  unidad?: string | null;
  stockActual?: number | null;
  stockactual?: number | null;
  tipomaterial?: TipoMaterial | null;
  tipoMaterial?: TipoMaterial | null;

  cantidad?: number | null;
  fecha?: string | null;
  observaciones?: string | null;

  numUsuario?: number | null;
  numusuario?: number | null;
  nombreUsuario?: string | null;

  numTecnicoExterno?: number | null;
  numtecnicoexterno?: number | null;
  nombreTecnicoExterno?: string | null;
  empresaTecnicoExterno?: string | null;

  createdAt?: string | null;
  created_at?: string | null;
};

const normalizeTipoMaterial = (value: unknown): TipoMaterial => {
  return String(value ?? "material").trim().toLowerCase() === "herramienta"
    ? "herramienta"
    : "material";
};

const toDomain = (item: EntradaApi): Entrada => ({
  idEntrada: String(item.idEntrada ?? item.identrada ?? ""),

  numMaterial: Number(item.numMaterial ?? item.nummaterial ?? 0),
  nombreMaterial: item.nombreMaterial ?? item.nombrematerial ?? "",
  unidad: item.unidad ?? "",
  stockActual: Number(item.stockActual ?? item.stockactual ?? 0),
  tipoMaterial: normalizeTipoMaterial(
    item.tipoMaterial ?? item.tipomaterial
  ),

  cantidad: Number(item.cantidad ?? 0),
  fecha: item.fecha ?? "",
  observaciones: item.observaciones ?? "",

  numUsuario: item.numUsuario ?? item.numusuario ?? null,
  nombreUsuario: item.nombreUsuario ?? null,

  numTecnicoExterno:
    item.numTecnicoExterno ?? item.numtecnicoexterno ?? null,
  nombreTecnicoExterno: item.nombreTecnicoExterno ?? null,
  empresaTecnicoExterno: item.empresaTecnicoExterno ?? null,

  createdAt: item.createdAt ?? item.created_at ?? "",
});

const toApi = (entrada: EntradaInput) => ({
  nummaterial: entrada.numMaterial,
  cantidad: entrada.cantidad,
  fecha: entrada.fecha || undefined,
  observaciones: entrada.observaciones?.trim() || null,
  numusuario: entrada.numUsuario ?? null,
  numtecnicoexterno: entrada.numTecnicoExterno ?? null,
});

export class EntradaDataSource implements EntradaRepository {
  async getEntradas(): Promise<Entrada[]> {
    const response = await api.get<EntradaApi[]>("/entradas/");
    return (response.data ?? []).map(toDomain);
  }

  async getEntradaById(idEntrada: string): Promise<Entrada | null> {
    try {
      const response = await api.get<EntradaApi>(`/entradas/${idEntrada}`);
      return toDomain(response.data);
    } catch {
      return null;
    }
  }

  async createEntrada(entrada: EntradaInput): Promise<Entrada> {
    const response = await api.post<EntradaApi>("/entradas/", toApi(entrada));
    return toDomain(response.data);
  }

  async updateEntrada(
    idEntrada: string,
    entrada: EntradaInput
  ): Promise<Entrada> {
    const response = await api.put<EntradaApi>(
      `/entradas/${idEntrada}`,
      toApi(entrada)
    );

    return toDomain(response.data);
  }

  async deleteEntrada(idEntrada: string): Promise<void> {
    await api.delete(`/entradas/${idEntrada}`);
  }
}
