import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { GetRequestsBySolicitante } from "../../application/getRequestSent";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsBySolicitante(repository);

export default function RequestsSent() {

  const [requests, setRequests] = useState<RequestsForm[]>([]);
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

      const data = await getRequests.execute(user.numUsuario);

      setRequests(data);
    } catch (error) {
      console.log("ERROR loading requests:", error);
    }
  };


  const cancelarSolicitud = async (numSolicitud: number) => {
    Alert.alert(
      "Cancelar solicitud",
      "¿Estás seguro de que deseas cancelar esta solicitud?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí",
          style: "destructive",
          onPress: async () => {
            try {
              await repository.rejectRequest(
                numSolicitud,
                "Cancelada por el usuario"
              );

              Alert.alert(
                "Éxito",
                "La solicitud ha sido cancelada correctamente."
              );

              loadRequests();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No fue posible cancelar la solicitud."
              );
            }
          },
        },
      ]
    );
  };

  const viewRequest = (request: RequestsForm) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
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

  return (
    <View style={styles.container}>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.numSolicitud.toString()}

        renderItem={({ item }) => {

          const statusStyle = getStatusStyle(item.numStatus);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => viewRequest(item)}
            >

              <Text style={styles.title}>
                {getTipo(item.numTipo)}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.label}>Fecha:</Text> {item.fecha}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.label}>Descripción:</Text>{" "}
                {item.descripcion}
              </Text>

              <View style={styles.rowBetween}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.background },
                  ]}
                >
                  <Text style={{ color: statusStyle.text, fontWeight: "bold" }}>
                    {getStatusName(item.numStatus)}
                  </Text>
                </View>
              </View>

              {item.numStatus === 1 && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => cancelarSolicitud(item.numSolicitud)}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar solicitud
                  </Text>
                </TouchableOpacity>
              )}

            </TouchableOpacity>
          );
        }}

        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No has enviado solicitudes
          </Text>
        }

        contentContainerStyle={{
          paddingBottom: 10,
          flexGrow: 1,
        }}
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
    marginBottom: 10,
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
  statusContainer: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#870c0c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 40,
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },
});