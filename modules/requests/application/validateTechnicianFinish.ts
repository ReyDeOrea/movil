import { DetalleMaterial, ImageInput } from "../domain/request";

export const validateTechnicianFinish = (data: {
  numSolicitud: number;
  fechaInicioReal: Date;
  fechaFinReal: Date;
  comentarios: string;
  materiales: DetalleMaterial[];
  imagenes: ImageInput[];
}) => {
  if (!data.numSolicitud) {
    throw new Error("No se encontró el número de solicitud");
  }

  if (
    !(data.fechaInicioReal instanceof Date) ||
    isNaN(data.fechaInicioReal.getTime())
  ) {
    throw new Error("Selecciona la fecha real de inicio");
  }

  if (
    !(data.fechaFinReal instanceof Date) ||
    isNaN(data.fechaFinReal.getTime())
  ) {
    throw new Error("Selecciona la fecha real de fin");
  }

  if (data.fechaFinReal < data.fechaInicioReal) {
    throw new Error("La fecha real de fin no puede ser menor que la fecha real de inicio");
  }

  const materialSinCantidad = data.materiales.find(
    (item) => !item.cantidad || Number(item.cantidad) <= 0
  );

  if (materialSinCantidad) {
    throw new Error("Todos los materiales seleccionados deben tener cantidad");
  }

  if (!data.comentarios || !data.comentarios.trim()) {
    throw new Error("Ingresa los comentarios finales");
  }

  if (!data.imagenes || data.imagenes.length === 0) {
    throw new Error("Agrega al menos una imagen de evidencia del técnico");
  }

  return true;
};