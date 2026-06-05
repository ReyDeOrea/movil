import { supabase } from "@/lib/supabase";
import { Material } from "../domain/material";
import { MaterialRepository } from "../domain/materialRepository";

export class MaterialDataSource implements MaterialRepository {

  async getMaterials(): Promise<Material[]> {
    const { data, error } = await supabase
      .from("materiales")
      .select("*")
      .order("nummaterial");

    if (error) throw error;

    return (data ?? []).map((item) => ({
      numMaterial: item.nummaterial,
      nombreMaterial: item.nombrematerial,
      unidad: item.unidad ?? "",
      cantidad: item.cantidad ?? 0,
    }));
  }

  async getMaterialById(
    numMaterial: number
  ): Promise<Material | null> {

    const { data, error } = await supabase
      .from("materiales")
      .select("*")
      .eq("nummaterial", numMaterial)
      .single();

    if (error || !data) return null;

    return {
      numMaterial: data.nummaterial,
      nombreMaterial: data.nombrematerial,
      unidad: data.unidad ?? "",
      cantidad: data.cantidad ?? 0,
    };
  }

  async createMaterial(
    material: Material
  ): Promise<void> {

    const { error } = await supabase
      .from("materiales")
      .insert([
        {
          nummaterial: material.numMaterial,
          nombrematerial: material.nombreMaterial,
          unidad: material.unidad,
          cantidad: material.cantidad,
        },
      ]);

    if (error) throw error;
  }

  async updateMaterial(
    material: Material
  ): Promise<void> {

    const { error } = await supabase
      .from("materiales")
      .update({
        nombrematerial: material.nombreMaterial,
        unidad: material.unidad,
        cantidad: material.cantidad,
      })
      .eq("nummaterial", material.numMaterial);

    if (error) throw error;
  }

  async deleteMaterial(
    numMaterial: number
  ): Promise<void> {

    const { error } = await supabase
      .from("materiales")
      .delete()
      .eq("nummaterial", numMaterial);

    if (error) throw error;
  }
}