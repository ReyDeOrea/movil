import { supabase } from "@/lib/supabase";
import { TecnicoExterno } from "../domain/proveedor";
import { TecnicoExternoRepository } from "../domain/proveedorRepository";

export class TecnicoExternoDataSource implements TecnicoExternoRepository {

  async getTecnicosExternos(): Promise<TecnicoExterno[]> {

    const { data, error } = await supabase
      .from("tecnicosexternos")
      .select("*")
      .order("numtecnicoexterno");

    if (error) throw error;

    return (data ?? []).map((item) => ({
      numTecnicoExterno: item.numtecnicoexterno,
      nombre: item.nombre,
      empresa: item.empresa ?? "",
      telefono: item.telefono ?? "",
      especialidad: item.especialidad ?? "",
    }));
  }

  async getTecnicoExternoById( id: number): Promise<TecnicoExterno | null> {

    const { data, error } = await supabase
      .from("tecnicosexternos")
      .select("*")
      .eq("numtecnicoexterno", id)
      .single();
    console.log("DATA:", data);
    console.log("ERROR:", error);
    if (error || !data) return null;

    return {
      numTecnicoExterno: data.numtecnicoexterno,
      nombre: data.nombre,
      empresa: data.empresa ?? "",
      telefono: data.telefono ?? "",
      especialidad: data.especialidad ?? "",
    };
  }

  async createTecnicoExterno( tecnico: TecnicoExterno): Promise<void> {

    const { error } = await supabase
      .from("tecnicosexternos")
      .insert([
        {
          numtecnicoexterno: tecnico.numTecnicoExterno,
          nombre: tecnico.nombre,
          empresa: tecnico.empresa,
          telefono: tecnico.telefono,
          especialidad: tecnico.especialidad,
        },
      ]);

    if (error) throw error;
  }

  async updateTecnicoExterno(tecnico: TecnicoExterno ): Promise<void> {

    console.log("Actualizando:", tecnico);
    const { error } = await supabase
      .from("tecnicosexternos")
      .update({
        nombre: tecnico.nombre,
        empresa: tecnico.empresa,
        telefono: tecnico.telefono,
        especialidad: tecnico.especialidad,
      })
      .eq(
        "numtecnicoexterno",
        tecnico.numTecnicoExterno
      );

    if (error) throw error;
  }

  async deleteTecnicoExterno(id: number): Promise<void> {

    const { error } = await supabase
      .from("tecnicosexternos")
      .delete()
      .eq("numtecnicoexterno", id);

    if (error) throw error;
  }
}