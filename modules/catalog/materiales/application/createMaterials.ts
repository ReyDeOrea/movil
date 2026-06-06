import { Material } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";

export class CreateMaterialUseCase {

  constructor( private materialRepository: MaterialRepository) {}

  async execute(material: Material): Promise<void> {

    if (!material.numMaterial) {
      throw new Error("El número de material es obligatorio");
    }

    if (!material.nombreMaterial.trim()) {
      throw new Error("El nombre del material es obligatorio");
    }

    if (
      material.cantidad !== undefined &&
      material.cantidad !== null &&
      material.cantidad < 0
    ) {
      throw new Error("La cantidad no puede ser negativa");
    }

    const exists =
      await this.materialRepository.getMaterialById(
        material.numMaterial
      );

    if (exists) {
      throw new Error(
        "Ya existe un material con ese número"
      );
    }

    await this.materialRepository.createMaterial(
      material
    );
  }
}