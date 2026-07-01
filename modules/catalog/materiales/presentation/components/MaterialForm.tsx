import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

interface Props {
  initialNumMaterial?: string;
  initialName?: string;
  initialQuantity?: string;
  initialUnit?: string;

  onSubmit: (
    numMaterial: number,
    nombre: string,
    cantidad: number,
    unidad: string
  ) => void;
}

export default function MaterialForm({
  initialNumMaterial = "",
  initialName = "",
  initialQuantity = "",
  initialUnit = "",
  onSubmit,
}: Props) {

  const [numMaterial, setNumMaterial] = useState(initialNumMaterial);
  const [nombre, setNombre] = useState(initialName);
  const [cantidad, setCantidad] = useState(initialQuantity);
  const [unidad, setUnidad] = useState(initialUnit);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              router.back()
            }
          >

            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#FFFFFF"
            />

          </TouchableOpacity>

          <View style={styles.rowHeader}>
            <Image
              source={require('../../../../../assets/images/ZUCARMEX.png')}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>

        <TextInput
          placeholder="Número de material"
          keyboardType="numeric"
          value={numMaterial}
          onChangeText={setNumMaterial}
          style={styles.input}
        />
        <TextInput
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        <TextInput
          placeholder="Cantidad"
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Unidad"
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
              Number(cantidad),
              unidad
            )
          }
        >
          <Text style={styles.buttonText}>
            Guardar
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    backgroundColor: "#ffffff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: "#000000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
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
  },
  imageZucarmex: {
    width: '45%',
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
});