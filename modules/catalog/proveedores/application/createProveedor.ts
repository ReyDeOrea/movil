import { TecnicoExterno } from "../domain/proveedor";
import { TecnicoExternoRepository } from "../domain/proveedorRepository";

export class CreateTecnicoExternoUseCase {
  constructor(private repository: TecnicoExternoRepository) {}

  async execute(tecnico: TecnicoExterno): Promise<void> {
    if (!tecnico.nombre.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    if (!tecnico.telefono?.trim()) {
      throw new Error("El teléfono es obligatorio");
    }

    if (!tecnico.especialidad?.trim()) {
      throw new Error("La especialidad es obligatoria");
    }

    if (!/^[0-9]{10}$/.test(tecnico.telefono.trim())) {
      throw new Error("El teléfono debe tener 10 dígitos");
    }

    await this.repository.createTecnicoExterno(tecnico);
  }
}
