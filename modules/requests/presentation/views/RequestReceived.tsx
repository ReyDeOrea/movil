import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

import { useEffect, useState } from "react";

import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GetAllRequests } from "../../application/getRequestRecived";
import { UpdateRequestStatus } from "../../application/statusRequest";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";



const repository =
  new SupabaseRequestsRepository();

const getRequests = new GetAllRequests(repository);

const updateRequest = new UpdateRequestStatus(
    repository
  );

export default function RequestsReceived() {

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

      const data =
        await getRequests.execute();

      setRequests(data || []);

    } catch (error) {

      console.log(
        "ERROR loading requests:",
        error
      );
    }
  };

  const aceptar = async (
    request: any
  ) => {

    try {

      await updateRequest.execute(
        request.id,
        {
          estado: "asignada",
        }
      );

      Alert.alert(
        "Solicitud aceptada"
      );

      loadRequests();

    } catch (error) {

      console.log(
        "ERROR accepting request:",
        error
      );
    }
  };

  const rechazar = async (
    request: any
  ) => {

    try {

      await updateRequest.execute(
        request.id,
        {
          estado: "rechazada",
          motivo_rechazo:
            "Solicitud rechazada",
        }
      );

      Alert.alert(
        "Solicitud rechazada"
      );

      loadRequests();

    } catch (error) {

      console.log(
        "ERROR rejecting request:",
        error
      );
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

  const llamarSolicitante = (
    telefono: string
  ) => {

    Linking.openURL(
      `tel:${telefono}`
    );
  };

  return (

    <FlatList
      data={requests}

      keyExtractor={(item) =>
        item.id.toString()
      }

      renderItem={({ item }) => (

        <TouchableOpacity
          onPress={() =>
            viewRequest(item)
          }

          style={styles.card}
        >

          <Text style={styles.text}>

            <Text style={styles.label}>
              Tipo:
            </Text>{" "}

            {item.tipo_solicitud}

          </Text>

          <Text style={styles.text}>

            <Text style={styles.label}>
              Estado:
            </Text>{" "}

            {item.estado}

          </Text>

          <Text style={styles.text}>

            <Text style={styles.label}>
              Prioridad:
            </Text>{" "}

            {
              item.prioridad ||
              "Sin prioridad"
            }

          </Text>

          <Text style={styles.text}>

            <Text style={styles.label}>
              Descripción:
            </Text>{" "}

            {item.descripcion}

          </Text>

          {
            item.estado ===
              "generada" && (

              <View
                style={
                  styles.buttonsContainer
                }
              >

                <TouchableOpacity
                  onPress={() =>
                    aceptar(item)
                  }

                  style={[
                    styles.button,
                    styles.accept,
                  ]}
                >

                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Aceptar
                  </Text>

                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    rechazar(item)
                  }

                  style={[
                    styles.button,
                    styles.reject,
                  ]}
                >

                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Rechazar
                  </Text>

                </TouchableOpacity>

              </View>
            )
          }

          {
            item.estado ===
              "asignada" &&

              item.telefono && (

              <TouchableOpacity
                onPress={() =>
                  llamarSolicitante(
                    item.telefono
                  )
                }

                style={[
                  styles.button,
                  styles.call,
                ]}
              >

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Llamar solicitante
                </Text>

              </TouchableOpacity>
            )
          }

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
  );
}

const styles = StyleSheet.create({

  card: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },

  text: {
    fontSize: 16,
    marginBottom: 5,
    color: "#374151",
  },

  label: {
    fontWeight: "bold",
    color: "#111827",
  },

  call: {
    backgroundColor: "#BFDBFE",
    marginTop: 10,
  },

  buttonsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },

  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },

  accept: {
    backgroundColor: "#BBF7D0",
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

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6B7280",
  },

});