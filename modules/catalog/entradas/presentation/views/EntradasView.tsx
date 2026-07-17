import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useRouter,
} from "expo-router";
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

import { DeleteEntradaUseCase } from "../../application/deleteEntrada";
import { GetEntradasUseCase } from "../../application/getEntradas";
import { Entrada } from "../../domain/entrada";
import { EntradaDataSource } from "../../infrastructure/entradaDataSource";
import EntradaList from "../components/EntradaList";

const entradaRepository = new EntradaDataSource();

const getEntradas =
  new GetEntradasUseCase(entradaRepository);

const deleteEntrada =
  new DeleteEntradaUseCase(entradaRepository);

export default function EntradasView() {
  const router = useRouter();

  const [entradas, setEntradas] =
    useState<Entrada[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getEntradas.execute();

      setEntradas(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ??
        "No se pudieron cargar las entradas"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const crearEntrada = () => {
    router.push("/entradaCreate" as any);
  };

  const editarEntrada = (entrada: Entrada) => {
    router.push({
      pathname: "/editEntrada",
      params: {
        idEntrada: String(entrada.idEntrada),
      },
    });
  };

  const eliminarEntrada = (
    idEntrada: string
  ) => {
    Alert.alert(
      "Eliminar entrada",
      "¿Deseas eliminar esta entrada? La base de datos restará esta cantidad del stock del material.",
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
              await deleteEntrada.execute(
                idEntrada
              );

              Alert.alert(
                "Éxito",
                "Entrada eliminada correctamente"
              );

              await loadData();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message ??
                "No se pudo eliminar la entrada"
              );
            }
          },
        },
      ]
    );
  };

  const entradasFiltradas = entradas.filter(
    (entrada) => {
      const search = normalizeText(searchText);

      if (!search) {
        return true;
      }

      const material = normalizeText(
        entrada.nombreMaterial ?? ""
      );

      const tecnico = normalizeText(
        entrada.nombreTecnicoExterno ?? ""
      );

      const observacion = normalizeText(
        entrada.observaciones ?? ""
      );

      const codigo = String(
        entrada.numMaterial ?? ""
      );

      return (
        material.includes(search) ||
        tecnico.includes(search) ||
        observacion.includes(search) ||
        codigo.includes(search)
      );
    }
  );

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#148248"
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
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
          Entradas de material
        </Text>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="#777777"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar entrada"
            placeholderTextColor="#888888"
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={22}
                color="#777777"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listContainer}>
          <EntradaList
            entradas={entradasFiltradas}
            onEdit={editarEntrada}
            onDelete={eliminarEntrada}
            resetKey={`${searchText}-${entradasFiltradas.length}`}
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={crearEntrada}
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },

  header: {
    width: "100%",
    height: 100,
    paddingTop: 35,
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
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

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111827",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 15,
    height: 52,
    borderRadius: 14,
    elevation: 3,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
  },

  listContainer: {
    flex: 1,
  },

  createButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: "#67B346",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  fabText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
  },
});