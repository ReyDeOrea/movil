import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

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
    <View>

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
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});