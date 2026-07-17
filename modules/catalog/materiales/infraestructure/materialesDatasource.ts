import { api } from "@/lib/api";
import { Material, TipoMaterial } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";

type MaterialApi = {
  nummaterial?: number;
  numMaterial?: number;
  nombrematerial?: string;
  nombreMaterial?: string;
  unidad?: string | null;
  cantidad?: number | null;
  tipomaterial?: TipoMaterial | null;
  tipoMaterial?: TipoMaterial | null;
};

const normalizeTipoMaterial = (value: unknown): TipoMaterial => {
  return String(value ?? "material").trim().toLowerCase() === "herramienta"
    ? "herramienta"
    : "material";
};

const toDomain = (item: MaterialApi): Material => ({
  numMaterial: Number(item.numMaterial ?? item.nummaterial ?? 0),
  nombreMaterial: String(item.nombreMaterial ?? item.nombrematerial ?? ""),
  unidad: item.unidad ?? "",
  cantidad: Number(item.cantidad ?? 0),
  tipoMaterial: normalizeTipoMaterial(
    item.tipoMaterial ?? item.tipomaterial
  ),
});

const toApi = (material: Material) => ({
  nummaterial: material.numMaterial,
  nombrematerial: material.nombreMaterial.trim(),
  unidad: material.unidad?.trim() || null,
  cantidad: material.cantidad ?? 0,
  tipomaterial: material.tipoMaterial,
});

const toApiUpdate = (material: Material) => ({
  nombrematerial: material.nombreMaterial.trim(),
  unidad: material.unidad?.trim() || null,
  cantidad: material.cantidad ?? 0,
  tipomaterial: material.tipoMaterial,
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
