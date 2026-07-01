import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

import { GetRequestsCompleted } from "../../application/getRequestCompleted";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsCompleted(repository);

export default function RequestsCompleted() {

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

      setRequests(data ?? []);

    } catch (error) {
      console.log("ERROR loading completed requests:", error);
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
            Solicitud #{item.numSolicitud}
          </Text>

          <Text>
            Estado: {item.numStatus}
          </Text>

          <Text>
            Finalizó: {item.fechaFinReal ?? "Sin fecha"}
          </Text>

        </TouchableOpacity>
      )}

      ListEmptyComponent={
        <Text style={styles.empty}>
          No hay solicitudes completadas
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

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },

});