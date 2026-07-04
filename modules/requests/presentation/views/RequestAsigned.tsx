import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { GetRequestsByTecnicoInterno } from "../../application/getRequestAsignedInterno";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequestsInterno = new GetRequestsByTecnicoInterno(repository);

export default function RequestsAssigned() {
  const [requests, setRequests] = useState<any[]>([]);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const getValue = (obj: any, ...keys: string[]) => {
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
  };

  const loadRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) {
        setRequests([]);
        return;
      }

      const user = JSON.parse(userData);

      const numUsuario = Number(
        getValue(
          user,
          "numUsuario",
          "numusuario",
          "num_usuario",
          "id"
        )
      );

      const data = await getRequestsInterno.execute(numUsuario);

      const solicitudesAsignadas = (data ?? []).filter((item) => {
        const status = Number(
          getValue(item, "numStatus", "numstatus", "num_status")
        );

        return status === 2 || status === 3;
      });

      setRequests(solicitudesAsignadas);
    } catch (error) {
      console.log("ERROR loading assigned requests:", error);
      setRequests([]);
    }
  };

  const viewRequest = (request: any) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const actualizarEstadoSolicitud = async (
    numSolicitud: number,
    nuevoEstado: number
  ) => {
    const repo: any = repository;

    if (typeof repo.updateRequestStatus === "function") {
      return await repo.updateRequestStatus(numSolicitud, nuevoEstado);
    }

    if (typeof repo.updateStatus === "function") {
      return await repo.updateStatus(numSolicitud, nuevoEstado);
    }

    if (typeof repo.updateSolicitudStatus === "function") {
      return await repo.updateSolicitudStatus(numSolicitud, nuevoEstado);
    }

    if (typeof repo.changeRequestStatus === "function") {
      return await repo.changeRequestStatus(numSolicitud, nuevoEstado);
    }

    if (typeof repo.updateRequest === "function") {
      return await repo.updateRequest(numSolicitud, {
        numStatus: nuevoEstado,
        numstatus: nuevoEstado,
      });
    }

    throw new Error(
      "No se encontró un método en el repositorio para actualizar el estado."
    );
  };

  const confirmarMarcarEnProceso = (request: any) => {
    const numSolicitud = Number(
      getValue(request, "numSolicitud", "numsolicitud", "num_solicitud")
    );

    if (!numSolicitud) {
      Alert.alert("Error", "No se encontró el número de solicitud.");
      return;
    }

    Alert.alert(
      "Marcar en proceso",
      "¿Seguro que quieres marcar esta solicitud como en proceso?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, marcar",
          onPress: () => marcarEnProceso(numSolicitud),
        },
      ]
    );
  };

  const marcarEnProceso = async (numSolicitud: number) => {
    try {
      setActualizandoId(numSolicitud);

      await actualizarEstadoSolicitud(numSolicitud, 3);

      setRequests((prevRequests) =>
        prevRequests.map((item) => {
          const id = Number(
            getValue(item, "numSolicitud", "numsolicitud", "num_solicitud")
          );

          if (id === numSolicitud) {
            return {
              ...item,
              numStatus: 3,
              numstatus: 3,
            };
          }

          return item;
        })
      );

      Alert.alert("Listo", "La solicitud se marcó como en proceso.");
    } catch (error) {
      console.log("ERROR marcando solicitud en proceso:", error);
      Alert.alert(
        "Error",
        "No se pudo marcar la solicitud como en proceso."
      );
    } finally {
      setActualizandoId(null);
    }
  };

  const renderStatusColor = (status: number) => {
    switch (Number(status)) {
      case 2:
        return "#FEF3C7";
      case 3:
        return "#DBEAFE";
      default:
        return "#E5E7EB";
    }
  };

  const renderStatusTextColor = (status: number) => {
    switch (Number(status)) {
      case 2:
        return "#92400E";
      case 3:
        return "#1E40AF";
      default:
        return "#374151";
    }
  };

  const renderStatusName = (status: number) => {
    switch (Number(status)) {
      case 2:
        return "Asignada";
      case 3:
        return "En proceso";
      default:
        return "Desconocido";
    }
  };

  const renderTipo = (tipo: number) => {
    switch (Number(tipo)) {
      case 1:
        return "Servicio";
      case 2:
        return "Mantenimiento";
      default:
        return "Desconocido";
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "Sin fecha";

    const cleanDate = String(date).split("T")[0];
    const parts = cleanDate.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }

    return String(date);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) =>
          String(item.numSolicitud ?? item.numsolicitud)
        }
        renderItem={({ item }) => {
          const numSolicitud = Number(
            getValue(item, "numSolicitud", "numsolicitud", "num_solicitud")
          );

          const numStatus = Number(
            getValue(item, "numStatus", "numstatus", "num_status")
          );

          const estaActualizando = actualizandoId === numSolicitud;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => viewRequest(item)}
              activeOpacity={0.85}
            >
              <Text style={styles.title}>
                {renderTipo(item.numTipo ?? item.numtipo)}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.label}>Fecha:</Text>{" "}
                {formatDate(item.fecha)}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.label}>Prioridad:</Text>{" "}
                {item.prioridad ?? "Sin prioridad"}
              </Text>

              <Text style={styles.text} numberOfLines={2}>
                <Text style={styles.label}>Descripción:</Text>{" "}
                {item.descripcion ?? "Sin descripción"}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: renderStatusColor(numStatus) }
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: renderStatusTextColor(numStatus) }
                  ]}
                >
                  {renderStatusName(numStatus)}
                </Text>
              </View>

              {numStatus === 2 && (
                <TouchableOpacity
                  style={[
                    styles.processButton,
                    estaActualizando && styles.processButtonDisabled,
                  ]}
                  disabled={estaActualizando}
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmarMarcarEnProceso(item);
                  }}
                >
                  {estaActualizando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.processButtonText}>
                      Marcar en proceso
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tienes solicitudes asignadas
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
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

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#111827",
  },

  text: {
    fontSize: 14,
    marginBottom: 3,
    color: "#374151",
  },

  label: {
    fontWeight: "bold",
  },

  statusBadge: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  statusText: {
    fontWeight: "bold",
  },

  processButton: {
    marginTop: 14,
    backgroundColor: "#c7f8bc",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  processButtonDisabled: {
    opacity: 0.7,
  },

  processButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "bold",
  },

  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },
});