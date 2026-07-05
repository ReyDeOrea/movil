import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadTecnicos();
    }, [])
  );

  const loadTecnicos = async () => {
    try {
      setLoading(true);

      const data = await getTecnicos.execute();

      setTecnicos(data);
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

  const filteredTecnicos = tecnicos.filter((tecnico) => {
    const empresa = normalizeText(tecnico.empresa ?? "");
    const nombre = normalizeText(tecnico.nombre ?? "");
    const search = normalizeText(searchText);

    return empresa.includes(search) || nombre.includes(search);
  });

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

        <Text style={styles.title}>
          Técnicos Externos
        </Text>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="#777"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por empresa o técnico"
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

        {filteredTecnicos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-hard-hat"
              size={70}
              color="#C5C5C5"
            />

            <Text style={styles.emptyTitle}>
              No se encontraron técnicos
            </Text>

            <Text style={styles.emptyText}>
              Intenta buscar con otro nombre o empresa.
            </Text>
          </View>
        ) : (
          <TecnicoExternoList
            tecnicos={filteredTecnicos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/createproveedor")}
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
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111827",
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