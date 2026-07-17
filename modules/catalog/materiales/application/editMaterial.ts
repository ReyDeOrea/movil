import { Material } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";

export class EditMaterialUseCase {
  constructor(private materialRepository: MaterialRepository) {}

  async execute(material: Material): Promise<void> {
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

    const existingMaterial = await this.materialRepository.getMaterialById(
      material.numMaterial
    );

    if (!existingMaterial) {
      throw new Error("El material o herramienta no existe");
    }

    await this.materialRepository.updateMaterial(material);
  }
}
