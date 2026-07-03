import { Prioridad } from "../domain/request";

export const validateAdminAssignment = (data: {
  personaAsignada: string;
  fechaInicio: Date;
  fechaFin: Date;
  prioridad: Prioridad;
}) => {
  if (!data.personaAsignada) {
    throw new Error("Selecciona una persona asignada");
  }

  if (!data.fechaInicio) {
    throw new Error("Selecciona la fecha de inicio");
  }

  if (!data.fechaFin) {
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