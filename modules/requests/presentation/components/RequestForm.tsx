import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { CreateRequestUseCase } from "../../application/create";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const createRequest = new CreateRequestUseCase(repository);

export default function RequestForm() {

  const router = useRouter();

  const [numTipo, setNumTipo] = useState("");
  const [numTipoMantenimiento, setNumTipoMantenimiento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [numArea, setNumArea] = useState("");

  const enviarSolicitud = async () => {

    try {

      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData!);

      await createRequest.execute({
        numSolicitante: user.numUsuario,
        fecha: new Date().toISOString(),
        numTipo: Number(numTipo),
        numTipoMantenimiento:
          numTipo === "mantenimiento"
            ? Number(numTipoMantenimiento)
            : undefined,
        numArea: Number(numArea),
        descripcion: descripcion.trim(),
      });

      Alert.alert("Solicitud enviada correctamente");
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
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>Solicitud</Text>
            <MaterialCommunityIcons name="clipboard-text" size={28} color="#fff" />
          </View>
        </View>

        <View style={styles.form}>

          <Text style={styles.label}>Tipo de solicitud (numTipo)</Text>
          <TextInput
            style={styles.input}
            placeholder="1 = servicio / 2 = mantenimiento"
            value={numTipo}
            onChangeText={setNumTipo}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Tipo mantenimiento (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="ID tipo mantenimiento"
            value={numTipoMantenimiento}
            onChangeText={setNumTipoMantenimiento}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Área</Text>
          <TextInput
            style={styles.input}
            placeholder="ID del área"
            value={numArea}
            onChangeText={setNumArea}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <TouchableOpacity style={styles.button} onPress={enviarSolicitud}>
            <Text style={styles.buttonText}>Enviar solicitud</Text>
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