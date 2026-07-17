import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [])
  );

  const loadMaterials = async () => {
    try {
      setLoading(true);

      const data = await getMaterials.execute();

      setMaterials(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar los materiales y herramientas"
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const filteredMaterials = materials.filter((material) =>
    (
      normalizeText(material.nombreMaterial ?? "").includes(
        normalizeText(searchText)
      ) ||
      normalizeText(material.tipoMaterial ?? "material").includes(
        normalizeText(searchText)
      )
    )
  );

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
      "Eliminar registro",
      "¿Deseas eliminar este material o herramienta?",
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
                  (material) => material.numMaterial !== id
                )
              );

              Alert.alert(
                "Éxito",
                "Registro eliminado correctamente"
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No se pudo eliminar el material o herramienta"
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

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="#777"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o tipo"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={22}
                color="#777"
              />
            </TouchableOpacity>
          )}
        </View>

        {filteredMaterials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={70}
              color="#C5C5C5"
            />

            <Text style={styles.emptyTitle}>
              No se encontraron materiales ni herramientas
            </Text>

            <Text style={styles.emptyText}>
              Intenta buscar con otro nombre.
            </Text>
          </View>
        ) : (
          <MaterialList
            materials={filteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
            resetKey={`${searchText}-${filteredMaterials.length}`}
          />
        )}

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
    marginBottom: 40,
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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 52,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 15,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
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
    alignItems: "center",
  },

  fabText: {
    color: "white",
    fontSize: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});