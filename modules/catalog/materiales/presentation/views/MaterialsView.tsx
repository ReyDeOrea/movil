import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DeleteMaterialUseCase } from "../../application/deleteMaterial";
import { GetMaterialsUseCase } from "../../application/getMaterials";
import { Material } from "../../domain/material";
import { MaterialDataSource } from "../../infraestructure/materialesDatasource";
import MaterialList from "../components/MaterialList";

export default function MaterialsView() {
  const router = useRouter();
  const repository = new MaterialDataSource();
  const getMaterials = new GetMaterialsUseCase(repository);
  const deleteMaterial = new DeleteMaterialUseCase(repository);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data =
        await getMaterials.execute();

      setMaterials(data);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (id: number) => {
    router.push({
      pathname: "/editmaterial",
      params: {
        id: id.toString(),
      },
    });
  };
  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar material",
      "¿Deseas eliminar este material?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {

              await deleteMaterial.execute(id);

              setMaterials((prev) =>
                prev.filter(
                  (material) =>
                    material.numMaterial !== id
                )
              );

              Alert.alert(
                "Éxito",
                "Material eliminado correctamente"
              );

            } catch (error: any) {

              Alert.alert(
                "Error",
                error.message
              );

            }
          },
        },
      ]
    );
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
        Catálogo de Materiales
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/creatematerial")}
      >
        <Text style={styles.buttonText}>
          Agregar Material
        </Text>
      </TouchableOpacity>
      <MaterialList materials={materials}
        onEdit={handleEdit}
        onDelete={handleDelete} />
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
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});