import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { DeleteTecnicoExternoUseCase } from "../../application/deleteProveedor";
import { GetTecnicosExternosUseCase } from "../../application/getProveedores";
import { TecnicoExterno } from "../../domain/proveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoList from "../components/proveedorList";


export default function TecnicosExternosView() {

  const router = useRouter();

  const repository = new TecnicoExternoDataSource();
  const getTecnicos = new GetTecnicosExternosUseCase(repository);
  const deleteTecnico = new DeleteTecnicoExternoUseCase(repository);

  const [tecnicos, setTecnicos] = useState<TecnicoExterno[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    loadTecnicos();
    }, [])
  );

  const loadTecnicos = async () => {
    try {

      const data =
        await getTecnicos.execute();

      setTecnicos(data);

    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push({
      pathname: "/editproveedor",
      params: {
        id: id.toString(),
      },
    });
  };

  const handleDelete = async (id: number) => {

    try {

      await deleteTecnico.execute(id);

      loadTecnicos();

    } catch (error: any) {

      alert(error.message);

    }
  };

  if (loading) {

    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Técnicos Externos
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/createproveedor")
        }
      >
        <Text style={styles.buttonText}>
          Agregar Técnico
        </Text>
      </TouchableOpacity>

      <TecnicoExternoList
        tecnicos={tecnicos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F3F4F6",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});