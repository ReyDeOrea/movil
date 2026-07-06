import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { api } from "@/lib/api";
import { validateAdminAssignment } from "../../application/validateAdminAssignment";
import { Prioridad } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import EditRequestModal from "./ModalEditRequestAdmin";

type TipoTecnico = "externo" | "interno" | "ambos";

type TecnicoOption = {
  value: string;
  label: string;
  tipo: "interno" | "externo";
  id: number;
};

const repository = new SupabaseRequestsRepository();

const dateToApi = (date: Date) => {
  return date.toLocaleDateString("en-CA");
};

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

const getIdFromPickerValue = (value: string) => {
  const id = value.split("-")[1];
  return Number(id);
};

export default function FormAdmin() {
  const router = useRouter();
  const { request } = useLocalSearchParams();

  const data = useMemo(() => parseRequestParam(request), [request]);

  const [solicitud, setSolicitud] = useState<any>(data);

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTecnico, setTipoTecnico] = useState<TipoTecnico>("interno");
  const [tecnicoInternoAsignado, setTecnicoInternoAsignado] = useState("");
  const [tecnicoExternoAsignado, setTecnicoExternoAsignado] = useState("");
  const [fechaAsignada] = useState(new Date().toLocaleDateString("en-CA"));
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [prioridad, setPrioridad] = useState<Prioridad>("media");
  const [tecnicosInternos, setTecnicosInternos] = useState<TecnicoOption[]>([]);
  const [tecnicosExternos, setTecnicosExternos] = useState<TecnicoOption[]>([]);

  useEffect(() => {
    setSolicitud(data);
  }, [data]);

  useEffect(() => {
    cargarTecnicos();
  }, []);

  useEffect(() => {
    setTecnicoInternoAsignado("");
    setTecnicoExternoAsignado("");
  }, [tipoTecnico]);

  const cargarTecnicos = async () => {
    try {
      const [usuariosResponse, externosResponse] = await Promise.all([
        api.get("/usuarios/"),
        api.get("/tecnicos-externos/"),
      ]);

      const internos: TecnicoOption[] = (usuariosResponse.data ?? [])
        .filter((user: any) => Number(user.numrol) === 3)
        .map((user: any) => ({
          value: `interno-${user.numusuario}`,
          label: `${user.nombre} - Interno`,
          tipo: "interno",
          id: Number(user.numusuario),
        }));

      const externos: TecnicoOption[] = (externosResponse.data ?? [])
        .map((tecnico: any) => ({
          value: `externo-${tecnico.numtecnicoexterno}`,
          label: `${tecnico.nombre} - Externo${tecnico.empresa ? ` (${tecnico.empresa})` : ""}`,
          tipo: "externo",
          id: Number(tecnico.numtecnicoexterno),
        }));

      setTecnicosInternos(internos);
      setTecnicosExternos(externos);

    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar los técnicos"
      );
    }
  };

  const getTipo = (tipo: number) =>
    tipo === 1 ? "Servicio" : tipo === 2 ? "Mantenimiento" : "Desconocido";

  const statusColors: Record<number, { background: string; text: string }> = {
    1: { background: "#d7d7d7", text: "#6c6c6c" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? statusColors[1];

  const getStatusName = (estado: number) => {
    switch (estado) {
      case 1: return "Generada";
      case 2: return "Asignada";
      case 3: return "En proceso";
      case 4: return "Terminada";
      case 5: return "Cancelada";
      default: return "Desconocido";
    }
  };

  const getArea = (area: number | string) => {
    switch (Number(area)) {
      case 1: return "Administración";
      case 2: return "Fábrica";
      case 3: return "Campo";
      case 4: return "Zona habitacional";
      default: return "Desconocido";
    }
  };

  const guardar = async () => {
    try {
      if (!solicitud?.numSolicitud) {
        Alert.alert("Error", "No se encontró el número de solicitud");
        return;
      }

      validateAdminAssignment({
        tipoTecnico,
        tecnicoInternoAsignado,
        tecnicoExternoAsignado,
        fechaInicio,
        fechaFin,
        prioridad,
      });

      await repository.updateRequest(solicitud.numSolicitud, {
        fechaAsignacion: fechaAsignada,
        fechaProgInicio: dateToApi(fechaInicio),
        fechaProgFin: dateToApi(fechaFin),
        prioridad,
        numStatus: 2,
      });

      if (tipoTecnico === "interno" || tipoTecnico === "ambos") {
        await repository.assignInternalTechnician(
          solicitud.numSolicitud,
          getIdFromPickerValue(tecnicoInternoAsignado)
        );
      }

      if (tipoTecnico === "externo" || tipoTecnico === "ambos") {
        await repository.assignExternalTechnician(
          solicitud.numSolicitud,
          getIdFromPickerValue(tecnicoExternoAsignado)
        );
      }

      Alert.alert("OK", "Solicitud asignada correctamente");
      router.replace("/requests");

    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo guardar la asignación"
      );
    }
  };

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No llegó la solicitud</Text>
      </View>
    );
  }

  if (!solicitud) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No llegó la solicitud</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(solicitud.numStatus);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require("../../../../assets/images/ZUCARMEX.png")}
            style={styles.imageZucarmex}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{getTipo(solicitud.numTipo)}</Text>

          <Text>Fecha: {solicitud.fecha}</Text>

          <Text>Nombre: {solicitud.nombreSolicitante || "Sin nombre"}</Text>

          <Text>Área: {getArea(solicitud.numArea)}</Text>

          <Text>Descripción: {solicitud.descripcion}</Text>

          <Text style={styles.label}>Estado:</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.background },
            ]}
          >
            <Text style={{ color: statusStyle.text, fontWeight: "bold" }}>
              {getStatusName(solicitud.numStatus)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.editText}>Editar información</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Asignación</Text>

          <Text style={styles.label}>Fecha asignada</Text>
          <Text style={styles.inputDisabled}>{fechaAsignada}</Text>

          <Text style={styles.label}>Tipo técnico</Text>

          <View style={styles.row}>
            {(["externo", "interno", "ambos"] as TipoTecnico[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.option,
                  tipoTecnico === t && styles.optionSelected,
                ]}
                onPress={() => setTipoTecnico(t)}
              >
                <Text>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {(tipoTecnico === "interno" || tipoTecnico === "ambos") && (
            <>
              <Text style={styles.label}>Técnico interno</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tecnicoInternoAsignado}
                  onValueChange={(itemValue) => setTecnicoInternoAsignado(itemValue)}
                >
                  <Picker.Item
                    label="Seleccionar técnico interno..."
                    value=""
                    enabled={false}
                    color="#999"
                  />

                  {tecnicosInternos.map((tecnico) => (
                    <Picker.Item
                      key={tecnico.value}
                      label={tecnico.label}
                      value={tecnico.value}
                    />
                  ))}
                </Picker>
              </View>
            </>
          )}

          {(tipoTecnico === "externo" || tipoTecnico === "ambos") && (
            <>
              <Text style={styles.label}>Técnico externo</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tecnicoExternoAsignado}
                  onValueChange={(itemValue) => setTecnicoExternoAsignado(itemValue)}
                >
                  <Picker.Item
                    label="Seleccionar técnico externo..."
                    value=""
                    enabled={false}
                    color="#999"
                  />

                  {tecnicosExternos.map((tecnico) => (
                    <Picker.Item
                      key={tecnico.value}
                      label={tecnico.label}
                      value={tecnico.value}
                    />
                  ))}
                </Picker>
              </View>
            </>
          )}

          <Text style={styles.label}>Fecha inicio</Text>

          <TouchableOpacity
            onPress={() => setShowInicio(true)}
            style={styles.input}
          >
            <Text>{fechaInicio.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showInicio && (
            <DateTimePicker
              value={fechaInicio}
              mode="date"
              onChange={(_, d) => {
                setShowInicio(false);
                if (d) setFechaInicio(d);
              }}
            />
          )}

          <Text style={styles.label}>Fecha fin</Text>

          <TouchableOpacity
            onPress={() => setShowFin(true)}
            style={styles.input}
          >
            <Text>{fechaFin.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showFin && (
            <DateTimePicker
              value={fechaFin}
              mode="date"
              onChange={(_, d) => {
                setShowFin(false);
                if (d) setFechaFin(d);
              }}
            />
          )}

          <Text style={styles.label}>Prioridad</Text>

          <View style={styles.row}>
            {(["baja", "media", "alta"] as Prioridad[]).map((p) => {
              const selected = prioridad === p;

              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.option,
                    selected && p === "baja" && styles.optionSelectedB,
                    selected && p === "media" && styles.optionSelectedM,
                    selected && p === "alta" && styles.optionSelectedA,
                  ]}
                  onPress={() => setPrioridad(p)}
                >
                  <Text style={selected && styles.prioritySelectedText}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={guardar}>
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EditRequestModal
        visible={modalVisible}
        solicitud={solicitud}
        onClose={() => setModalVisible(false)}
        onUpdated={(solicitudActualizada) => {
          setSolicitud(solicitudActualizada);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    marginHorizontal: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  label: {
    fontWeight: "bold",
    marginTop: 10,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 5,
    overflow: "hidden",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
    flexWrap: "wrap",
  },

  option: {
    padding: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },

  optionSelected: {
    backgroundColor: "#b8e6b4",
  },

  optionSelectedB: {
    backgroundColor: "#FECACA",
  },

  optionSelectedM: {
    backgroundColor: "#FEF3C7",
  },

  optionSelectedA: {
    backgroundColor: "#b8e6b4",
  },

  prioritySelectedText: {
    fontWeight: "bold",
    color: "#111827",
  },

  editBtn: {
    marginTop: 10,
    backgroundColor: "#232323",
    padding: 10,
    borderRadius: 8,
  },

  editText: {
    color: "#fff",
    textAlign: "center",
  },

  saveBtn: {
    marginTop: 15,
    backgroundColor: "#232323",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  modal: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
    zIndex: 10,
  },

  inputDisabled: {
    backgroundColor: "#d8d5d5",
    borderWidth: 1,
    borderColor: "#acacac",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: "#6B7280",
  },

  imageZucarmex: {
    width: "45%",
    height: 60,
  },

  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  header: {
    width: "100%",
    height: 100,
    paddingTop: 35,
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  cancelButton: {
    backgroundColor: "#870c0c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});