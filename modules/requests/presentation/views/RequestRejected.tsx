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
      pathname: "/requests",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const renderStatusColor = (status: number) => {
    switch (status) {
      case 5:
        return "#EF4444"; // rechazada
      default:
        return "#6B7280";
    }
  };

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.numSolicitud.toString()}

      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => viewRequest(item)}
        >

          <Text style={styles.title}>
            Tipo: {item.numTipo}
          </Text>

          <Text style={styles.text}>
            Estado: {item.numStatus}
          </Text>

          <Text style={styles.text}>
            Motivo: {item.motivoCancelacion ?? "Sin motivo"}
          </Text>

          <View
            style={[
              styles.badge,
              { backgroundColor: renderStatusColor(item.numStatus) }
            ]}
          >
            <Text style={styles.badgeText}>
              RECHAZADA
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
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
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

  badge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
});