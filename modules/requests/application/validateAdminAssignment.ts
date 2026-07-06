import { Prioridad } from "../domain/request";

type TipoTecnico = "externo" | "interno" | "ambos";

export const validateAdminAssignment = (data: {
  tipoTecnico?: TipoTecnico;
  personaAsignada?: string;
  tecnicoInternoAsignado?: string;
  tecnicoExternoAsignado?: string;
  fechaInicio: Date;
  fechaFin: Date;
  prioridad: Prioridad;
}) => {
  const tipoTecnico = data.tipoTecnico ?? "interno";

  if (tipoTecnico === "interno") {
    const tecnicoInterno = data.tecnicoInternoAsignado ?? data.personaAsignada ?? "";

    if (!tecnicoInterno.trim()) {
      throw new Error("Selecciona un técnico interno");
    }
  }

  if (tipoTecnico === "externo") {
    const tecnicoExterno = data.tecnicoExternoAsignado ?? data.personaAsignada ?? "";

    if (!tecnicoExterno.trim()) {
      throw new Error("Selecciona un técnico externo");
    }
  }

  if (tipoTecnico === "ambos") {
    if (!data.tecnicoInternoAsignado?.trim()) {
      throw new Error("Selecciona un técnico interno");
    }

    if (!data.tecnicoExternoAsignado?.trim()) {
      throw new Error("Selecciona un técnico externo");
    }
  }

  if (!(data.fechaInicio instanceof Date) || isNaN(data.fechaInicio.getTime())) {
    throw new Error("Selecciona la fecha de inicio");
  }

  if (!(data.fechaFin instanceof Date) || isNaN(data.fechaFin.getTime())) {
    throw new Error("Selecciona la fecha de fin");
  }

  if (data.fechaFin < data.fechaInicio) {
    throw new Error("La fecha fin no puede ser menor que la fecha inicio");
  }

  if (!data.prioridad) {
    throw new Error("Selecciona la prioridad");
  }

  return true;
};