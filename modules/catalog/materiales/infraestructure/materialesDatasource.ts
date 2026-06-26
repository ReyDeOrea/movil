import { api } from "@/lib/api";
import { Material } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";

type MaterialApi = {
  nummaterial: number;
  nombrematerial: string;
  unidad?: string | null;
  cantidad?: number | null;
};

const toDomain = (item: MaterialApi): Material => ({
  numMaterial: item.nummaterial,
  nombreMaterial: item.nombrematerial,
  unidad: item.unidad ?? "",
  cantidad: item.cantidad ?? 0,
});

const toApi = (material: Material) => ({
  nummaterial: material.numMaterial,
  nombrematerial: material.nombreMaterial,
  unidad: material.unidad ?? null,
  cantidad: material.cantidad ?? null,
});

const toApiUpdate = (material: Material) => ({
  nombrematerial: material.nombreMaterial,
  unidad: material.unidad ?? null,
  cantidad: material.cantidad ?? null,
});

export class MaterialDataSource implements MaterialRepository {
  async getMaterials(): Promise<Material[]> {
    const response = await api.get<MaterialApi[]>("/materiales/");
    return (response.data ?? []).map(toDomain);
  }

  async getMaterialById(numMaterial: number): Promise<Material | null> {
    try {
      const response = await api.get<MaterialApi>(`/materiales/${numMaterial}`);
      return toDomain(response.data);
    } catch {
      return null;
    }
  }

  async createMaterial(material: Material): Promise<void> {
    await api.post("/materiales/", toApi(material));
  }

  async updateMaterial(material: Material): Promise<void> {
    await api.put(
      `/materiales/${material.numMaterial}`,
      toApiUpdate(material)
    );
  }

  async deleteMaterial(numMaterial: number): Promise<void> {
    await api.delete(`/materiales/${numMaterial}`);
  }
}
