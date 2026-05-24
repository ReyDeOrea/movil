import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

import { useEffect, useState, } from "react";

import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GetRequestsByTecnico } from "../../application/getRequestAsigned";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";



const repository = new SupabaseRequestsRepository();

const getRequests = new GetRequestsByTecnico(
    repository
  );

export default function RequestsAssigned() {

  const [requests, setRequests] =
    useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {

    try {

      const userData =
        await AsyncStorage.getItem(
          "user"
        );

      if (!userData) return;

      const user =
        JSON.parse(userData);

      const data =
        await getRequests.execute(
          user.id
        );

      setRequests(data || []);

    } catch (error) {

      console.log(
        "ERROR loading assigned requests:",
        error
      );
    }
  };

  const viewRequest = (
    request: any
  ) => {

    router.push({
      pathname:
        "/requests",
      params: {
        request:
          JSON.stringify(
            request
          ),
      },
    });
  };

  const renderStatusColor = (
    estado: string
  ) => {

    switch (estado) {

      case "generada":
        return "#F59E0B";

      case "asignada":
        return "#3B82F6";

      case "en_proceso":
        return "#8B5CF6";

      case "terminada":
        return "#10B981";

      case "rechazada":
        return "#EF4444";

      default:
        return "#6B7280";
    }
  };

  return (

    <View style={styles.container}>

      <FlatList
        data={requests}

        keyExtractor={(item) =>
          item.id.toString()
        }

        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              viewRequest(item)
            }
          >

            <Text style={styles.title}>
              {item.tipo_solicitud}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>
                Prioridad:
              </Text>{" "}
              {item.prioridad}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>
                Descripción:
              </Text>{" "}
              {item.descripcion}
            </Text>

            <View
              style={[
                styles.statusContainer,
                {
                  backgroundColor:
                    renderStatusColor(
                      item.estado
                    ),
                },
              ]}
            >

              <Text style={styles.statusText}>
                {item.estado}
              </Text>

            </View>

          </TouchableOpacity>
        )}

        ListEmptyComponent={

          <Text style={styles.emptyText}>
            No tienes solicitudes asignadas
          </Text>
        }

        contentContainerStyle={{
          paddingBottom: 100,
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