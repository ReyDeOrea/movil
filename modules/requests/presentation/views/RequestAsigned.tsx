import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GetRequestsByTecnicoExterno } from "../../application/getRequestAsignedExterno";
import { GetRequestsByTecnicoInterno } from "../../application/getRequestAsignedInterno";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();

const getRequestsInterno = new GetRequestsByTecnicoInterno(repository);
const getRequestsExterno = new GetRequestsByTecnicoExterno(repository);

export default function RequestsAssigned() {

  const [requests, setRequests] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);


      let data: any[] = [];

      if (user.tipoTecnico === "interno") {
        data = await getRequestsInterno.execute(user.numUsuario);
      }

      if (user.tipoTecnico === "externo") {
        data = await getRequestsExterno.execute(user.numUsuario);
      }

      setRequests(data || []);

    } catch (error) {
      console.log("ERROR loading assigned requests:", error);
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

  const renderStatusColor = (status: number) => {
    switch (status) {
      case 1: return "#0b74f5";
      case 2: return "#5a3bf6";
      case 3: return "#f6c85c";
      case 4: return "#10B981";
      case 5: return "#EF4444";
      default: return "#6B7280";
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
              Solicitud # {item.numSolicitud}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Prioridad:</Text>{" "}
              {item.prioridad}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Descripción:</Text>{" "}
              {item.descripcion}
            </Text>

            <View
              style={[
                styles.statusContainer,
                { backgroundColor: renderStatusColor(item.numStatus) }
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
    backgroundColor: "#F3F4F6",
    padding: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
    textTransform: "capitalize",
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
    textTransform: "capitalize",
  },

  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },

});