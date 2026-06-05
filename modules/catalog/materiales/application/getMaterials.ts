import { Material } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";

export class GetMaterialsUseCase {
  constructor(
    private materialRepository: MaterialRepository
  ) {}

  async execute(): Promise<Material[]> {
    return await this.materialRepository.getMaterials();
  }
}