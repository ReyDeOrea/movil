import { supabase } from "@/lib/supabase";


import { CreateRequests, RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class SupabaseRequestsRepository
  implements RequestsRepository {

  async addRequest(
    request: CreateRequests): Promise<RequestsForm | null> {

    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data as RequestsForm;
    }
    catch (e) {
      console.log("ERROR addRequest:", e);
      return null;
    }
  }

  async getRequests(): Promise<RequestsForm[]> {

    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*");

      if (error) throw error;
      return data as RequestsForm[];
    }
    catch (e) {
      console.log("ERROR getRequests:", e);
      return [];
    }
  }

  async getRequestById(
    id: string): Promise<RequestsForm | null> {

    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as RequestsForm;
    }
    catch (e) {
      console.log("ERROR getRequestById:", e);
      return null;
    }
  }

  async updateRequest(
    id: string,
    request: Partial<RequestsForm>): Promise<boolean> {

    try {
      const { error } = await supabase
        .from("solicitudes")
        .update(request)
        .eq("id", id);

      if (error) throw error;
      return true;
    }
    catch (e) {
      console.log("ERROR updateRequest:", e);
      return false;
    }
  }

  async deleteRequest(id: string): Promise<boolean> {

    try {
      const { error } = await supabase
        .from("solicitudes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    }
    catch (e) {
      console.log("ERROR deleteRequest:", e);
      return false;
    }
  }

  async assignRequest(
    id: string,
    tecnico_id: string,
    prioridad: "baja" | "media" | "alta"): Promise<boolean> {

    try {
      const { error } = await supabase
        .from("solicitudes")
        .update({
          tecnico_id,
          prioridad,
          estado: "asignada",
          fecha_asignada: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      return true;
    }
    catch (e) {
      console.log("ERROR assignRequest:", e);
      return false;
    }
  }

  async rejectRequest(
    id: string,
    motivo_rechazo: string
  ): Promise<boolean> {

    try {
      const { error } = await supabase
        .from("solicitudes")
        .update({
          estado: "rechazada",
          motivo_rechazo
        })
        .eq("id", id);

      if (error) throw error;
      return true;
    } 
    catch (e) {
      console.log("ERROR rejectRequest:", e);
      return false;
    }
  }

  async completeRequest(
    id: string,
    data: Partial<RequestsForm> ): Promise<boolean> {

    try {
      const { error } = await supabase
        .from("solicitudes")
        .update({
          ...data,
          estado: "terminada"
        })
        .eq("id", id);

      if (error) throw error;
      return true;
    } 
    catch (e) {
      console.log("ERROR completeRequest:", e);
      return false;
    }
  }

  async getRequestsBySolicitante(
    solicitante_id: string): Promise<RequestsForm[]> {

    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("solicitante_id", solicitante_id);

      if (error) throw error;
      return data as RequestsForm[];
    } 
    catch (e) {
      console.log(
        "ERROR getRequestsBySolicitante:",
        e
      );
      return [];
    }
  }

  async getRequestsByTecnico(
    tecnico_id: string ): Promise<RequestsForm[]> {

    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("tecnico_id", tecnico_id);
      if (error) throw error;
      return data as RequestsForm[];
    }
    catch (e) {
      console.log(
        "ERROR getRequestsByTecnico:",
        e
      );
      return [];
    }
  }
}