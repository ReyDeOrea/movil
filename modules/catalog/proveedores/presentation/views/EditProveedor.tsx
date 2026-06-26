import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Técnico Externo</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
});
