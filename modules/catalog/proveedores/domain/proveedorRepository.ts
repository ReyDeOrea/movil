import { TecnicoExterno } from "./proveedor";

export interface TecnicoExternoRepository {
  getTecnicosExternos(): Promise<TecnicoExterno[]>;
  getTecnicoExternoById(id: number): Promise<TecnicoExterno | null>;

  createTecnicoExterno( tecnico: TecnicoExterno ): Promise<void>;

  updateTecnicoExterno( tecnico: TecnicoExterno): Promise<void>;

  deleteTecnicoExterno( id: number ): Promise<void>;
}