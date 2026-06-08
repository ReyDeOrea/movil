import { TecnicoExterno } from "../domain/proveedor";
import { TecnicoExternoRepository } from "../domain/proveedorRepository";

export class GetTecnicoExternoByIdUseCase {

  constructor(private repository: TecnicoExternoRepository ) {}

  async execute(
    id: number
  ): Promise<TecnicoExterno | null> {

    return await this.repository.getTecnicoExternoById(
      id
    );
  }
}