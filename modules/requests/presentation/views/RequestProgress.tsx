import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { GetRequestsInProgress } from "../../application/getRequestProgress";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsInProgress(repository);

const ROL_TECNICO = 3;

export default function RequestsInProgress() {
  const [requests, setRequests] = useState<RequestsForm[]>([]);
  const [userRole, setUserRole] = useState<number | null>(null);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const loadRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) return;

      const user = JSON.parse(userData);

      const numUsuario = Number(
        user.numUsuario ??
        user.numusuario ??
        user.num_usuario
      );

      const numRol = Number(
        user.numRol ??
        user.numrol ??
        user.num_rol
      );

      setUserRole(numRol);

      const data = await getRequests.execute(
        numUsuario,
        numRol
      );

      console.log("USUARIO ACTUAL:", {
        numUsuario,
        numRol
      });

      console.log("SOLICITUDES RECIBIDAS:", data);

      const solicitudesEnProceso = (data ?? []).filter((item) => {
        const status = Number(
          item.numStatus ??
          (item as any).numstatus ??
          (item as any).num_status
        );

        return status === 3;
      });

      setRequests(solicitudesEnProceso);
    } catch (error) {
      console.log("ERROR loading requests in progress:", error);
    }
  };

  const viewRequest = (request: RequestsForm) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const completeRequest = (request: RequestsForm) => {
    if (userRole !== ROL_TECNICO) return;

    router.push({
      pathname: "/formTec",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const renderStatusColor = (status: number) => {
    switch (Number(status)) {
      case 3:
        return "#DBEAFE";
      default:
        return "#E5E7EB";
    }
  };

  const renderStatusTextColor = (status: number) => {
    switch (Number(status)) {
      case 3:
        return "#1E40AF";
      default:
        return "#374151";
    }
  };

  const renderStatusName = (status: number) => {
    switch (Number(status)) {
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
        keyExtractor={(item) => item.numSolicitud.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => viewRequest(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.title}>
              {renderTipo(item.numTipo)}
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
                {
                  backgroundColor: renderStatusColor(item.numStatus)
                }
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: renderStatusTextColor(item.numStatus)
                  }
                ]}
              >
                {renderStatusName(item.numStatus)}
              </Text>
            </View>

            {userRole === ROL_TECNICO && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={(event) => {
                  event.stopPropagation();
                  completeRequest(item);
                }}
              >
                <Text style={styles.completeButtonText}>
                  Marcar completada
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No hay solicitudes en proceso
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

  completeButton: {
    marginTop: 14,
    backgroundColor: "#c7f8bc",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  completeButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "bold",
  },

  label: {
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
});