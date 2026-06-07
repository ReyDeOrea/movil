
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, } from "react-native";
import { EditMaterialUseCase } from "../../application/editMaterial";
import { GetMaterialByIdUseCase } from "../../application/getMaterialByIS";
import { Material } from "../../domain/material";
import { MaterialDataSource } from "../../infraestructure/materialesDatasource";


export default function EditMaterial() {

  const router = useRouter();
  const { id } = useLocalSearchParams();
  console.log("ID RECIBIDO:", id);
  console.log("TIPO:", typeof id);
  const repository = new MaterialDataSource();
  const getMaterialUseCase = new GetMaterialByIdUseCase(repository);
  const editMaterialUseCase = new EditMaterialUseCase(repository);

  const [nombreMaterial, setNombreMaterial] = useState("");
  const [unidad, setUnidad] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    loadMaterial();
  }, []);

  const loadMaterial = async () => {
    try {
      console.log("NUMBER ID:", Number(id));
      const material =
        await getMaterialUseCase.execute(Number(id));

      if (!material) {
        Alert.alert("Error", "Material no encontrado");
        router.back();
        return;
      }

      setNombreMaterial(material.nombreMaterial);
      setUnidad(material.unidad ?? "");
      setCantidad(
        material.cantidad !== undefined &&
          material.cantidad !== null
          ? material.cantidad.toString()
          : ""
      );

    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleUpdate = async () => {
    try {

      const material: Material = {
        numMaterial: Number(id),
        nombreMaterial,
        unidad,
        cantidad: Number(cantidad),
      };

      await editMaterialUseCase.execute(material);

      Alert.alert(
        "Éxito",
        "Material actualizado correctamente"
      );

      router.back();

    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Editar Material
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del material"
        value={nombreMaterial}
        onChangeText={setNombreMaterial}
      />

      <TextInput
        style={styles.input}
        placeholder="Unidad"
        value={unidad}
        onChangeText={setUnidad}
      />

      <TextInput
        style={styles.input}
        placeholder="Cantidad"
        keyboardType="numeric"
        value={cantidad}
        onChangeText={setCantidad}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>
          Guardar cambios
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

