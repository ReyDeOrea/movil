import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { CreateRequestUseCase } from "../../application/create";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = width * 0.42;

const repository = new SupabaseRequestsRepository();
const createRequest = new CreateRequestUseCase(repository);

type ImagePickerOptionsFixed = ImagePicker.ImagePickerOptions & {
  legacy?: boolean;
  selectionLimit?: number;
  orderedSelection?: boolean;
};

export default function RequestForm() {
  const router = useRouter();

  const [numTipo, setNumTipo] = useState("");
  const [numTipoMantenimiento, setNumTipoMantenimiento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [numArea, setNumArea] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [fecha] = useState(new Date().toLocaleDateString("en-CA"));
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");

        if (userData) {
          const user = JSON.parse(userData);
          setNombreUsuario(user.nombre);
        }
      } catch (error) {
        console.log("Error cargando usuario:", error);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    if (numTipo !== "2") {
      setNumTipoMantenimiento("");
    }
  }, [numTipo]);

  const seleccionarImagenes = async () => {
  try {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        "Permiso requerido",
        "Debes permitir acceso a tus fotos para seleccionar evidencias."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      selectionLimit: 0,

      quality: 1,
    });

    if (resultado.canceled) return;

    const nuevasImagenes = resultado.assets
      .map((asset) => asset.uri)
      .filter((uri) => uri && uri.length > 0);

    if (nuevasImagenes.length === 0) {
      Alert.alert("Error", "No se pudo obtener ninguna imagen.");
      return;
    }

    setImagenes((prev) => {
      const imagenesSinRepetir = nuevasImagenes.filter(
        (uri) => !prev.includes(uri)
      );

      return [...prev, ...imagenesSinRepetir];
    });
  } catch (error) {
    console.log("Error real seleccionando imágenes:", error);

    Alert.alert(
      "Error",
      "No se pudieron seleccionar las imágenes."
    );
  }
};

  const eliminarImagen = (uri: string) => {
    setImagenes((prev) => prev.filter((img) => img !== uri));
  };

  const enviarSolicitud = async () => {
    if (loading) return;

    if (!numTipo) {
      Alert.alert("Campo requerido", "Selecciona el tipo de solicitud.");
      return;
    }

    if (numTipo === "2" && !numTipoMantenimiento) {
      Alert.alert("Campo requerido", "Selecciona el tipo de mantenimiento.");
      return;
    }

    if (!numArea) {
      Alert.alert("Campo requerido", "Selecciona el área.");
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert("Campo requerido", "Escribe una descripción.");
      return;
    }

    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem("user");

      if (!userData) {
        Alert.alert("Error", "No se encontró la sesión del usuario.");
        return;
      }

      const user = JSON.parse(userData);

      await createRequest.execute(
        {
          numSolicitante: user.numUsuario,
          fecha: fecha,
          numTipo: Number(numTipo),
          numTipoMantenimiento:
            numTipo === "2" && numTipoMantenimiento
              ? Number(numTipoMantenimiento)
              : undefined,
          numArea: Number(numArea),
          descripcion: descripcion.trim(),
        },
        imagenes,
        "solicitante"
      );

      Alert.alert("Éxito", "Solicitud enviada correctamente.");
      router.replace("/requests");
    } catch (error: any) {
      console.log("Error enviando solicitud:", error);

      Alert.alert(
        "Error",
        error.message || "No se pudo enviar la solicitud."
      );
    } finally {
      setLoading(false);
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
            <Image
              source={require("../../../../assets/images/ZUCARMEX.png")}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.inputDisabled}
            editable={false}
            value={fecha}
          />

          <Text style={styles.label}>Solicitante</Text>
          <TextInput
            style={styles.inputDisabled}
            editable={false}
            value={nombreUsuario}
          />

          <Text style={styles.label}>Tipo de solicitud</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={numTipo}
              onValueChange={(itemValue) => setNumTipo(itemValue)}
            >
              <Picker.Item
                label="Seleccione..."
                value=""
                enabled={false}
                color="#999"
              />
              <Picker.Item label="Servicio" value="1" />
              <Picker.Item label="Mantenimiento" value="2" />
            </Picker>
          </View>

          {numTipo === "2" && (
            <>
              <Text style={styles.label}>Tipo de mantenimiento</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={numTipoMantenimiento}
                  onValueChange={(itemValue) =>
                    setNumTipoMantenimiento(itemValue)
                  }
                >
                  <Picker.Item
                    label="Seleccione..."
                    value=""
                    enabled={false}
                    color="#999"
                  />
                  <Picker.Item label="Preventivo" value="1" />
                  <Picker.Item label="Correctivo" value="2" />
                  <Picker.Item label="Reactivo" value="3" />
                </Picker>
              </View>
            </>
          )}

          <Text style={styles.label}>Área</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={numArea}
              onValueChange={(itemValue) => setNumArea(itemValue)}
            >
              <Picker.Item
                label="Seleccione un área..."
                value=""
                enabled={false}
                color="#999"
              />
              <Picker.Item label="Administración" value="1" />
              <Picker.Item label="Fábrica" value="2" />
              <Picker.Item label="Campo" value="3" />
              <Picker.Item label="Zona habitacional" value="4" />
            </Picker>
          </View>

          <Text style={styles.label}>Descripción</Text>

          <TextInput
            style={styles.textArea}
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Describe la solicitud..."
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Evidencias</Text>

          <TouchableOpacity
            style={styles.buttonImg}
            onPress={seleccionarImagenes}
          >
            <MaterialCommunityIcons name="image-plus" size={22} color="#fff" />

            <Text style={styles.buttonText}>Seleccionar imágenes</Text>
          </TouchableOpacity>
        </View>

        {imagenes.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
          >
            {imagenes.map((img) => (
              <View key={img} style={styles.imageContainer}>
                <Image source={{ uri: img }} style={styles.previewImage} />

                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => eliminarImagen(img)}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.form2}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={enviarSolicitud}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar solicitud</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
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
    backgroundColor: "#148248",
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

  form2: {
    padding: 20,
    paddingBottom: 60,
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
    backgroundColor: "#232323",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 20,
  },

  buttonImg: {
    backgroundColor: "#3a6e19",
    padding: 15,
    justifyContent: "center",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 8,
  },

  imageZucarmex: {
    width: "45%",
    height: 60,
  },

  cancelButton: {
    backgroundColor: "#870c0c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginBottom: 15,
  },

  inputDisabled: {
    backgroundColor: "#d8d5d5",
    borderWidth: 1,
    borderColor: "#acacac",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: "#6B7280",
  },

  BP: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 15,
  },

  imgD: {
    width: width * 0.9,
    height: BANNER_HEIGHT,
    borderRadius: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    margin: 5,
  },

  dotActive: {
    backgroundColor: "#148248",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  imagesScroll: {
    marginTop: 12,
    marginHorizontal: 20,
    marginBottom: 15,
  },

  imageContainer: {
    position: "relative",
    marginRight: 10,
  },

  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },

  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#EF4444",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
});