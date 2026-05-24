
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, } from "react-native";
import { GetRequestsRejected } from "../../application/getRequestsRejected";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";


const repository = new SupabaseRequestsRepository();

const getRequests =new GetRequestsRejected(
    repository
  );

export default function RequestsRejected() {

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
          user.id,
          user.rol
        );

      setRequests(data);

    } catch (error) {

      console.log(error);
    }
  };

  const viewRequest = (
    request: any
  ) => {

    router.push({
      pathname: "/requests",
      params: {
        request:
          JSON.stringify(
            request
          ),
      },
    });
  };

  return (

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

          <Text>
            Estado:
            {item.estado}
          </Text>

          <Text>
            Motivo:
            {
              item.motivo_rechazo
            }
          </Text>

        </TouchableOpacity>
      )}

      ListEmptyComponent={
        <Text style={styles.empty}>
          No hay solicitudes
          rechazadas
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