import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { CancelRequestUseCase } from "../../application/cancelRequest";
import { GetAllRequests } from "../../application/getRequestRecived";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetAllRequests(repository);
const cancelRequest = new CancelRequestUseCase(repository);

export default function RequestsReceived() {
  const [requests, setRequests] = useState<RequestsForm[]>([]);
  const [modalRechazoVisible, setModalRechazoVisible] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<RequestsForm | null>(null);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const loadRequests = async () => {
    try {
      const data = await getRequests.execute();
      setRequests(data ?? []);
    } catch (error) {
      console.log("ERROR loading requests:", error);
    }
  };

  const abrirModalRechazo = (request: RequestsForm) => {
    setSolicitudSeleccionada(request);
    setMotivoCancelacion("");
    setModalRechazoVisible(true);
  };

  const cerrarModalRechazo = () => {
    setModalRechazoVisible(false);
    setSolicitudSeleccionada(null);
    setMotivoCancelacion("");
  };

  const confirmarRechazo = async () => {
    try {
      if (!solicitudSeleccionada) {
        Alert.alert("Error", "No se encontró la solicitud seleccionada");
        return;
      }

      await cancelRequest.execute(
        solicitudSeleccionada.numSolicitud,
        motivoCancelacion
      );

      Alert.alert("Solicitud rechazada correctamente");

      cerrarModalRechazo();
      await loadRequests();

    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo rechazar la solicitud"
      );
    }
  };

  const aceptar = async (request: RequestsForm) => {
    router.push({
      pathname: "/formAdmin",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const viewRequest = (request: RequestsForm) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const getTipo = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Servicio";
      case 2:
        return "Mantenimiento";
      default:
        return "Desconocido";
    }
  };

  const statusColors: Record<number, { background: string; text: string }> = {
    1: { background: "#d7d7d7", text: "#6c6c6c" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? { background: "#6B7280", text: "#fff" };

  const canTakeAction = (status: number) => {
    return status === 1;
  };

  const getStatusName = (estado: number) => {
    switch (estado) {
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

  const getTecnicoAsignado = (item: RequestsForm) => {
    if (item.tecnicoAsignado) {
      return item.tecnicoAsignado;
    }

    if (item.tecnicos && item.tecnicos.length > 0) {
      return item.tecnicos.map((tecnico) => tecnico.nombre).join(", ");
    }

    return "No asignado";
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.numSolicitud.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => viewRequest(item)}
            style={styles.card}
          >
            <Text style={styles.title}>
              {getTipo(item.numTipo)}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Fecha:</Text> {item.fecha}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Solicitante:</Text>{" "}
              {item.nombreSolicitante ?? "Sin nombre"}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Descripción:</Text>{" "}
              {item.descripcion}
            </Text>

            {item.numStatus >= 2 && (
              <Text style={styles.text}>
                <Text style={styles.label}>Técnico asignado:</Text>{" "}
                {getTecnicoAsignado(item)}
              </Text>
            )}

            <View style={styles.rowBetween}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusStyle(item.numStatus).background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusStyle(item.numStatus).text },
                  ]}
                >
                  {getStatusName(item.numStatus)}
                </Text>
              </View>
            </View>

            {canTakeAction(item.numStatus) && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  onPress={() => aceptar(item)}
                  style={[styles.button, styles.accept]}
                >
                  <Text style={styles.buttonText}>Aceptar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => abrirModalRechazo(item)}
                  style={[styles.button, styles.reject]}
                >
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay solicitudes
          </Text>
        }
        contentContainerStyle={{
          paddingBottom: 10,
          flexGrow: 1,
        }}
      />

      <Modal
        visible={modalRechazoVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarModalRechazo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Rechazar solicitud
            </Text>

            <Text style={styles.modalText}>
              Escribe el motivo por el cual se va a rechazar esta solicitud.
            </Text>

            <TextInput
              style={styles.modalTextArea}
              placeholder="Motivo de cancelación"
              multiline
              value={motivoCancelacion}
              onChangeText={setMotivoCancelacion}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cerrarModalRechazo}
              >
                <Text style={styles.modalButtonText}>
                  Cerrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalRejectButton}
                onPress={confirmarRechazo}
              >
                <Text style={styles.modalButtonText}>
                  Rechazar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  text: {
    fontSize: 14,
    marginBottom: 3,
    color: "#374151",
  },

  label: {
    fontWeight: "bold",
  },

  buttonsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },

  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },

  accept: {
    backgroundColor: "#c7f8bc",
    marginRight: 10,
  },

  reject: {
    backgroundColor: "#FECACA",
  },

  buttonText: {
    color: "#111827",
    fontWeight: "bold",
    textAlign: "center",
  },

  statusText: {
    fontWeight: "bold",
    fontSize: 13,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6B7280",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },

  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },

  modalText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    textAlign: "center",
  },

  modalTextArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    color: "#111827",
    marginBottom: 15,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: "#232323",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  modalRejectButton: {
    flex: 1,
    backgroundColor: "#991B1B",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});