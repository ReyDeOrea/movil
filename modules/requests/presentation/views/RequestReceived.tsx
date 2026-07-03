import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { GetAllRequests } from "../../application/getRequestRecived";
import { UpdateRequestStatus } from "../../application/statusRequest";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetAllRequests(repository);
const updateRequest = new UpdateRequestStatus(repository);

export default function RequestsReceived() {

  const [requests, setRequests] = useState<RequestsForm[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      await AsyncStorage.getItem("user");

      const data = await getRequests.execute();
      setRequests(data ?? []);

    } catch (error) {
      console.log("ERROR loading requests:", error);
    }
  };

  const aceptar = async (request: RequestsForm) => {
    try {
      await updateRequest.execute(request.numSolicitud, {
        numStatus: 2,
      });

      Alert.alert("Solicitud aceptada");

      router.push({
        pathname: "/formAdmin",
        params: {
   request: encodeURIComponent(JSON.stringify(request)),        },
      });

    } catch (error) {
      console.log("ERROR accepting request:", error);
    }
  };


  const rechazar = async (request: RequestsForm) => {
    try {
      await updateRequest.execute(request.numSolicitud, {
        numStatus: 5,
        motivoCancelacion: "Solicitud rechazada"
      });

      Alert.alert("Solicitud rechazada");
      loadRequests();

    } catch (error) {
      console.log("ERROR rejecting request:", error);
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

  const statusColors: Record<number, { background: string; text: string }> = {
    1: { background: "#d7d7d7", text: "#6c6c6c" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? { background: "#6B7280", text: "#fff" };

  const canTakeAction = (status: number) => {
    return status === 1;
  };
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

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.numSolicitud.toString()}

        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => viewRequest(item)}
            style={styles.card}
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
                  {
                    backgroundColor: getStatusStyle(item.numStatus).background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusStyle(item.numStatus).text },
                  ]}
                >
                  {getStatusName(item.numStatus)}
                </Text>
              </View>
            </View>
            {canTakeAction(item.numStatus) && (
              <View style={styles.buttonsContainer}>

                <TouchableOpacity
                  onPress={() => aceptar(item)}
                  style={[styles.button, styles.accept]}
                >
                  <Text style={styles.buttonText}>Aceptar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => rechazar(item)}
                  style={[styles.button, styles.reject]}
                >
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>

              </View>
            )}

          </TouchableOpacity>
        )}

        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay solicitudes
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

  text: {
    fontSize: 14,
    marginBottom: 3,
    color: "#374151",
  },

  label: {
    fontWeight: "bold",
  },

  call: {
    backgroundColor: "#BFDBFE",
    marginTop: 10,
  },

  buttonsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },

  accept: {
    backgroundColor: "#c7f8bc",
    marginRight: 10,
  },

  reject: {
    backgroundColor: "#FECACA",
  },

  buttonText: {
    color: "#111827",
    fontWeight: "bold",
    textAlign: "center",
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6B7280",
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
});