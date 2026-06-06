import { MaterialRepository } from "../domain/materialRepository";

export class DeleteMaterialUseCase {

  constructor( private materialRepository: MaterialRepository ) {}

  async execute(
    numMaterial: number
  ): Promise<void> {

    const material =
      await this.materialRepository.getMaterialById(
        numMaterial
      );

    if (!material) {
      throw new Error("El material no existe");
    } 

    await this.materialRepository.deleteMaterial(
      numMaterial
    );
  }
}