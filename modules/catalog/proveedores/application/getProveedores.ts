import { TecnicoExterno } from "../domain/proveedor";
import { TecnicoExternoRepository } from "../domain/proveedorRepository";

export class GetTecnicosExternosUseCase {

  constructor(private repository: TecnicoExternoRepository) {}

  async execute(): Promise<TecnicoExterno[]> {

    return await this.repository.getTecnicosExternos();
  }
}