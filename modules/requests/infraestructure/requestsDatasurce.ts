import { supabase } from "@/lib/supabase";
import { CreateRequest, Prioridad, RequestsForm } from "../domain/request";
import { RequestsRepository } from "../domain/requestRepository";

export class SupabaseRequestsRepository implements RequestsRepository {

  async createRequest(request: CreateRequest): Promise<number> {

    const { data, error } = await supabase
      .from("solicitudes")
      .insert([{
        ...request,
        numStatus: 1 
      }])
      .select("numsolicitud")
      .single();

    if (error || !data) {
      console.log("ERROR createRequest:", error);
      throw new Error("Error al crear solicitud");
    }

    return data.numsolicitud;
  }

  async getRequests(): Promise<RequestsForm[]> {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*");

    if (error) throw error;
    return (data ?? []) as RequestsForm[];
  }

  async getRequestById(id: number): Promise<RequestsForm | null> {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("numsolicitud", id)
      .single();

    if (error || !data) return null;
    return data as RequestsForm;
  }

  async getRequestsBySolicitante(numSolicitante: number): Promise<RequestsForm[]> {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("numsolicitante", numSolicitante);

    if (error) {
      console.log("ERROR getRequestsBySolicitante:", error);
      return [];
    }

    return (data ?? []) as RequestsForm[];
  }

  async getRequestsByStatus(numStatus: number): Promise<RequestsForm[]> {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("numstatus", numStatus);

    if (error) {
      console.log("ERROR getRequestsByStatus:", error);
      return [];
    }

    return (data ?? []) as RequestsForm[];
  }

  async updateRequest(id: number, request: Partial<RequestsForm>): Promise<boolean> {

    const { error } = await supabase
      .from("solicitudes")
      .update(request)
      .eq("numsolicitud", id);

    if (error) {
      console.log("ERROR updateRequest:", error);
      return false;
    }

    return true;
  }

  async deleteRequest(id: number): Promise<boolean> {

    const { error } = await supabase
      .from("solicitudes")
      .delete()
      .eq("numsolicitud", id);

    if (error) {
      console.log("ERROR deleteRequest:", error);
      return false;
    }

    return true;
  }

  async assignRequest(id: number, prioridad: Prioridad): Promise<boolean> {

    const { error } = await supabase
      .from("solicitudes")
      .update({
        prioridad,
        numStatus: 2,
        fechaAsignacion: new Date().toISOString().split("T")[0],
      })
      .eq("numsolicitud", id);

    if (error) {
      console.log("ERROR assignRequest:", error);
      return false;
    }

    return true;
  }

  async rejectRequest(id: number, motivoCancelacion: string): Promise<boolean> {

    const { error } = await supabase
      .from("solicitudes")
      .update({
        numStatus: 5,
        motivoCancelacion,
      })
      .eq("numsolicitud", id);

    if (error) {
      console.log("ERROR rejectRequest:", error);
      return false;
    }

    return true;
  }

  async completeRequest(id: number, data: Partial<RequestsForm>): Promise<boolean> {

    const { error } = await supabase
      .from("solicitudes")
      .update({
        ...data,
        numStatus: 4,
        fechaFinReal: new Date().toISOString().split("T")[0],
      })
      .eq("numsolicitud", id);

    if (error) {
      console.log("ERROR completeRequest:", error);
      return false;
    }

    return true;
  }


  async getRequestsByTecnicoInterno(numTecnico: number): Promise<RequestsForm[]> {
    const { data, error } = await supabase
      .from("solicitud_tecnico_interno")
      .select("numsolicitud")
      .eq("numtecnicointerno", numTecnico);

    if (error || !data) return [];

    const ids = data.map(r => r.numsolicitud);

    const { data: solicitudes } = await supabase
      .from("solicitudes")
      .select("*")
      .in("numsolicitud", ids);

    return (solicitudes ?? []) as RequestsForm[];
  }

  async getRequestsByTecnicoExterno(numTecnico: number): Promise<RequestsForm[]> {
    const { data, error } = await supabase
      .from("solicitud_tecnico_externo")
      .select("numsolicitud")
      .eq("numtecnicoexterno", numTecnico);

    if (error || !data) return [];

    const ids = data.map(r => r.numsolicitud);

    const { data: solicitudes } = await supabase
      .from("solicitudes")
      .select("*")
      .in("numsolicitud", ids);

    return (solicitudes ?? []) as RequestsForm[];
  }
}