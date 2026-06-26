import { api } from "@/lib/api";
import { TecnicoExterno } from "../domain/proveedor";
import { TecnicoExternoRepository } from "../domain/proveedorRepository";

type TecnicoExternoApi = {
  numtecnicoexterno: number;
  nombre: string;
  empresa?: string | null;
  telefono?: string | null;
  especialidad?: string | null;
};

const toDomain = (item: TecnicoExternoApi): TecnicoExterno => ({
  numTecnicoExterno: item.numtecnicoexterno,
  nombre: item.nombre,
  empresa: item.empresa ?? "",
  telefono: item.telefono ?? "",
  especialidad: item.especialidad ?? "",
});

const toCreateApi = (tecnico: TecnicoExterno) => ({
  nombre: tecnico.nombre,
  empresa: tecnico.empresa ?? null,
  telefono: tecnico.telefono ?? null,
  especialidad: tecnico.especialidad ?? null,
});

export class TecnicoExternoDataSource implements TecnicoExternoRepository {
  async getTecnicosExternos(): Promise<TecnicoExterno[]> {
    const response = await api.get<TecnicoExternoApi[]>("/tecnicos-externos/");
    return (response.data ?? []).map(toDomain);
  }

  async getTecnicoExternoById(id: number): Promise<TecnicoExterno | null> {
    try {
      const response = await api.get<TecnicoExternoApi>(`/tecnicos-externos/${id}`);
      return toDomain(response.data);
    } catch {
      return null;
    }
  }

  async createTecnicoExterno(tecnico: TecnicoExterno): Promise<void> {
    await api.post("/tecnicos-externos/", toCreateApi(tecnico));
  }

  async updateTecnicoExterno(tecnico: TecnicoExterno): Promise<void> {
    if (!tecnico.numTecnicoExterno) {
      throw new Error("No se encontró el ID del técnico externo");
    }

    await api.put(
      `/tecnicos-externos/${tecnico.numTecnicoExterno}`,
      toCreateApi(tecnico)
    );
  }

  async deleteTecnicoExterno(id: number): Promise<void> {
    await api.delete(`/tecnicos-externos/${id}`);
  }
}
