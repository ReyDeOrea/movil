import { Material } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";


export class GetMaterialByIdUseCase {

  constructor( private materialRepository: MaterialRepository) {}

  async execute(
    numMaterial: number
  ): Promise<Material | null> {

    if (!numMaterial || numMaterial <= 0) {
      throw new Error("ID de material inválido");
    }

    return await this.materialRepository.getMaterialById(
      numMaterial
    );
  }
}
