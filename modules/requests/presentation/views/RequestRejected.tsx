import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { GetRequestsRejected } from "../../application/getRequestsRejected";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsRejected(repository);

export default function RequestsRejected() {

  const [requests, setRequests] = useState<RequestsForm[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) return;

      const user = JSON.parse(userData);

      const data = await getRequests.execute(
        user.numUsuario,
        user.numRol
      );

      setRequests(data);
    } catch (error) {
      console.log("ERROR loading rejected requests:", error);
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

  const renderStatusColor = (status: number) => {
    switch (status) {
      case 5:
        return "#FECACA";
      default:
        return "#6B7280";
    }
  };
  const renderTipo = (tipo: number) => {
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

        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => viewRequest(item)}
          >

            <Text style={styles.title}>
              {renderTipo(item.numTipo)}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Fecha:</Text> {item.fecha}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Solicitante:</Text>{" "}
              {item.nombreSolicitante ?? "Sin nombre"}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Motivo: </Text>{item.motivoCancelacion ?? "Sin motivo"}
            </Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: renderStatusColor(item.numStatus) }
              ]}
            >
              <Text style={styles.statusText}>
                Cancelada
              </Text>
            </View>

          </TouchableOpacity>
        )}

        ListEmptyComponent={
          <Text style={styles.empty}>
            No hay solicitudes rechazadas
          </Text>
        }
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
    color: "#991B1B",
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