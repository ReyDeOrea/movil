import { Material } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";

export class CreateMaterialUseCase {
  constructor(private materialRepository: MaterialRepository) {}

  async execute(material: Material): Promise<void> {
    if (!material.numMaterial || material.numMaterial <= 0) {
      throw new Error("El número de material es obligatorio y debe ser mayor a 0");
    }

    if (!material.nombreMaterial.trim()) {
      throw new Error("El nombre del material o herramienta es obligatorio");
    }

    if (
      material.cantidad !== undefined &&
      material.cantidad !== null &&
      material.cantidad < 0
    ) {
      throw new Error("La cantidad no puede ser negativa");
    }

    if (
      material.tipoMaterial !== "material" &&
      material.tipoMaterial !== "herramienta"
    ) {
      throw new Error("Selecciona si el registro es material o herramienta");
    }

    const exists = await this.materialRepository.getMaterialById(
      material.numMaterial
    );

    if (exists) {
      throw new Error("Ya existe un material o herramienta con ese número");
    }

    await this.materialRepository.createMaterial(material);
  }
}
