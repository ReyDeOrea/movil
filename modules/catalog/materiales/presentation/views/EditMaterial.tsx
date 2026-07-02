
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
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
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>

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

        <View style={styles.card}>
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

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
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
    marginBottom: 40,
    flex: 1,
    backgroundColor: "#F5F5F5"
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  },
  imageZucarmex: {
    width: '45%',
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
  buttonText: {
    color: "#ffffff",
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
    backgroundColor: "#870c0c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
});

