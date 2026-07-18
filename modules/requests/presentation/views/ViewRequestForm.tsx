import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const screenWidth = Dimensions.get("window").width;
const repository = new SupabaseRequestsRepository();

type EvidenciaSeleccionada = {
  uri: string;
  name: string;
  type: string;
};

function getValue<T = any>(obj: any, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  return undefined;
}

const parseRequestParam = (value: string | string[] | undefined) => {
  if (!value || Array.isArray(value)) return null;

  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return null;
    }
  }
};

const formatDate = (date?: string | null) => {
  if (!date) return "No asignada";

  const cleanDate = String(date).split("T")[0];
  const parts = cleanDate.split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  return String(date);
};

const capitalize = (text?: string | null) => {
  if (!text) return "No asignada";

  const cleanText = String(text).toLowerCase().trim();

  return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
};

const limpiarTextoHtml = (value?: any) => {
  if (value === null || value === undefined || value === "") {
    return "No asignada";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

export default function ViewRequest() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [request, setRequest] = useState<RequestsForm | any | null>(null);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [materialesSolicitud, setMaterialesSolicitud] = useState<any[]>([]);
  const [modalCompletarVisible, setModalCompletarVisible] = useState(false);
  const [evidenciasSeleccionadas, setEvidenciasSeleccionadas] = useState<
    EvidenciaSeleccionada[]
  >([]);
  const [completandoSolicitud, setCompletandoSolicitud] = useState(false);

  const detectarSiEsAdmin = (data: any) => {
    if (!data || typeof data !== "object") return false;

    const numRol = Number(
      getValue(
        data,
        "numRol",
        "numrol",
        "num_rol",
        "idRol",
        "idrol",
        "id_rol",
        "rolId",
        "rol_id",
      ),
    );

    const rolObjeto = getValue<any>(
      data,
      "rol",
      "role",
      "rolData",
      "rolInfo",
      "rol_data",
      "rol_info",
    );

    const nombreRol = String(
      getValue(
        data,
        "nombreRol",
        "nombrerol",
        "nombre_rol",
        "rolNombre",
        "rol_nombre",
        "tipoRol",
        "tipo_rol",
      ) ??
        getValue(
          rolObjeto,
          "nombreRol",
          "nombrerol",
          "nombre_rol",
          "nombre",
          "name",
        ) ??
        "",
    ).toLowerCase();

    return numRol === 1 || nombreRol.includes("admin");
  };

  const cargarUsuarioActual = async () => {
    try {
      const keysDirectas = [
        "user",
        "usuario",
        "currentUser",
        "usuarioActual",
        "authUser",
        "userData",
        "usuarioData",
        "session",
        "sesion",
      ];

      for (const key of keysDirectas) {
        const value = await AsyncStorage.getItem(key);

        if (value) {
          const data = JSON.parse(value);

          if (detectarSiEsAdmin(data)) {
            setEsAdmin(true);
            return;
          }

          const usuarioInterno = getValue<any>(
            data,
            "usuario",
            "user",
            "currentUser",
            "authUser",
          );

          if (detectarSiEsAdmin(usuarioInterno)) {
            setEsAdmin(true);
            return;
          }
        }
      }

      const todasLasKeys = await AsyncStorage.getAllKeys();
      const pares = await AsyncStorage.multiGet(todasLasKeys);

      for (const [, value] of pares) {
        if (!value) continue;

        try {
          const data = JSON.parse(value);

          if (detectarSiEsAdmin(data)) {
            setEsAdmin(true);
            return;
          }

          const usuarioInterno = getValue<any>(
            data,
            "usuario",
            "user",
            "currentUser",
            "authUser",
          );

          if (detectarSiEsAdmin(usuarioInterno)) {
            setEsAdmin(true);
            return;
          }
        } catch {
          continue;
        }
      }

      setEsAdmin(false);
    } catch (error) {
      console.log("ERROR cargando usuario actual:", error);
      setEsAdmin(false);
    }
  };

  const normalizarMaterialesSolicitud = (list: any[] = []) => {
    return list.map((item, index) => {
      const material = getValue<any>(
        item,
        "material",
        "materialData",
        "material_data",
        "materiales",
      );

      return {
        id:
          getValue(
            item,
            "id",
            "idMaterialSolicitud",
            "id_material_solicitud",
          ) ??
          getValue(item, "numMaterial", "nummaterial", "num_material") ??
          getValue(material, "numMaterial", "nummaterial", "num_material") ??
          index,

        numMaterial:
          getValue(item, "numMaterial", "nummaterial", "num_material") ??
          getValue(material, "numMaterial", "nummaterial", "num_material") ??
          "N/A",

        nombre:
          getValue(
            item,
            "nombre",
            "nombreMaterial",
            "nombre_material",
            "material",
          ) ??
          getValue(material, "nombre", "nombreMaterial", "nombre_material") ??
          "Material sin nombre",

        descripcion:
          getValue(item, "descripcion") ??
          getValue(material, "descripcion") ??
          "",

        unidad: getValue(item, "unidad") ?? getValue(material, "unidad") ?? "",

        cantidad: Number(getValue(item, "cantidad") ?? 0),

        tipoMaterial:
          String(
            getValue(item, "tipoMaterial", "tipomaterial", "tipo_material") ??
              getValue(
                material,
                "tipoMaterial",
                "tipomaterial",
                "tipo_material",
              ) ??
              "material",
          )
            .trim()
            .toLowerCase() === "herramienta"
            ? "herramienta"
            : "material",
      };
    });
  };

  const cargarMaterialesSolicitud = async (
    numSolicitud: number,
    solicitudData?: any,
  ) => {
    try {
      const materialesDesdeSolicitud =
        getValue<any[]>(
          solicitudData,
          "materiales",
          "materialesSolicitud",
          "materiales_solicitud",
          "materialessolicitud",
          "materialesUsados",
          "materiales_usados",
        ) ?? [];

      if (
        Array.isArray(materialesDesdeSolicitud) &&
        materialesDesdeSolicitud.length > 0
      ) {
        setMaterialesSolicitud(
          normalizarMaterialesSolicitud(materialesDesdeSolicitud),
        );
        return;
      }

      const repo: any = repository;

      if (typeof repo.getRequestMaterials === "function") {
        const data = await repo.getRequestMaterials(numSolicitud);
        setMaterialesSolicitud(normalizarMaterialesSolicitud(data ?? []));
        return;
      }

      if (typeof repo.getMaterialsByRequest === "function") {
        const data = await repo.getMaterialsByRequest(numSolicitud);
        setMaterialesSolicitud(normalizarMaterialesSolicitud(data ?? []));
        return;
      }

      if (typeof repo.getSolicitudMateriales === "function") {
        const data = await repo.getSolicitudMateriales(numSolicitud);
        setMaterialesSolicitud(normalizarMaterialesSolicitud(data ?? []));
        return;
      }

      setMaterialesSolicitud([]);
    } catch (error) {
      console.log("ERROR cargando materiales de la solicitud:", error);
      setMaterialesSolicitud([]);
    }
  };

  const cargarSolicitud = async () => {
    const parsed = parseRequestParam(params.request);

    if (!parsed) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMaterialesSolicitud([]);

      const numSolicitud = Number(
        getValue(parsed, "numSolicitud", "numsolicitud", "num_solicitud"),
      );

      if (numSolicitud) {
        const data = await repository.getRequestById(numSolicitud);

        if (data) {
          setRequest(data);
          await cargarMaterialesSolicitud(numSolicitud, data);
          return;
        }

        await cargarMaterialesSolicitud(numSolicitud, parsed);
      }

      setRequest(parsed);
    } catch (error) {
      console.log("ERROR cargando solicitud:", error);
      setRequest(parsed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarioActual();
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarSolicitud();
      cargarUsuarioActual();
    }, [params.request]),
  );

  const evidencias = useMemo(() => {
    const list =
      getValue<any[]>(request, "evidencias", "imagenes", "imagen") ?? [];

    return list.map((e) => ({
      id:
        getValue(e, "idEvidencia", "idImagen", "idimagen", "id") ??
        Math.random().toString(),
      tipo:
        getValue<string>(
          e,
          "tipoEvidencia",
          "tipo_evidencia",
          "tipo",
          "tipoImagen",
        ) ?? "",
      ruta:
        getValue<string>(e, "ruta", "url", "uri", "imagen", "rutaImagen") ?? "",
    }));
  }, [request]);

  const evidenciasSolicitante = useMemo(() => {
    return evidencias.filter((e) => e.tipo === "solicitante");
  }, [evidencias]);

  const evidenciasTecnico = useMemo(() => {
    return evidencias.filter((e) => e.tipo === "tecnico");
  }, [evidencias]);

  const tipoAsignacionTecnica = useMemo(() => {
    if (!request) {
      return {
        tieneTecnicoExterno: false,
        tieneTecnicoInterno: false,
        soloTieneTecnicoExterno: false,
      };
    }

    const tieneValor = (value: any) =>
      value !== null && value !== undefined && value !== "" && value !== false;

    const tecnicos =
      getValue<any[]>(
        request,
        "tecnicos",
        "tecnicosAsignados",
        "tecnicos_asignados",
        "solicitudTecnicos",
        "solicitudtecnico",
        "solicitud_tecnico",
        "asignaciones",
      ) ?? [];

    let tieneTecnicoExterno =
      getValue<boolean>(
        request,
        "tieneTecnicoExterno",
        "tienetecnicoexterno",
        "tiene_tecnico_externo",
      ) === true;

    let tieneTecnicoInterno =
      getValue<boolean>(
        request,
        "tieneTecnicoInterno",
        "tienetecnicointerno",
        "tiene_tecnico_interno",
      ) === true;

    if (Array.isArray(tecnicos)) {
      tecnicos.forEach((tecnico) => {
        const tipo = String(
          getValue(
            tecnico,
            "tipo",
            "tipoTecnico",
            "tipotecnico",
            "tipo_tecnico",
          ) ?? "",
        )
          .trim()
          .toLowerCase();

        const externo = getValue(
          tecnico,
          "tecnicoExterno",
          "tecnico_externo",
          "tecnicoexterno",
          "proveedor",
          "externo",
          "numTecnicoExterno",
          "numtecnicoexterno",
          "num_tecnico_externo",
          "idTecnicoExterno",
          "idtecnicoexterno",
          "id_tecnico_externo",
        );

        const interno = getValue(
          tecnico,
          "tecnicoInterno",
          "tecnico_interno",
          "tecnicointerno",
          "usuario",
          "interno",
          "numTecnicoInterno",
          "numtecnicointerno",
          "num_tecnico_interno",
          "idTecnicoInterno",
          "idtecnicointerno",
          "id_tecnico_interno",
        );

        if (
          tipo.includes("extern") ||
          tipo.includes("proveedor") ||
          tieneValor(externo)
        ) {
          tieneTecnicoExterno = true;
        }

        if (tipo.includes("intern") || tieneValor(interno)) {
          tieneTecnicoInterno = true;
        }
      });
    }

    const tecnicoExternoDirecto = getValue(
      request,
      "tecnicoExterno",
      "tecnico_externo",
      "tecnicoexterno",
      "numTecnicoExterno",
      "numtecnicoexterno",
      "num_tecnico_externo",
      "nombreTecnicoExterno",
      "nombre_tecnico_externo",
      "proveedor",
    );

    const tecnicoInternoDirecto = getValue(
      request,
      "tecnicoInterno",
      "tecnico_interno",
      "tecnicointerno",
      "numTecnicoInterno",
      "numtecnicointerno",
      "num_tecnico_interno",
      "nombreTecnicoInterno",
      "nombre_tecnico_interno",
    );

    if (tieneValor(tecnicoExternoDirecto)) tieneTecnicoExterno = true;
    if (tieneValor(tecnicoInternoDirecto)) tieneTecnicoInterno = true;

    return {
      tieneTecnicoExterno,
      tieneTecnicoInterno,
      soloTieneTecnicoExterno: tieneTecnicoExterno && !tieneTecnicoInterno,
    };
  }, [request]);

  const { tieneTecnicoExterno, soloTieneTecnicoExterno } =
    tipoAsignacionTecnica;

  const statusColors: Record<number, { background: string; text: string }> = {
    1: { background: "#d7d7d7", text: "#6c6c6c" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const prioridadColors: Record<string, { background: string; text: string }> =
    {
      baja: { background: "#FECACA", text: "#991B1B" },
      media: { background: "#FEF3C7", text: "#92400E" },
      alta: { background: "#D1FAE5", text: "#065F46" },
    };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? statusColors[1];

  const getPrioridadStyle = (prioridad?: string | null) => {
    const prioridadNormalizada = String(prioridad ?? "")
      .toLowerCase()
      .trim();

    return (
      prioridadColors[prioridadNormalizada] ?? {
        background: "#E5E7EB",
        text: "#374151",
      }
    );
  };

  const getStatusName = (status: number) => {
    switch (status) {
      case 1:
        return "Generada";
      case 2:
        return "Asignada";
      case 3:
        return "En proceso";
      case 4:
        return "Terminada";
      case 5:
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  const getTipo = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Servicio";
      case 2:
        return "Mantenimiento";
      default:
        return "N/A";
    }
  };

  const getTipoMantenimiento = (tipo?: number) => {
    switch (tipo) {
      case 1:
        return "Preventivo";
      case 2:
        return "Correctivo";
      case 3:
        return "Reactivo";
      default:
        return "N/A";
    }
  };

  const getArea = (area: number) => {
    switch (area) {
      case 1:
        return "Administración";
      case 2:
        return "Fábrica";
      case 3:
        return "Campo";
      case 4:
        return "Zona habitacional";
      default:
        return "N/A";
    }
  };

  const getTecnicosAsignados = () => {
    const tecnicos =
      getValue<any[]>(
        request,
        "tecnicos",
        "tecnicosAsignados",
        "tecnicos_asignados",
        "solicitudTecnicos",
        "solicitudtecnico",
        "solicitud_tecnico",
        "asignaciones",
      ) ?? [];

    if (Array.isArray(tecnicos) && tecnicos.length > 0) {
      return tecnicos
        .map((t) => {
          const usuario = getValue<any>(
            t,
            "usuario",
            "tecnicoInterno",
            "tecnico_interno",
          );

          const externo = getValue<any>(
            t,
            "tecnicoExterno",
            "tecnico_externo",
            "tecnicoexterno",
            "proveedor",
            "externo",
          );

          return (
            getValue<string>(
              t,
              "nombre",
              "nombreTecnico",
              "nombre_tecnico",
              "tecnico",
              "label",
            ) ??
            getValue<string>(usuario, "nombre") ??
            getValue<string>(externo, "nombre") ??
            "Técnico asignado"
          );
        })
        .join(", ");
    }

    return (
      getValue<string>(
        request,
        "tecnico",
        "tecnicoAsignado",
        "nombreTecnico",
        "nombre_tecnico",
        "personaAsignada",
        "nombreTecnicoExterno",
        "nombre_tecnico_externo",
      ) ?? "No asignado"
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando solicitud...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la solicitud</Text>
      </View>
    );
  }

  const numStatus = Number(
    getValue(request, "numStatus", "numstatus", "num_status") ?? 1,
  );

  const numTipo = Number(
    getValue(request, "numTipo", "numtipo", "num_tipo") ?? 0,
  );

  const numTipoMantenimiento = Number(
    getValue(
      request,
      "numTipoMantenimiento",
      "numtipomantenimiento",
      "num_tipo_mantenimiento",
    ) ?? 0,
  );

  const numArea = Number(
    getValue(request, "numArea", "numarea", "num_area") ?? 0,
  );

  const numSolicitud =
    getValue(request, "numSolicitud", "numsolicitud", "num_solicitud") ?? "N/A";

  const fecha = getValue<string>(request, "fecha");
  const descripcion = getValue<string>(request, "descripcion");

  const solicitante =
    getValue<string>(
      request,
      "solicitante",
      "nombreSolicitante",
      "nombre_solicitante",
    ) ?? "No disponible";

  const fechaAsignacion = getValue<string>(
    request,
    "fechaAsignacion",
    "fechaasignacion",
    "fecha_asignacion",
  );

  const fechaProgInicio = getValue<string>(
    request,
    "fechaProgInicio",
    "fechaproginicio",
    "fecha_prog_inicio",
  );

  const fechaProgFin = getValue<string>(
    request,
    "fechaProgFin",
    "fechaprogfin",
    "fecha_prog_fin",
  );

  const prioridad = getValue<string>(request, "prioridad");

  const fechaInicioReal = getValue<string>(
    request,
    "fechaInicioReal",
    "fechainicioreal",
    "fecha_inicio_real",
  );

  const fechaFinReal = getValue<string>(
    request,
    "fechaFinReal",
    "fechafinreal",
    "fecha_fin_real",
  );

  const comentarios = getValue<string>(request, "comentarios");

  const motivoCancelacion = getValue<string>(
    request,
    "motivoCancelacion",
    "motivocancelacion",
    "motivo_cancelacion",
  );

  const statusStyle = getStatusStyle(numStatus);
  const prioridadStyle = getPrioridadStyle(prioridad);

  const mostrarAsignacion =
    numStatus >= 2 ||
    fechaAsignacion ||
    fechaProgInicio ||
    fechaProgFin ||
    prioridad;

  const mostrarDatosTecnico =
    fechaInicioReal || fechaFinReal || materialesSolicitud.length > 0;

  const seleccionarEvidencias = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitas permitir el acceso a tus imágenes para subir evidencias.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const nuevasEvidencias: EvidenciaSeleccionada[] = result.assets.map(
        (asset, index) => ({
          uri: asset.uri,
          name:
            asset.fileName ??
            `evidencia_proveedor_${Date.now()}_${index + 1}.jpg`,
          type: asset.mimeType ?? "image/jpeg",
        }),
      );

      setEvidenciasSeleccionadas((actuales) => {
        const urisActuales = new Set(actuales.map((imagen) => imagen.uri));
        const nuevasSinRepetir = nuevasEvidencias.filter(
          (imagen) => !urisActuales.has(imagen.uri),
        );

        return [...actuales, ...nuevasSinRepetir];
      });
    } catch (error) {
      console.log("ERROR seleccionando evidencias:", error);
      Alert.alert("Error", "No se pudieron seleccionar las imágenes.");
    }
  };

  const eliminarEvidenciaSeleccionada = (uri: string) => {
    setEvidenciasSeleccionadas((actuales) =>
      actuales.filter((imagen) => imagen.uri !== uri),
    );
  };

  const cerrarModalCompletar = () => {
    if (completandoSolicitud) return;

    setModalCompletarVisible(false);
    setEvidenciasSeleccionadas([]);
  };

  const marcarComoCompletada = async () => {
    if (completandoSolicitud) return;

    const solicitudId = Number(numSolicitud);

    if (!Number.isFinite(solicitudId) || solicitudId <= 0) {
      Alert.alert("Error", "No se encontró el número de la solicitud.");
      return;
    }

    if (!soloTieneTecnicoExterno) {
      Alert.alert(
        "Acción no disponible",
        "Este botón solamente se utiliza cuando la solicitud tiene únicamente técnico externo (proveedor).",
      );
      return;
    }

    if (evidenciasSeleccionadas.length === 0) {
      Alert.alert(
        "Evidencias requeridas",
        "Agrega al menos una imagen antes de completar la solicitud.",
      );
      return;
    }

    try {
      setCompletandoSolicitud(true);

      const hoy = new Date().toISOString().split("T")[0];

      await repository.uploadRequestImages(
        solicitudId,
        evidenciasSeleccionadas.map((imagen) => imagen.uri),
        "tecnico",
      );

      await repository.completeRequest(solicitudId, {
        fechaInicioReal: fechaInicioReal ?? hoy,
        fechaFinReal: hoy,
        comentarios:
          comentarios?.trim() ||
          "Solicitud completada por el administrador con técnico externo.",
        materiales: [],
      });

      const solicitudActualizada = await repository.getRequestById(solicitudId);

      if (solicitudActualizada) {
        setRequest(solicitudActualizada);
        await cargarMaterialesSolicitud(solicitudId, solicitudActualizada);
      }

      setModalCompletarVisible(false);
      setEvidenciasSeleccionadas([]);

      Alert.alert(
        "Solicitud completada",
        "La solicitud se marcó como terminada y las evidencias fueron guardadas.",
      );
    } catch (error) {
      console.log("ERROR completando solicitud externa:", error);
      Alert.alert(
        "Error",
        "No se pudo completar la solicitud. Verifica la conexión e inténtalo nuevamente.",
      );
    } finally {
      setCompletandoSolicitud(false);
    }
  };

  const crearHtmlSolicitud = () => {
    const datosTecnicoHtml = mostrarDatosTecnico
      ? `
        <div class="section">
          <div class="title">Datos Técnico</div>

          <div class="subtitle-section">Fechas reales</div>

          <div class="label">Inicio real:</div>
          <div class="value">${limpiarTextoHtml(
            formatDate(fechaInicioReal),
          )}</div>

          <div class="label">Fin real:</div>
          <div class="value">${limpiarTextoHtml(formatDate(fechaFinReal))}</div>

          ${
            materialesSolicitud.length > 0
              ? `
                <div class="subtitle-section">Materiales utilizados</div>

                ${materialesSolicitud
                  .map(
                    (material) => `
                      <div class="material-item">
                        <div class="label">${limpiarTextoHtml(
                          material.nombre,
                        )}</div>

                        <div class="value">
                          Cantidad: ${limpiarTextoHtml(material.cantidad)}
                          ${
                            material.unidad
                              ? limpiarTextoHtml(material.unidad)
                              : ""
                          }
                        </div>

                        ${
                          material.descripcion
                            ? `<div class="value">Descripción: ${limpiarTextoHtml(
                                material.descripcion,
                              )}</div>`
                            : ""
                        }
                      </div>
                    `,
                  )
                  .join("")}
              `
              : `
                <div class="subtitle-section">Materiales utilizados</div>
                <div class="value">Sin materiales registrados</div>
              `
          }
        </div>
      `
      : "";

    return `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            h1 {
              color: #148248;
              text-align: center;
              margin-bottom: 4px;
            }

            .subtitle {
              text-align: center;
              color: #4B5563;
              margin-bottom: 20px;
            }

            .section {
              margin-top: 18px;
              padding: 14px;
              border: 1px solid #E5E7EB;
              border-radius: 10px;
            }

            .title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #148248;
            }

            .subtitle-section {
              font-size: 15px;
              font-weight: bold;
              margin-top: 12px;
              margin-bottom: 6px;
              color: #111827;
            }

            .label {
              font-weight: bold;
              margin-top: 8px;
            }

            .value {
              margin-bottom: 6px;
              color: #374151;
            }

            .material-item {
              border-bottom: 1px solid #E5E7EB;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }

            .badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: bold;
            }

            .comments-section {
              min-height: 260px;
            }

            .comments-writing-box {
              height: 220px;
              border: 1.5px solid #9CA3AF;
              border-radius: 8px;
              margin-top: 10px;
              background-image: repeating-linear-gradient(
                to bottom,
                #ffffff 0px,
                #ffffff 31px,
                #D1D5DB 32px
              );
            }
          </style>
        </head>

        <body>
          <h1>Solicitud de servicio</h1>
          <div class="subtitle">ZUCARMEX</div>

          <div class="section">
            <div class="title">Información general</div>
            
            <div class="label">Solicitante:</div>
            <div class="value">${limpiarTextoHtml(solicitante)}</div>

            <div class="label">Tipo:</div>
            <div class="value">${limpiarTextoHtml(getTipo(numTipo))}</div>

            <div class="label">Tipo de mantenimiento:</div>
            <div class="value">${limpiarTextoHtml(
              getTipoMantenimiento(numTipoMantenimiento),
            )}</div>

            <div class="label">Fecha:</div>
            <div class="value">${limpiarTextoHtml(formatDate(fecha))}</div>

            <div class="label">Área:</div>
            <div class="value">${limpiarTextoHtml(getArea(numArea))}</div>

            <div class="label">Estado:</div>
            <div class="value">
              <span
                class="badge"
                style="background: ${statusStyle.background}; color: ${statusStyle.text};"
              >
                ${limpiarTextoHtml(getStatusName(numStatus))}
              </span>
            </div>
          </div>

          <div class="section">
            <div class="title">Descripción</div>
            <div class="value">${limpiarTextoHtml(
              descripcion || "Sin descripción",
            )}</div>
          </div>

          <div class="section">
            <div class="title">Datos de asignación</div>

            <div class="label">Técnico asignado:</div>
            <div class="value">${limpiarTextoHtml(getTecnicosAsignados())}</div>

            <div class="label">Fecha de asignación:</div>
            <div class="value">${limpiarTextoHtml(
              formatDate(fechaAsignacion),
            )}</div>

            <div class="label">Fecha programada de inicio:</div>
            <div class="value">${limpiarTextoHtml(
              formatDate(fechaProgInicio),
            )}</div>

            <div class="label">Fecha programada de fin:</div>
            <div class="value">${limpiarTextoHtml(
              formatDate(fechaProgFin),
            )}</div>

            <div class="label">Prioridad:</div>
            <div class="value">
              <span
                class="badge"
                style="background: ${prioridadStyle.background}; color: ${prioridadStyle.text};"
              >
                ${limpiarTextoHtml(capitalize(prioridad))}
              </span>
            </div>
          </div>

          ${datosTecnicoHtml}

          <div class="section comments-section">
            <div class="title">Comentarios</div>
            <div class="comments-writing-box"></div>
          </div>
        </body>
      </html>
    `;
  };

  const descargarSolicitud = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: crearHtmlSolicitud(),
      });

      const puedeCompartir = await Sharing.isAvailableAsync();

      if (!puedeCompartir) {
        Alert.alert("PDF generado", `Archivo generado en: ${uri}`);
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Descargar solicitud ${numSolicitud}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.log("ERROR descargando solicitud:", error);
      Alert.alert("Error", "No se pudo descargar la solicitud.");
    }
  };

  console.log("ES ADMIN:", esAdmin);
  console.log("TIENE TECNICO EXTERNO:", tieneTecnicoExterno);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image
              source={require("../../../../assets/images/ZUCARMEX.png")}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Información general</Text>

            <Text style={styles.label}>Solicitante:</Text>
            <Text style={styles.value}>{solicitante}</Text>

            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{getTipo(numTipo)}</Text>

            {numTipo === 2 && (
              <>
                <Text style={styles.label}>Tipo de mantenimiento:</Text>
                <Text style={styles.value}>
                  {getTipoMantenimiento(numTipoMantenimiento)}
                </Text>
              </>
            )}

            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{formatDate(fecha)}</Text>

            <Text style={styles.label}>Área:</Text>
            <Text style={styles.value}>{getArea(numArea)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.value}>{descripcion || "Sin descripción"}</Text>
          </View>

          {evidenciasSolicitante.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Evidencias del solicitante
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {evidenciasSolicitante.map((e) => (
                  <Image
                    key={String(e.id)}
                    source={{ uri: e.ruta }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {mostrarAsignacion && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Datos de asignación</Text>

              <Text style={styles.label}>Técnico asignado:</Text>
              <Text style={styles.value}>{getTecnicosAsignados()}</Text>

              <Text style={styles.label}>Fecha de asignación:</Text>
              <Text style={styles.value}>{formatDate(fechaAsignacion)}</Text>

              <Text style={styles.label}>Fecha programada de inicio:</Text>
              <Text style={styles.value}>{formatDate(fechaProgInicio)}</Text>

              <Text style={styles.label}>Fecha programada de fin:</Text>
              <Text style={styles.value}>{formatDate(fechaProgFin)}</Text>

              <Text style={styles.label}>Prioridad:</Text>

              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: prioridadStyle.background },
                ]}
              >
                <Text
                  style={{
                    color: prioridadStyle.text,
                    fontWeight: "bold",
                  }}
                >
                  {capitalize(prioridad)}
                </Text>
              </View>
            </View>
          )}

          {mostrarDatosTecnico && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Datos Técnico</Text>

              <Text style={styles.subSectionTitle}>Fechas reales</Text>

              <Text style={styles.label}>Inicio real:</Text>
              <Text style={styles.value}>{formatDate(fechaInicioReal)}</Text>

              <Text style={styles.label}>Fin real:</Text>
              <Text style={styles.value}>{formatDate(fechaFinReal)}</Text>

              <Text style={styles.subSectionTitle}>Materiales utilizados</Text>

              {materialesSolicitud.length > 0 ? (
                materialesSolicitud.map((material) => (
                  <View key={String(material.id)} style={styles.materialItem}>
                    <Text style={styles.materialName}>{material.nombre}</Text>

                    <Text style={styles.value}>
                      <Text style={styles.label}>Tipo:</Text>{" "}
                      {material.tipoMaterial === "herramienta"
                        ? "Herramienta"
                        : "Material"}
                    </Text>

                    <Text style={styles.value}>
                      <Text style={styles.label}>Cantidad:</Text>{" "}
                      {material.cantidad}
                      {material.unidad ? ` ${material.unidad}` : ""}
                    </Text>

                    {material.descripcion ? (
                      <Text style={styles.value}>
                        <Text style={styles.label}>Descripción:</Text>{" "}
                        {material.descripcion}
                      </Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text style={styles.value}>Sin materiales registrados</Text>
              )}
            </View>
          )}

          {evidenciasTecnico.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Evidencias del técnico</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {evidenciasTecnico.map((e) => (
                  <Image
                    key={String(e.id)}
                    source={{ uri: e.ruta }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {comentarios && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Comentarios</Text>
              <Text style={styles.value}>{comentarios}</Text>
            </View>
          )}

          {motivoCancelacion && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Motivo de cancelación</Text>
              <Text style={styles.value}>{motivoCancelacion}</Text>
            </View>
          )}

          {esAdmin &&
            soloTieneTecnicoExterno &&
            (numStatus === 2 || numStatus === 3) && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => setModalCompletarVisible(true)}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={24}
                  color="#070707"
                  style={styles.downloadIcon}
                />

                <Text style={styles.textComplete}>
                  Marcar como completada
                </Text>
              </TouchableOpacity>
            )}

          {esAdmin && tieneTecnicoExterno && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={descargarSolicitud}
            >
              <MaterialCommunityIcons
                name="file-download-outline"
                size={24}
                color="#fff"
                style={styles.downloadIcon}
              />

              <Text style={styles.downloadButtonText}>Descargar solicitud</Text>
            </TouchableOpacity>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Estado</Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.background },
              ]}
            >
              <Text
                style={{
                  color: statusStyle.text,
                  fontWeight: "bold",
                }}
              >
                {getStatusName(numStatus)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalCompletarVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModalCompletar}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialCommunityIcons
                  name="check-decagram-outline"
                  size={28}
                  color="#148248"
                />

                <Text style={styles.modalTitle}>Completar solicitud</Text>
              </View>

              <TouchableOpacity
                onPress={cerrarModalCompletar}
                disabled={completandoSolicitud}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={26}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Agrega las imágenes de evidencia y después márcala como
              completada.
            </Text>

            <TouchableOpacity
              style={styles.selectImagesButton}
              onPress={seleccionarEvidencias}
              disabled={completandoSolicitud}
            >
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={23}
                color="#148248"
              />
              <Text style={styles.selectImagesButtonText}>
                Seleccionar evidencias
              </Text>
            </TouchableOpacity>

            {evidenciasSeleccionadas.length === 0 ? (
              <View style={styles.emptyEvidenceBox}>
                <MaterialCommunityIcons
                  name="image-off-outline"
                  size={38}
                  color="#9CA3AF"
                />
                <Text style={styles.emptyEvidenceText}>
                  Debes agregar al menos una imagen.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.selectedImagesScroll}
                contentContainerStyle={styles.selectedImagesContainer}
              >
                {evidenciasSeleccionadas.map((imagen, index) => (
                  <View
                    key={`${imagen.uri}-${index}`}
                    style={styles.previewItem}
                  >
                    <Image
                      source={{ uri: imagen.uri }}
                      style={styles.previewImage}
                    />

                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => eliminarEvidenciaSeleccionada(imagen.uri)}
                      disabled={completandoSolicitud}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={18}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <Text style={styles.selectedCountText}>
              {evidenciasSeleccionadas.length} evidencia(s) seleccionada(s)
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={cerrarModalCompletar}
                disabled={completandoSolicitud}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmCompleteButton,
                  (completandoSolicitud ||
                    evidenciasSeleccionadas.length === 0) &&
                    styles.disabledButton,
                ]}
                onPress={marcarComoCompletada}
                disabled={
                  completandoSolicitud || evidenciasSeleccionadas.length === 0
                }
              >
                {completandoSolicitud ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="check"
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.confirmCompleteButtonText}>
                      Marcar como completada
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    backgroundColor: "#148248",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },

  headerCenter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  imageZucarmex: {
    width: "45%",
    height: 60,
  },

  content: {
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },

  subSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
    color: "#111827",
  },

  label: {
    fontWeight: "bold",
    marginTop: 8,
    color: "#374151",
  },

  value: {
    marginBottom: 5,
    marginLeft: 5,
    color: "#4B5563",
  },

  image: {
    width: screenWidth * 0.7,
    height: 220,
    borderRadius: 15,
    marginRight: 10,
  },

  materialItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 10,
    marginBottom: 10,
  },

  materialName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },

  completeButton: {
    backgroundColor: "#d6ebc4",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
textComplete:{
 color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
},
  downloadButton: {
    backgroundColor: "#148248",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  downloadIcon: {
    marginRight: 8,
  },

  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  priorityBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 5,
    marginBottom: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
    maxHeight: "86%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  modalTitle: {
    marginLeft: 9,
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },

  modalDescription: {
    color: "#4B5563",
    lineHeight: 21,
    marginBottom: 16,
  },

  selectImagesButton: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: "#148248",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  selectImagesButtonText: {
    color: "#148248",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  emptyEvidenceBox: {
    minHeight: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },

  emptyEvidenceText: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
  },

  selectedImagesScroll: {
    maxHeight: 300,
  },

  selectedImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 2,
  },

  previewItem: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },

  removeImageButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedCountText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 16,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelModalButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelModalButtonText: {
    color: "#374151",
    fontWeight: "bold",
    fontSize: 15,
  },

  confirmCompleteButton: {
    flex: 2,
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: "#148248",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  confirmCompleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },

  disabledButton: {
    opacity: 0.55,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});