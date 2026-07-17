import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { TipoMaterial } from "../../domain/material";

interface Props {
  initialNumMaterial?: string;
  initialName?: string;
  initialQuantity?: string;
  initialUnit?: string;
  initialType?: TipoMaterial;

  onSubmit: (
    numMaterial: number,
    nombre: string,
    cantidad: number,
    unidad: string,
    tipoMaterial: TipoMaterial
  ) => void | Promise<void>;
}

export default function MaterialForm({
  initialNumMaterial = "",
  initialName = "",
  initialQuantity = "",
  initialUnit = "",
  initialType = "material",
  onSubmit,
}: Props) {
  const [numMaterial, setNumMaterial] = useState(initialNumMaterial);
  const [nombre, setNombre] = useState(initialName);
  const [cantidad, setCantidad] = useState(initialQuantity);
  const [unidad, setUnidad] = useState(initialUnit);
  const [tipoMaterial, setTipoMaterial] =
    useState<TipoMaterial>(initialType);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
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
          <TextInput
            placeholder="Número de material"
            placeholderTextColor="#888888"
            keyboardType="numeric"
            value={numMaterial}
            onChangeText={(text) =>
              setNumMaterial(text.replace(/[^0-9]/g, ""))
            }
            style={styles.input}
          />

          <TextInput
            placeholder="Nombre"
            placeholderTextColor="#888888"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
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
                color={tipoMaterial === "material" ? "#FFFFFF" : "#148248"}
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
                  tipoMaterial === "herramienta" ? "#FFFFFF" : "#148248"
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
            Los materiales disminuyen al terminar una solicitud. Las
            herramientas se registran como utilizadas, pero su stock no baja.
          </Text> */}

          <TextInput
            placeholder="Cantidad"
            placeholderTextColor="#888888"
            value={cantidad}
            onChangeText={(text) =>
              setCantidad(text.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            placeholder="Unidad"
            placeholderTextColor="#888888"
            value={unidad}
            onChangeText={setUnidad}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              onSubmit(
                Number(numMaterial),
                nombre,
                Number(cantidad || 0),
                unidad,
                tipoMaterial
              )
            }
          >
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    backgroundColor: "#F5F5F5",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    color: "#111827",
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
  button: {
    backgroundColor: "#232323",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
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
  imageZucarmex: {
    width: "45%",
    height: 60,
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
});
