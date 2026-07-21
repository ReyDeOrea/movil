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
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

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
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 370 || height < 650;
  const isTablet = width >= 700;
  const isLandscape = width > height;

  const contentWidth = Math.max(
    280,
    Math.min(width - (isTablet ? 64 : 24), 900),
  );

  const evidenceWidth = Math.max(
    240,
    Math.min(
      width - (isTablet ? 120 : 54),
      isTablet ? 420 : isLandscape ? 360 : width * 0.78,
    ),
  );

  const modalWidth = Math.max(
    280,
    Math.min(width - (isTablet ? 120 : 20), 620),
  );

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

  const prioridadColors: Record<
    string,
    { background: string; text: string; border: string }
  > = {
    baja: {
      background: "#ECFDF5",
      text: "#065F46",
      border: "#A7F3D0",
    },
    media: {
      background: "#FFFBEB",
      text: "#92400E",
      border: "#FDE68A",
    },
    alta: {
      background: "#FFF7ED",
      text: "#9A3412",
      border: "#FDBA74",
    },
    urgente: {
      background: "#FEF2F2",
      text: "#991B1B",
      border: "#FCA5A5",
    },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? statusColors[1];

  const getPrioridadStyle = (prioridad?: string | null) => {
    const prioridadNormalizada = String(prioridad ?? "")
      .toLowerCase()
      .trim();

    return (
      prioridadColors[prioridadNormalizada] ?? {
        background: "#F3F4F6",
        text: "#4B5563",
        border: "#D1D5DB",
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

  const getStatusIcon = (status: number) => {
    switch (Number(status)) {
      case 1:
        return "file-document-outline";
      case 2:
        return "account-check-outline";
      case 3:
        return "clock-outline";
      case 4:
        return "check-circle-outline";
      case 5:
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getPrioridadIcon = (value?: string | null) => {
    switch (
      String(value ?? "")
        .toLowerCase()
        .trim()
    ) {
      case "baja":
        return "arrow-down-circle-outline";
      case "media":
        return "flag-outline";
      case "alta":
        return "alert-circle-outline";
      case "urgente":
        return "alert-octagon-outline";
      default:
        return "flag-outline";
    }
  };

  const getTipoIcon = (tipo: number) => {
    switch (Number(tipo)) {
      case 1:
        return "clipboard-text-outline";
      case 2:
        return "tools";
      default:
        return "file-document-outline";
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
      <SafeAreaView style={styles.loadingSafeArea}>
        <View style={styles.center}>
          <View style={styles.loadingIconBox}>
            <ActivityIndicator size="large" color="#148248" />
          </View>
          <Text style={styles.loadingTitle}>Cargando solicitud</Text>
          <Text style={styles.loadingText}>Espera un momento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.loadingSafeArea}>
        <View style={styles.center}>
          <View style={styles.loadingIconBox}>
            <MaterialCommunityIcons
              name="file-alert-outline"
              size={48}
              color="#148248"
            />
          </View>
          <Text style={styles.loadingTitle}>Solicitud no encontrada</Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.back()}
            activeOpacity={0.82}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.returnButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerDecorationOne} />
          <View style={styles.headerDecorationTwo} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityLabel="Regresar"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image
              source={require("../../../../assets/images/ZUCARMEX.png")}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, { width: contentWidth }]}>
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={22}
                    color="#148248"
                  />
                </View>
                <Text style={styles.sectionTitle}>Información general</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={19}
                    color="#148248"
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>Solicitante</Text>
                  <Text style={styles.value}>{solicitante}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons
                    name={getTipoIcon(numTipo) as any}
                    size={19}
                    color="#148248"
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>Tipo</Text>
                  <Text style={styles.value}>{getTipo(numTipo)}</Text>
                </View>
              </View>

              {numTipo === 2 && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <MaterialCommunityIcons
                      name="wrench-clock-outline"
                      size={19}
                      color="#148248"
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Tipo de mantenimiento</Text>
                    <Text style={styles.value}>
                      {getTipoMantenimiento(numTipoMantenimiento)}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={19}
                    color="#148248"
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>Fecha</Text>
                  <Text style={styles.value}>{formatDate(fecha)}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, styles.infoRowLast]}>
                <View style={styles.infoIconBox}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={19}
                    color="#148248"
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>Área</Text>
                  <Text style={styles.value}>{getArea(numArea)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="text-box-outline"
                    size={22}
                    color="#148248"
                  />
                </View>
                <Text style={styles.sectionTitle}>Descripción</Text>
              </View>

              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {descripcion || "Sin descripción"}
                </Text>
              </View>
            </View>

            {evidenciasSolicitante.length > 0 && (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBox}>
                    <MaterialCommunityIcons
                      name="image-multiple-outline"
                      size={22}
                      color="#148248"
                    />
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>
                      Evidencias del solicitante
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {evidenciasSolicitante.length} imagen(es)
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imagesContainer}
                >
                  {evidenciasSolicitante.map((e) => (
                    <Image
                      key={String(e.id)}
                      source={{ uri: e.ruta }}
                      style={[
                        styles.image,
                        {
                          width: evidenceWidth,
                          height: isTablet ? 260 : 220,
                        },
                      ]}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {mostrarAsignacion && (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBox}>
                    <MaterialCommunityIcons
                      name="account-hard-hat-outline"
                      size={22}
                      color="#148248"
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Datos de asignación</Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <MaterialCommunityIcons
                      name="account-hard-hat-outline"
                      size={19}
                      color="#148248"
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Técnico asignado</Text>
                    <Text style={styles.value}>{getTecnicosAsignados()}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <MaterialCommunityIcons
                      name="calendar-check-outline"
                      size={19}
                      color="#148248"
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Fecha de asignación</Text>
                    <Text style={styles.value}>
                      {formatDate(fechaAsignacion)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.scheduleRow,
                    isSmallScreen && styles.scheduleRowSmall,
                  ]}
                >
                  <View
                    style={[
                      styles.scheduleItem,
                      !isSmallScreen && styles.scheduleItemSpacing,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="calendar-start-outline"
                      size={20}
                      color="#148248"
                    />
                    <Text style={styles.scheduleLabel}>Inicio programado</Text>
                    <Text style={styles.scheduleValue}>
                      {formatDate(fechaProgInicio)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.scheduleItem,
                      isSmallScreen && styles.scheduleItemSmall,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="calendar-end-outline"
                      size={20}
                      color="#148248"
                    />
                    <Text style={styles.scheduleLabel}>Fin programado</Text>
                    <Text style={styles.scheduleValue}>
                      {formatDate(fechaProgFin)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.priorityRow,
                    {
                      backgroundColor: prioridadStyle.background,
                      borderColor: prioridadStyle.border,
                    },
                  ]}
                >
                  <View style={styles.priorityIconBox}>
                    <MaterialCommunityIcons
                      name={getPrioridadIcon(prioridad) as any}
                      size={20}
                      color={prioridadStyle.text}
                    />
                  </View>

                  <View style={styles.infoTextContainer}>
                    <Text
                      style={[styles.label, { color: prioridadStyle.text }]}
                    >
                      Prioridad
                    </Text>
                    <Text
                      style={[
                        styles.value,
                        styles.priorityValue,
                        { color: prioridadStyle.text },
                      ]}
                    >
                      {capitalize(prioridad)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {mostrarDatosTecnico && (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBox}>
                    <MaterialCommunityIcons
                      name="tools"
                      size={22}
                      color="#148248"
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Datos del técnico</Text>
                </View>

                <Text style={styles.subSectionTitle}>Fechas reales</Text>

                <View
                  style={[
                    styles.scheduleRow,
                    isSmallScreen && styles.scheduleRowSmall,
                  ]}
                >
                  <View
                    style={[
                      styles.scheduleItem,
                      !isSmallScreen && styles.scheduleItemSpacing,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="play-circle-outline"
                      size={20}
                      color="#148248"
                    />
                    <Text style={styles.scheduleLabel}>Inicio real</Text>
                    <Text style={styles.scheduleValue}>
                      {formatDate(fechaInicioReal)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.scheduleItem,
                      isSmallScreen && styles.scheduleItemSmall,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={20}
                      color="#148248"
                    />
                    <Text style={styles.scheduleLabel}>Fin real</Text>
                    <Text style={styles.scheduleValue}>
                      {formatDate(fechaFinReal)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subSectionTitle}>
                  Materiales utilizados
                </Text>

                {materialesSolicitud.length > 0 ? (
                  <View style={styles.materialsContainer}>
                    {materialesSolicitud.map((material) => (
                      <View
                        key={String(material.id)}
                        style={styles.materialItem}
                      >
                        <View style={styles.materialHeader}>
                          <View style={styles.materialIconBox}>
                            <MaterialCommunityIcons
                              name={
                                material.tipoMaterial === "herramienta"
                                  ? "hammer-wrench"
                                  : "package-variant-closed"
                              }
                              size={21}
                              color="#148248"
                            />
                          </View>

                          <View style={styles.materialTitleContainer}>
                            <Text style={styles.materialName}>
                              {material.nombre}
                            </Text>
                            <Text style={styles.materialCode}>
                              #{material.numMaterial}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.materialDetailsRow}>
                          <View style={styles.materialDetailPill}>
                            <Text style={styles.materialDetailLabel}>Tipo</Text>
                            <Text style={styles.materialDetailValue}>
                              {material.tipoMaterial === "herramienta"
                                ? "Herramienta"
                                : "Material"}
                            </Text>
                          </View>

                          <View style={styles.materialDetailPill}>
                            <Text style={styles.materialDetailLabel}>
                              Cantidad
                            </Text>
                            <Text style={styles.materialDetailValue}>
                              {material.cantidad}
                              {material.unidad ? ` ${material.unidad}` : ""}
                            </Text>
                          </View>
                        </View>

                        {material.descripcion ? (
                          <Text style={styles.materialDescription}>
                            {material.descripcion}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyInlineBox}>
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={26}
                      color="#7A837E"
                    />
                    <Text style={styles.emptyInlineText}>
                      Sin materiales registrados
                    </Text>
                  </View>
                )}
              </View>
            )}

            {evidenciasTecnico.length > 0 && (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBox}>
                    <MaterialCommunityIcons
                      name="camera-outline"
                      size={22}
                      color="#148248"
                    />
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>
                      Evidencias del técnico
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {evidenciasTecnico.length} imagen(es)
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imagesContainer}
                >
                  {evidenciasTecnico.map((e) => (
                    <Image
                      key={String(e.id)}
                      source={{ uri: e.ruta }}
                      style={[
                        styles.image,
                        {
                          width: evidenceWidth,
                          height: isTablet ? 260 : 220,
                        },
                      ]}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {comentarios && (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBox}>
                    <MaterialCommunityIcons
                      name="comment-text-outline"
                      size={22}
                      color="#148248"
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Comentarios</Text>
                </View>

                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>{comentarios}</Text>
                </View>
              </View>
            )}

            {motivoCancelacion && (
              <View style={[styles.card, styles.cancelReasonCard]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.cancelReasonIconBox}>
                    <MaterialCommunityIcons
                      name="close-circle-outline"
                      size={22}
                      color="#991B1B"
                    />
                  </View>
                  <Text style={[styles.sectionTitle, styles.cancelReasonTitle]}>
                    Motivo de cancelación
                  </Text>
                </View>

                <View style={styles.cancelReasonBox}>
                  <Text style={styles.cancelReasonText}>
                    {motivoCancelacion}
                  </Text>
                </View>
              </View>
            )}

            {esAdmin &&
              soloTieneTecnicoExterno &&
              (numStatus === 2 || numStatus === 3) && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => setModalCompletarVisible(true)}
                  activeOpacity={0.84}
                >
                  <Text style={styles.textComplete}>
                    Marcar como completada
                  </Text>
                </TouchableOpacity>
              )}

            {esAdmin && tieneTecnicoExterno && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={descargarSolicitud}
                activeOpacity={0.84}
              >
                <Text style={styles.downloadButtonText}>
                  Descargar solicitud
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="list-status"
                    size={22}
                    color="#148248"
                  />
                </View>
                <Text style={styles.sectionTitle}>Estado de la solicitud</Text>
              </View>

              <View
                style={[
                  styles.statusPanel,
                  { backgroundColor: statusStyle.background },
                ]}
              >
                <MaterialCommunityIcons
                  name={getStatusIcon(numStatus) as any}
                  size={28}
                  color={statusStyle.text}
                />
                <View style={styles.statusPanelTextContainer}>
                  <Text
                    style={[
                      styles.statusPanelLabel,
                      { color: statusStyle.text },
                    ]}
                  >
                    Estado actual
                  </Text>
                  <Text
                    style={[
                      styles.statusPanelValue,
                      { color: statusStyle.text },
                    ]}
                  >
                    {getStatusName(numStatus)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={modalCompletarVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={cerrarModalCompletar}
      >
        <View
          style={[
            styles.modalOverlay,
            isTablet && styles.modalOverlayTablet,
            {
              paddingTop: isTablet
                ? 30
                : Platform.OS === "ios"
                  ? 18
                  : 12,
              paddingBottom: isTablet ? 30 : 12,
            },
          ]}
        >
          <View
            style={[
              styles.modalCard,
              {
                width: modalWidth,
                maxHeight: Math.max(
                  360,
                  height - (isTablet ? 60 : Platform.OS === "ios" ? 36 : 24),
                ),
                borderRadius: 24,
              },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalTitleIconBox}>
                  <MaterialCommunityIcons
                    name="check-decagram-outline"
                    size={27}
                    color="#148248"
                  />
                </View>
                <View style={styles.modalTitleTextContainer}>
                  <Text style={styles.modalTitle}>Completar solicitud</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={cerrarModalCompletar}
                disabled={completandoSolicitud}
                style={styles.modalCloseButton}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Agrega las imágenes de evidencia y después marca la solicitud como
              completada.
            </Text>

            <TouchableOpacity
              style={styles.selectImagesButton}
              onPress={seleccionarEvidencias}
              disabled={completandoSolicitud}
              activeOpacity={0.82}
            >
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={22}
                color="#148248"
              />
              <Text style={styles.selectImagesButtonText}>
                Seleccionar evidencias
              </Text>
            </TouchableOpacity>

            {evidenciasSeleccionadas.length === 0 ? (
              <View style={styles.emptyEvidenceBox}>
                <View style={styles.emptyEvidenceIconBox}>
                  <MaterialCommunityIcons
                    name="image-off-outline"
                    size={36}
                    color="#7A837E"
                  />
                </View>
                <Text style={styles.emptyEvidenceTitle}>Sin evidencias</Text>
                <Text style={styles.emptyEvidenceText}>
                  Debes agregar al menos una imagen.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.selectedImagesScroll}
                contentContainerStyle={styles.selectedImagesContainer}
                showsVerticalScrollIndicator={false}
              >
                {evidenciasSeleccionadas.map((imagen, index) => (
                  <View
                    key={`${imagen.uri}-${index}`}
                    style={[
                      styles.previewItem,
                      { width: isTablet ? "31.5%" : "48%" },
                    ]}
                  >
                    <Image
                      source={{ uri: imagen.uri }}
                      style={styles.previewImage}
                    />

                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => eliminarEvidenciaSeleccionada(imagen.uri)}
                      disabled={completandoSolicitud}
                      activeOpacity={0.82}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={18}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.selectedCountBox}>
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={17}
                color="#68736E"
              />
              <Text style={styles.selectedCountText}>
                {evidenciasSeleccionadas.length} evidencia(s) seleccionada(s)
              </Text>
            </View>

            <View
              style={[
                styles.modalActions,
                isSmallScreen && styles.modalActionsSmall,
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.cancelModalButton,
                  !isSmallScreen && styles.modalButtonSpacing,
                ]}
                onPress={cerrarModalCompletar}
                disabled={completandoSolicitud}
                activeOpacity={0.82}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmCompleteButton,
                  (completandoSolicitud ||
                    evidenciasSeleccionadas.length === 0) &&
                    styles.disabledButton,
                  isSmallScreen && styles.confirmCompleteButtonSmall,
                ]}
                onPress={marcarComoCompletada}
                disabled={
                  completandoSolicitud || evidenciasSeleccionadas.length === 0
                }
                activeOpacity={0.82}
              >
                {completandoSolicitud ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.confirmCompleteButtonText}>
                      Completando...
                    </Text>
                  </>
                ) : (
                  <>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#148248",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  container: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  scrollContent: {
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 42,
  },

  header: {
    minHeight: 92,
    backgroundColor: "#148248",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },

  headerDecorationOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -86,
    right: -25,
  },

  headerDecorationTwo: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -52,
    left: 58,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    zIndex: 2,
  },

  headerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 0,
  },

  headerSpacer: {
    width: 46,
    height: 46,
  },

  imageZucarmex: {
    width: 172,
    maxWidth: "72%",
    height: 55,
  },

  content: {
    alignSelf: "center",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 20,
    padding: 16,
    marginBottom: 13,
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },

  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryTypeIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginRight: 12,
  },

  summaryTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  summaryEyebrow: {
    color: "#748079",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  summaryTitle: {
    color: "#26322C",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    marginTop: 3,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#EDF1EF",
    marginVertical: 14,
  },

  summaryBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 9,
  },

  summaryDate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F8F6",
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  summaryDateText: {
    color: "#52605A",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.07,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginRight: 10,
  },

  sectionTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    flex: 1,
    color: "#26322C",
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#748079",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  subSectionTitle: {
    color: "#37413C",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 9,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 9,
  },

  infoRowLast: {
    marginBottom: 0,
  },

  infoIconBox: {
    width: 35,
    height: 35,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
  },

  infoTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    color: "#7A837E",
    fontSize: 10,
    fontWeight: "700",
  },

  value: {
    color: "#37413C",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 2,
  },

  descriptionBox: {
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 14,
    padding: 13,
  },

  descriptionText: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 20,
  },

  imagesContainer: {
    paddingRight: 4,
  },

  image: {
    borderRadius: 16,
    marginRight: 11,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#E0E7E3",
  },

  scheduleRow: {
    flexDirection: "row",
    marginBottom: 9,
  },

  scheduleRowSmall: {
    flexDirection: "column",
  },

  scheduleItem: {
    flex: 1,
    minHeight: 94,
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 14,
    padding: 12,
  },

  scheduleItemSpacing: {
    marginRight: 9,
  },

  scheduleItemSmall: {
    marginTop: 9,
  },

  scheduleLabel: {
    color: "#7A837E",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
  },

  scheduleValue: {
    color: "#27332D",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },

  priorityRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  priorityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.58)",
    marginRight: 10,
  },

  priorityValue: {
    textTransform: "capitalize",
    fontWeight: "800",
  },

  materialsContainer: {
    marginTop: 2,
  },

  materialItem: {
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },

  materialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  materialIconBox: {
    width: 39,
    height: 39,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
  },

  materialTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  materialName: {
    color: "#26322C",
    fontSize: 14,
    fontWeight: "800",
  },

  materialCode: {
    color: "#748079",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  materialDetailsRow: {
    flexDirection: "row",
    gap: 8,
  },

  materialDetailPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6ECE8",
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  materialDetailLabel: {
    color: "#7A837E",
    fontSize: 9,
    fontWeight: "700",
  },

  materialDetailValue: {
    color: "#37413C",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  materialDescription: {
    color: "#59645F",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  emptyInlineBox: {
    minHeight: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D9E1DD",
    borderRadius: 14,
    padding: 14,
  },

  emptyInlineText: {
    color: "#68736E",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },

  cancelReasonCard: {
    borderColor: "#FECACA",
  },

  cancelReasonIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginRight: 10,
  },

  cancelReasonTitle: {
    color: "#991B1B",
  },

  cancelReasonBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 13,
  },

  cancelReasonText: {
    color: "#7F1D1D",
    fontSize: 13,
    lineHeight: 20,
  },

  completeButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#148248",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#148248",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },

  textComplete: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  downloadButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 13,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },

  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  statusBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 17,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  statusPanel: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  statusPanelTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  statusPanelLabel: {
    fontSize: 10,
    fontWeight: "700",
  },

  statusPanelValue: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10,20,15,0.55)",
    paddingHorizontal: 10,
  },

  modalOverlayTablet: {
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    ...Platform.select({
      android: { elevation: 12 },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.22,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 7 },
      },
    }),
  },

  modalHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D8D4",
    marginBottom: 12,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  modalTitleContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 9,
  },

  modalTitleIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
  },

  modalTitleTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  modalTitle: {
    color: "#26322C",
    fontSize: 18,
    fontWeight: "800",
  },

  modalRequestNumber: {
    color: "#748079",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F1F4F2",
  },

  modalDescription: {
    color: "#59645F",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 15,
  },

  selectImagesButton: {
    minHeight: 49,
    borderWidth: 1.5,
    borderColor: "#148248",
    backgroundColor: "#F0F8F4",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  selectImagesButtonText: {
    color: "#148248",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  emptyEvidenceBox: {
    minHeight: 145,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D9D5",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
    padding: 20,
  },

  emptyEvidenceIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
  },

  emptyEvidenceTitle: {
    color: "#37413C",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },

  emptyEvidenceText: {
    color: "#6B756F",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  selectedImagesScroll: {
    maxHeight: 310,
  },

  selectedImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 2,
  },

  previewItem: {
    aspectRatio: 1,
    position: "relative",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
  },

  removeImageButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#870C0C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  selectedCountBox: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7F5",
    borderRadius: 11,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 15,
  },

  selectedCountText: {
    color: "#68736E",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },

  modalActions: {
    flexDirection: "row",
  },

  modalActionsSmall: {
    flexDirection: "column",
  },

  modalButtonSpacing: {
    marginRight: 9,
  },

  cancelModalButton: {
    flex: 1,
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: "#870c0c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 13,
  },

  cancelModalButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 7,
  },

  confirmCompleteButton: {
    flex: 2,
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: "#148248",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  confirmCompleteButtonSmall: {
    marginTop: 9,
  },

  confirmCompleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 6,
  },

  disabledButton: {
    opacity: 0.55,
  },

  loadingSafeArea: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
    paddingHorizontal: 24,
  },

  loadingIconBox: {
    width: 92,
    height: 92,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginBottom: 16,
  },

  loadingTitle: {
    color: "#26322C",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  loadingText: {
    color: "#748079",
    fontSize: 13,
    marginTop: 5,
  },

  returnButton: {
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    paddingHorizontal: 17,
    marginTop: 18,
  },

  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },
});