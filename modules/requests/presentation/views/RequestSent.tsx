import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { GetUserRequests } from "../../application/getRequestSent";
import { AdoptionRepository } from "../../infraestructure/adoptionDataSource";

const repository = new AdoptionRepository();
const getUserRequests = new GetUserRequests(repository);

export default function RequestsSent() {
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
      let data = await getUserRequests.execute(user.id);

      data = await Promise.all(
        data.map(async (request: any) => {
          const pet = await repository.getPetById(request.pet_id);
          return { ...request, pet_name: pet?.name || "Desconocida" };
        })
      );

      setRequests(data || []);
    } catch (error) {
      console.error("Error cargando solicitudes enviadas:", error);
    }
  };

  const verSolicitud = (request: any) => {
    router.push({
      pathname: "/viewRequestForm",
      params: { request: JSON.stringify(request) }
    });
  };

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
         onPress={() => verSolicitud(item)} style={styles.card}>
          <Text style={styles.text}>
            <Text style={styles.label}>Mascota:</Text> {item.pet_name}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Estado:</Text> {item.estado}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          No has enviado solicitudes
        </Text>
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff"
  },
  text: {
    fontSize: 16,
    marginBottom: 5
  },
  label: {
    fontWeight: "bold"
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555"
  }
});