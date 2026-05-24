import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";

import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


import { CreateRequest } from "../../application/create";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();

const createRequest = new CreateRequest(repository);

export default function RequestForm() {

  const router = useRouter();

  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [tipoMantenimiento, setTipoMantenimiento] = useState("");

  const [descripcion, setDescripcion] = useState("");

  const [areaId, setAreaId] = useState("");

  const [evidencia1, setEvidenciaS] = useState("");
  const [evidencia2, setEvidenciaT] = useState("");

  const enviarSolicitud = async () => {

    try {

      const userData = await AsyncStorage.getItem("user");

      const user = JSON.parse(userData!);

      await createRequest.execute({

        solicitante_id: user.id,

        fecha_solicitud: new Date().toISOString(),

        tipo_solicitud: tipoSolicitud as
          | "servicio"
          | "mantenimiento",

        tipo_mantenimiento:
          tipoSolicitud === "mantenimiento"
            ? tipoMantenimiento as
                | "preventivo"
                | "correctivo"
                | "reactivo"
            : undefined,

        area_id: areaId,

        descripcion,

        evidencia_S: evidencia1,

        evidencia_T: evidencia2,

        externo: false,
      });

      Alert.alert(
        "Solicitud enviada correctamente"
      );

      router.back();

    } catch (error: any) {

      Alert.alert(error.message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>

        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>

            <Text style={styles.title}>
              Solicitud
            </Text>

            <MaterialCommunityIcons
              name="clipboard-text"
              size={28}
              color="#fff"
            />
          </View>
        </View>

        <View style={styles.form}>

          <Text style={styles.section}>
            Datos de la solicitud
          </Text>

          <Text style={styles.label}>
            Tipo de solicitud
          </Text>

          <TextInput
            style={styles.input}
            placeholder="servicio o mantenimiento"
            value={tipoSolicitud}
            onChangeText={setTipoSolicitud}
          />

          {
            tipoSolicitud === "mantenimiento" && (
              <>
                <Text style={styles.label}>
                  Tipo de mantenimiento
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="preventivo, correctivo o reactivo"
                  value={tipoMantenimiento}
                  onChangeText={setTipoMantenimiento}
                />
              </>
            )
          }

          <Text style={styles.label}>
            Área
          </Text>

          <TextInput
            style={styles.input}
            placeholder="ID del área"
            value={areaId}
            onChangeText={setAreaId}
          />

          <Text style={styles.label}>
            Descripción
          </Text>

          <TextInput
            style={styles.textArea}
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={styles.section}>
            Evidencias
          </Text>

          <Text style={styles.label}>
            Evidencia 1
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Evidencia"
            value={evidencia1}
            onChangeText={setEvidenciaS}
          />

          <Text style={styles.label}>
            Evidencia 2
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Evidencia"
            value={evidencia2}
            onChangeText={setEvidenciaT}
          />

          <Text style={styles.label}>
            Evidencia 3
          </Text>


          <TouchableOpacity
            style={styles.button}
            onPress={enviarSolicitud}
          >

            <Text style={styles.buttonText}>
              Enviar solicitud
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginRight: 8,
  },

  form: {
    padding: 20,
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 10,
  },

  label: {
    marginBottom: 5,
    color: "#444",
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: "#000",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 15,
    color: "#000",
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});