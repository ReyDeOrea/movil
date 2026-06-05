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

import { GetRequestsBySolicitante } from "../../application/getRequestSent";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsBySolicitante(repository);

export default function RequestsSent() {

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

      const data = await getRequests.execute(user.numUsuario);

      setRequests(data);
    } catch (error) {
      console.log("ERROR loading requests:", error);
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

  const renderEstadoColor = (status: number) => {
    switch (status) {
      case 1:
        return "#F59E0B"; // generada
      case 2:
        return "#3B82F6"; // asignada
      case 3:
        return "#8B5CF6"; // en proceso
      case 4:
        return "#10B981"; // terminada
      case 5:
        return "#EF4444"; // rechazada
      default:
        return "#6B7280";
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
              Tipo: {item.numTipo}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Descripción:</Text>{" "}
              {item.descripcion}
            </Text>

            <View
              style={[
                styles.statusContainer,
                {
                  backgroundColor: renderEstadoColor(item.numStatus),
                },
              ]}
            >
              <Text style={styles.statusText}>
                {item.numStatus}
              </Text>
            </View>

          </TouchableOpacity>
        )}

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
    backgroundColor: "#F3F4F6",
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
    fontSize: 15,
    marginBottom: 6,
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
  },

  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },
});