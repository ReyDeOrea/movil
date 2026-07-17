import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EditMaterialUseCase } from "../../application/editMaterial";
import { GetMaterialByIdUseCase } from "../../application/getMaterialByIS";
import { Material, TipoMaterial } from "../../domain/material";
import { MaterialDataSource } from "../../infraestructure/materialesDatasource";

export default function EditMaterial() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const repository = new MaterialDataSource();
  const getMaterialUseCase = new GetMaterialByIdUseCase(repository);
  const editMaterialUseCase = new EditMaterialUseCase(repository);

  const [nombreMaterial, setNombreMaterial] = useState("");
  const [unidad, setUnidad] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [tipoMaterial, setTipoMaterial] =
    useState<TipoMaterial>("material");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaterial();
  }, [id]);

  const loadMaterial = async () => {
    try {
      setLoading(true);

      const material = await getMaterialUseCase.execute(Number(id));

      if (!material) {
        Alert.alert("Error", "Material o herramienta no encontrado");
        router.back();
        return;
      }

      setNombreMaterial(material.nombreMaterial);
      setUnidad(material.unidad ?? "");
      setCantidad(String(material.cantidad ?? 0));
      setTipoMaterial(material.tipoMaterial ?? "material");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.detail ??
          error?.message ??
          "No se pudo cargar el registro"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const material: Material = {
        numMaterial: Number(id),
        nombreMaterial,
        unidad,
        cantidad: Number(cantidad || 0),
        tipoMaterial,
      };

      await editMaterialUseCase.execute(material);

      Alert.alert(
        "Éxito",
        tipoMaterial === "herramienta"
          ? "Herramienta actualizada correctamente"
          : "Material actualizado correctamente",
        [{ text: "Aceptar", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.detail ??
          error?.message ??
          "No se pudo actualizar el registro"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.rowHeader}>
            <Image
              source={require("../../../../../assets/images/ZUCARMEX.png")}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.card}>
          {loading ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre del material o herramienta"
                placeholderTextColor="#888888"
                value={nombreMaterial}
                onChangeText={setNombreMaterial}
              />

              <Text style={styles.label}>Tipo</Text>

              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tipoMaterial === "material" && styles.typeButtonSelected,
                  ]}
                  onPress={() => setTipoMaterial("material")}
                >
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={22}
                    color={
                      tipoMaterial === "material" ? "#FFFFFF" : "#148248"
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      tipoMaterial === "material" &&
                        styles.typeButtonTextSelected,
                    ]}
                  >
                    Material
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tipoMaterial === "herramienta" && styles.typeButtonSelected,
                  ]}
                  onPress={() => setTipoMaterial("herramienta")}
                >
                  <MaterialCommunityIcons
                    name="tools"
                    size={22}
                    color={
                      tipoMaterial === "herramienta"
                        ? "#FFFFFF"
                        : "#148248"
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      tipoMaterial === "herramienta" &&
                        styles.typeButtonTextSelected,
                    ]}
                  >
                    Herramienta
                  </Text>
                </TouchableOpacity>
              </View>

              {/* <Text style={styles.helperText}>
                Al terminar una solicitud, los materiales consumibles bajan su
                stock. Las herramientas conservan su stock.
              </Text> */}

              <TextInput
                style={styles.input}
                placeholder="Unidad"
                placeholderTextColor="#888888"
                value={unidad}
                onChangeText={setUnidad}
              />

              <TextInput
                style={styles.input}
                placeholder="Cantidad"
                placeholderTextColor="#888888"
                keyboardType="numeric"
                value={cantidad}
                onChangeText={(text) =>
                  setCantidad(text.replace(/[^0-9]/g, ""))
                }
              />

              <TouchableOpacity
                style={[styles.button, saving && styles.disabledButton]}
                onPress={handleUpdate}
                disabled={saving}
              >
                <Text style={styles.buttonText}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={saving}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: "#F5F5F5",
  },
  rowHeader: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
    zIndex: 10,
  },
  header: {
    width: "100%",
    height: 100,
    paddingTop: 35,
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  label: {
    marginHorizontal: 20,
    marginBottom: 7,
    color: "#374151",
    fontWeight: "bold",
  },
  typeContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#148248",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
  },
  typeButtonSelected: {
    backgroundColor: "#148248",
  },
  typeButtonText: {
    color: "#148248",
    fontWeight: "bold",
  },
  typeButtonTextSelected: {
    color: "#FFFFFF",
  },
  helperText: {
    marginHorizontal: 20,
    marginBottom: 15,
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
  },
  imageZucarmex: {
    width: "45%",
    height: 60,
  },
  button: {
    backgroundColor: "#232323",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  card: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#870C0C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  loadingText: {
    textAlign: "center",
    color: "#6B7280",
    paddingVertical: 20,
  },
});
