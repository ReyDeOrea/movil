import { Prioridad } from "../domain/request";

export const validateAdminAssignment = (data: {
  personaAsignada: string;
  fechaInicio: Date;
  fechaFin: Date;
  prioridad: Prioridad;
}) => {
  if (!data.personaAsignada || !data.personaAsignada.trim()) {
    throw new Error("Selecciona una persona asignada");
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