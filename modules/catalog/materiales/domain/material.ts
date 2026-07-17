export type TipoMaterial = "material" | "herramienta";

export interface Material {
  numMaterial: number;
  nombreMaterial: string;
  unidad?: string;
  cantidad?: number;
  tipoMaterial: TipoMaterial;
}
