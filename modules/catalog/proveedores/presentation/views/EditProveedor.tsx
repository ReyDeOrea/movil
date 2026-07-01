import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EditTecnicoExternoUseCase } from "../../application/editProveedor";
import { GetTecnicoExternoByIdUseCase } from "../../application/getProvedor";
import { TecnicoExterno } from "../../domain/proveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoForm from "../components/proveedorForm";

export default function EditTecnicoExternoView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const repository = new TecnicoExternoDataSource();
  const getTecnicoUseCase = new GetTecnicoExternoByIdUseCase(repository);
  const editTecnicoUseCase = new EditTecnicoExternoUseCase(repository);

  const [tecnico, setTecnico] = useState<TecnicoExterno | null>(null);

  useEffect(() => {
    loadTecnico();
  }, []);

  const loadTecnico = async () => {
    try {
      const data = await getTecnicoUseCase.execute(Number(id));

      if (!data) {
        Alert.alert("Error", "Técnico externo no encontrado");
        router.back();
        return;
      }

      setTecnico(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleUpdate = async (
    numTecnicoExterno: number,
    nombre: string,
    empresa: string,
    telefono: string,
    especialidad: string
  ) => {
    try {
      await editTecnicoUseCase.execute({
        numTecnicoExterno,
        nombre,
        empresa,
        telefono,
        especialidad,
      });

      Alert.alert("Éxito", "Técnico actualizado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (!tecnico) {
    return <Text style={styles.loading}>Cargando...</Text>;
  }

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

      <TecnicoExternoForm
        initialNumTecnicoExterno={tecnico.numTecnicoExterno.toString()}
        showNumero
        initialNombre={tecnico.nombre}
        initialEmpresa={tecnico.empresa ?? ""}
        initialTelefono={tecnico.telefono ?? ""}
        initialEspecialidad={tecnico.especialidad ?? ""}
        onSubmit={handleUpdate}
      />
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loading: {
    marginTop: 40,
    textAlign: "center",
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
  createButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#67B346",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  fabText: {
    color: "white",
    fontSize: 30
  },
});
