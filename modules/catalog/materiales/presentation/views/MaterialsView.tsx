import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [])
  );

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

        <MaterialList materials={materials}
          onEdit={handleEdit}
          onDelete={handleDelete} />

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/creatematerial")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    marginBottom: 40
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});