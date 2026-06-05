import { Material } from "./material";

export interface MaterialRepository {
  getMaterials(): Promise<Material[]>;
  getMaterialById(numMaterial: number): Promise<Material | null>;

  createMaterial(material: Material): Promise<void>;
  updateMaterial(material: Material): Promise<void>;
  deleteMaterial(numMaterial: number): Promise<void>;
}