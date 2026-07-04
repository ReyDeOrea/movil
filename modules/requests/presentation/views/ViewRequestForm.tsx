import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const screenWidth = Dimensions.get("window").width;
const repository = new SupabaseRequestsRepository();

function getValue<T = any>(obj: any, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (
      obj &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
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
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const limpiarTextoHtml = (value?: any) => {
  if (value === null || value === undefined || value === "") return "No asignada";

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
        "rol_id"
      )
    );

    const rolObjeto = getValue<any>(
      data,
      "rol",
      "role",
      "rolData",
      "rolInfo",
      "rol_data",
      "rol_info"
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
        "tipo_rol"
      ) ??
      getValue(
        rolObjeto,
        "nombreRol",
        "nombrerol",
        "nombre_rol",
        "nombre",
        "name"
      ) ??
      ""
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
            "authUser"
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
            "authUser"
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

  const cargarSolicitud = async () => {
    const parsed = parseRequestParam(params.request);

    if (!parsed) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const numSolicitud = Number(
        getValue(parsed, "numSolicitud", "numsolicitud", "num_solicitud")
      );

      if (numSolicitud) {
        const data = await repository.getRequestById(numSolicitud);

        if (data) {
          setRequest(data);
          return;
        }
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
    }, [params.request])
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
          "tipoImagen"
        ) ?? "",
      ruta:
        getValue<string>(
          e,
          "ruta",
          "url",
          "uri",
          "imagen",
          "rutaImagen"
        ) ?? "",
    }));
  }, [request]);

  const evidenciasSolicitante = useMemo(() => {
    return evidencias.filter((e) => e.tipo === "solicitante");
  }, [evidencias]);

  const evidenciasTecnico = useMemo(() => {
    return evidencias.filter((e) => e.tipo === "tecnico");
  }, [evidencias]);

  const tieneTecnicoExterno = useMemo(() => {
    if (!request) return false;

    const buscarTecnicoExterno = (obj: any): boolean => {
      if (!obj || typeof obj !== "object") return false;

      if (Array.isArray(obj)) {
        return obj.some((item) => buscarTecnicoExterno(item));
      }

      return Object.entries(obj).some(([key, value]) => {
        const keyNormalizada = key.toLowerCase();

        const esCampoTecnicoExterno =
          keyNormalizada.includes("tecnicoexterno") ||
          keyNormalizada.includes("tecnico_externo") ||
          keyNormalizada.includes("numtecnicoexterno") ||
          keyNormalizada.includes("num_tecnico_externo") ||
          keyNormalizada.includes("idtecnicoexterno") ||
          keyNormalizada.includes("id_tecnico_externo") ||
          keyNormalizada.includes("proveedor") ||
          keyNormalizada.includes("externo");

        if (
          esCampoTecnicoExterno &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          return true;
        }

        if (typeof value === "string") {
          return value.toLowerCase().includes("extern");
        }

        if (typeof value === "object") {
          return buscarTecnicoExterno(value);
        }

        return false;
      });
    };

    return buscarTecnicoExterno(request);
  }, [request]);

  const statusColors: Record<number, { background: string; text: string }> = {
    1: { background: "#d7d7d7", text: "#6c6c6c" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? statusColors[1];

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
        "asignaciones"
      ) ?? [];

    if (Array.isArray(tecnicos) && tecnicos.length > 0) {
      return tecnicos
        .map((t) => {
          const usuario = getValue<any>(
            t,
            "usuario",
            "tecnicoInterno",
            "tecnico_interno"
          );

          const externo = getValue<any>(
            t,
            "tecnicoExterno",
            "tecnico_externo",
            "tecnicoexterno",
            "proveedor",
            "externo"
          );

          return (
            getValue<string>(
              t,
              "nombre",
              "nombreTecnico",
              "nombre_tecnico",
              "tecnico",
              "label"
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
        "nombre_tecnico_externo"
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
    getValue(request, "numStatus", "numstatus", "num_status") ?? 1
  );

  const numTipo = Number(
    getValue(request, "numTipo", "numtipo", "num_tipo") ?? 0
  );

  const numTipoMantenimiento = Number(
    getValue(
      request,
      "numTipoMantenimiento",
      "numtipomantenimiento",
      "num_tipo_mantenimiento"
    ) ?? 0
  );

  const numArea = Number(
    getValue(request, "numArea", "numarea", "num_area") ?? 0
  );

  const numSolicitud =
    getValue(request, "numSolicitud", "numsolicitud", "num_solicitud") ??
    "N/A";

  const fecha = getValue<string>(request, "fecha");
  const descripcion = getValue<string>(request, "descripcion");

  const solicitante =
    getValue<string>(
      request,
      "solicitante",
      "nombreSolicitante",
      "nombre_solicitante"
    ) ?? "No disponible";

  const fechaAsignacion = getValue<string>(
    request,
    "fechaAsignacion",
    "fechaasignacion",
    "fecha_asignacion"
  );

  const fechaProgInicio = getValue<string>(
    request,
    "fechaProgInicio",
    "fechaproginicio",
    "fecha_prog_inicio"
  );

  const fechaProgFin = getValue<string>(
    request,
    "fechaProgFin",
    "fechaprogfin",
    "fecha_prog_fin"
  );

  const prioridad = getValue<string>(request, "prioridad");

  const fechaInicioReal = getValue<string>(
    request,
    "fechaInicioReal",
    "fechainicioreal",
    "fecha_inicio_real"
  );

  const fechaFinReal = getValue<string>(
    request,
    "fechaFinReal",
    "fechafinreal",
    "fecha_fin_real"
  );

  const comentarios = getValue<string>(request, "comentarios");

  const motivoCancelacion = getValue<string>(
    request,
    "motivoCancelacion",
    "motivocancelacion",
    "motivo_cancelacion"
  );

  const statusStyle = getStatusStyle(numStatus);

  const mostrarAsignacion =
    numStatus >= 2 ||
    fechaAsignacion ||
    fechaProgInicio ||
    fechaProgFin ||
    prioridad;

  const crearHtmlSolicitud = () => {
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

            .label {
              font-weight: bold;
              margin-top: 8px;
            }

            .value {
              margin-bottom: 6px;
              color: #374151;
            }

            .badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              background: #FEF3C7;
              color: #92400E;
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

            <div class="label">Número de solicitud:</div>
            <div class="value">${limpiarTextoHtml(numSolicitud)}</div>

            <div class="label">Solicitante:</div>
            <div class="value">${limpiarTextoHtml(solicitante)}</div>

            <div class="label">Tipo:</div>
            <div class="value">${limpiarTextoHtml(getTipo(numTipo))}</div>

            <div class="label">Tipo de mantenimiento:</div>
            <div class="value">${limpiarTextoHtml(getTipoMantenimiento(numTipoMantenimiento))}</div>

            <div class="label">Fecha:</div>
            <div class="value">${limpiarTextoHtml(formatDate(fecha))}</div>

            <div class="label">Área:</div>
            <div class="value">${limpiarTextoHtml(getArea(numArea))}</div>

            <div class="label">Estado:</div>
            <div class="value">
              <span class="badge">${limpiarTextoHtml(getStatusName(numStatus))}</span>
            </div>
          </div>

          <div class="section">
            <div class="title">Descripción</div>
            <div class="value">${limpiarTextoHtml(descripcion || "Sin descripción")}</div>
          </div>

          <div class="section">
            <div class="title">Datos de asignación</div>

            <div class="label">Técnico asignado:</div>
            <div class="value">${limpiarTextoHtml(getTecnicosAsignados())}</div>

            <div class="label">Fecha de asignación:</div>
            <div class="value">${limpiarTextoHtml(formatDate(fechaAsignacion))}</div>

            <div class="label">Fecha programada de inicio:</div>
            <div class="value">${limpiarTextoHtml(formatDate(fechaProgInicio))}</div>

            <div class="label">Fecha programada de fin:</div>
            <div class="value">${limpiarTextoHtml(formatDate(fechaProgFin))}</div>

            <div class="label">Prioridad:</div>
            <div class="value">${limpiarTextoHtml(capitalize(prioridad))}</div>
          </div>

          <div class="section">
            <div class="title">Fechas reales</div>

            <div class="label">Inicio real:</div>

            <div class="label">Fin real:</div>
          </div>

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
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#fff"
            />
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
            <Text style={styles.value}>
              {descripcion || "Sin descripción"}
            </Text>
          </View>

          {mostrarAsignacion && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Datos de asignación</Text>

              <Text style={styles.label}>Técnico asignado:</Text>
              <Text style={styles.value}>{getTecnicosAsignados()}</Text>

              <Text style={styles.label}>Fecha de asignación:</Text>
              <Text style={styles.value}>
                {formatDate(fechaAsignacion)}
              </Text>

              <Text style={styles.label}>Fecha programada de inicio:</Text>
              <Text style={styles.value}>
                {formatDate(fechaProgInicio)}
              </Text>

              <Text style={styles.label}>Fecha programada de fin:</Text>
              <Text style={styles.value}>
                {formatDate(fechaProgFin)}
              </Text>

              <Text style={styles.label}>Prioridad:</Text>
              <Text style={styles.value}>
                {capitalize(prioridad)}
              </Text>
            </View>
          )}

          {(fechaInicioReal || fechaFinReal) && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Fechas reales</Text>

              <Text style={styles.label}>Inicio real:</Text>
              <Text style={styles.value}>
                {formatDate(fechaInicioReal)}
              </Text>

              <Text style={styles.label}>Fin real:</Text>
              <Text style={styles.value}>
                {formatDate(fechaFinReal)}
              </Text>
            </View>
          )}

          {evidenciasSolicitante.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Evidencias del solicitante
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
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

          {evidenciasTecnico.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Evidencias del técnico
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
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
              <Text style={styles.sectionTitle}>
                Motivo de cancelación
              </Text>
              <Text style={styles.value}>{motivoCancelacion}</Text>
            </View>
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

              <Text style={styles.downloadButtonText}>
                Descargar solicitud
              </Text>
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});