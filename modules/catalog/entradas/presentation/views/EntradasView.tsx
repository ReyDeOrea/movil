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
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
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
  const { width, height } = useWindowDimensions();

  const [entradas, setEntradas] =
    useState<Entrada[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  /*
   * Valores utilizados únicamente para
   * adaptar la interfaz.
   */
  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding = isTablet ? 32 : 16;

  const contentWidth = Math.max(
    280,
    Math.min(
      width - horizontalPadding * 2,
      isTablet ? 900 : 680
    )
  );

  const headerHeight = isLandscape
    ? 120
    : isSmallScreen
      ? 130
      : isTablet
        ? 170
        : 145;

  const logoWidth = Math.min(
    width *
      (isTablet
        ? 0.44
        : isSmallScreen
          ? 0.62
          : 0.68),
    isTablet ? 340 : 300
  );

  const logoHeight = isLandscape
    ? 68
    : isSmallScreen
      ? 72
      : isTablet
        ? 94
        : 84;

  const floatingButtonSize =
    isTablet ? 64 : 58;

  const floatingButtonRight = Math.max(
    18,
    (width - contentWidth) / 2 + 8
  );

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
          options={{
            headerShown: false,
          }}
        />

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F1F5F3"
        />

        <SafeAreaView style={styles.center}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIcon}>
              <MaterialCommunityIcons
                name="tray-arrow-down"
                size={43}
                color="#148248"
              />
            </View>

            <ActivityIndicator
              size="large"
              color="#148248"
            />

            <Text style={styles.loadingTitle}>
              Cargando entradas
            </Text>

            <Text style={styles.loadingText}>
              Estamos obteniendo los movimientos de
              materiales.
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <StatusBar
        barStyle="light-content"
        backgroundColor="#148248"
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Encabezado */}
          <View
            style={[
              styles.header,
              {
                height: headerHeight,
              },
            ]}
          >
            <View
              style={styles.headerDecorationOne}
            />

            <View
              style={styles.headerDecorationTwo}
            />

            <TouchableOpacity
              style={[
                styles.backBtn,
                {
                  top: isLandscape
                    ? 10
                    : isTablet
                      ? 24
                      : 17,
                },
              ]}
              onPress={() => router.back()}
              activeOpacity={0.75}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              accessibilityLabel="Regresar"
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
                style={{
                  width: logoWidth,
                  height: logoHeight,
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Título */}
          <View
            style={[
              styles.titleSection,
              {
                width: contentWidth,
                paddingTop: isSmallScreen
                  ? 14
                  : 18,
              },
            ]}
          >
            <View style={styles.titleTextContainer}>
              <Text
                style={[
                  styles.title,
                  isTablet && styles.titleTablet,
                ]}
              >
                Entradas de material y herramientas
              </Text>

              <Text style={styles.subtitle}>
                Consulta y administra los movimientos
                de entrada
              </Text>
            </View>
          </View>

          {/* Buscador */}
          <View
            style={[
              styles.toolbar,
              {
                width: contentWidth,
              },
            ]}
          >
            <View
              style={[
                styles.searchContainer,
                isSmallScreen &&
                  styles.searchContainerSmall,
              ]}
            >
              <View style={styles.searchIconBox}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={22}
                  color="#148248"
                />
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder={
                  isSmallScreen
                    ? "Buscar entrada"
                    : "Buscar por material, técnico, número o comentario"
                }
                placeholderTextColor="#8A919C"
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                returnKeyType="search"
              />

              {searchText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() =>
                    setSearchText("")
                  }
                  activeOpacity={0.7}
                  hitSlop={{
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8,
                  }}
                  accessibilityLabel="Limpiar búsqueda"
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Lista o estado vacío */}
          {entradasFiltradas.length === 0 ? (
            <View
              style={[
                styles.emptyContainer,
                {
                  width: contentWidth,
                },
              ]}
            >
              <View style={styles.emptyIconBox}>
                <MaterialCommunityIcons
                  name={
                    searchText.trim().length > 0
                      ? "magnify-close"
                      : "tray-arrow-down"
                  }
                  size={58}
                  color="#148248"
                />
              </View>

              <Text style={styles.emptyTitle}>
                {searchText.trim().length > 0
                  ? "No se encontraron entradas"
                  : "No hay entradas registradas"}
              </Text>

              <Text style={styles.emptyText}>
                {searchText.trim().length > 0
                  ? "Intenta buscar con otro material, técnico, código u observación."
                  : "Presiona el botón + para registrar la primera entrada de material."}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.listContainer,
                {
                  width: contentWidth,
                },
              ]}
            >
              <EntradaList
                entradas={entradasFiltradas}
                onEdit={editarEntrada}
                onDelete={eliminarEntrada}
                resetKey={`${searchText}-${entradasFiltradas.length}`}
              />
            </View>
          )}

          {/* Botón flotante */}
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                width: floatingButtonSize,
                height: floatingButtonSize,
                borderRadius:
                  floatingButtonSize / 2,
                right: floatingButtonRight,
                bottom: isSmallScreen
                  ? 18
                  : 28,
              },
            ]}
            onPress={crearEntrada}
            activeOpacity={0.85}
            accessibilityLabel="Crear entrada"
          >
            <MaterialCommunityIcons
              name="plus"
              size={isTablet ? 35 : 31}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
  },

  header: {
    width: "100%",
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",

    shadowColor: "#148248",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 6,
  },

  rowHeader: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  backBtn: {
    position: "absolute",
    left: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.16)",
    zIndex: 10,
  },

  headerDecorationOne: {
    position: "absolute",
    top: -55,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor:
      "rgba(255,255,255,0.07)",
  },

  headerDecorationTwo: {
    position: "absolute",
    bottom: -45,
    left: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },
titleSection: {
  alignSelf: "center",
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: 14,
},

  titleIconBox: {
    width: 51,
    height: 51,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 12,
    flexShrink: 0,
  },
titleTextContainer: {
  width: "100%",
  alignItems: "center",
},
title: {
  color: "#26322C",
  fontSize: 20,
  lineHeight: 25,
  fontWeight: "800",
  textAlign: "center",
},
  titleTablet: {
    fontSize: 24,
    lineHeight: 29,
  },

  subtitle: {
    color: "#727C76",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  toolbar: {
    alignSelf: "center",
  },

  searchContainer: {
    width: "100%",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 15,
    paddingHorizontal: 11,

    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.09,
        shadowRadius: 6,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  searchContainerSmall: {
    minHeight: 52,
  },

  searchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    color: "#1F2937",
    fontSize: 15,
    paddingVertical: 8,
  },

  clearButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },

  resultsRow: {
    minHeight: 47,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 3,
    marginTop: 7,
  },

  resultsInformation: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  resultsIconBox: {
    width: 31,
    height: 31,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 8,
  },

  resultsText: {
    flex: 1,
    color: "#5E6863",
    fontSize: 13,
    fontWeight: "600",
  },

  searchBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginLeft: 8,
  },

  searchBadgeText: {
    color: "#148248",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },

  listContainer: {
    flex: 1,
    alignSelf: "center",
    minHeight: 0,
  },

  emptyContainer: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 80,
  },

  emptyIconBox: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginBottom: 18,
  },

  emptyTitle: {
    color: "#374151",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 400,
    color: "#737B87",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 7,
  },

  clearSearchButton: {
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8F4",
    borderWidth: 1,
    borderColor: "#D6EADF",
    borderRadius: 13,
    paddingHorizontal: 16,
    marginTop: 18,
  },

  clearSearchButtonText: {
    color: "#148248",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },

  createButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#67B346",

    ...Platform.select({
      android: {
        elevation: 7,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.24,
        shadowRadius: 7,
        shadowOffset: {
          width: 0,
          height: 4,
        },
      },
    }),
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
    padding: 20,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 340,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 34,
    paddingVertical: 30,

    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.1,
        shadowRadius: 9,
        shadowOffset: {
          width: 0,
          height: 4,
        },
      },
    }),
  },

  loadingIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginBottom: 16,
  },

  loadingTitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 13,
  },

  loadingText: {
    color: "#737B87",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },
});