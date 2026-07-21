import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { DeleteTecnicoExternoUseCase } from "../../application/deleteProveedor";
import { GetTecnicosExternosUseCase } from "../../application/getProveedores";
import { TecnicoExterno } from "../../domain/proveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoList from "../components/proveedorList";

export default function TecnicosExternosView() {
  const router = useRouter();

  const { width, height } =
    useWindowDimensions();

  const repository =
    new TecnicoExternoDataSource();

  const getTecnicos =
    new GetTecnicosExternosUseCase(
      repository
    );

  const deleteTecnico =
    new DeleteTecnicoExternoUseCase(
      repository
    );

  const [tecnicos, setTecnicos] =
    useState<TecnicoExterno[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchText, setSearchText] =
    useState("");

  /*
   * Valores responsivos
   */
  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding =
    isTablet ? 32 : 16;

  const contentWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 900 : 620
  );

  const headerHeight = isLandscape
    ? 110
    : isSmallScreen
      ? 120
      : isTablet
        ? 155
        : 135;

  const logoWidth = Math.min(
    width *
      (isTablet
        ? 0.4
        : isSmallScreen
          ? 0.58
          : 0.64),
    isTablet ? 320 : 280
  );

  const logoHeight = isLandscape
    ? 62
    : isSmallScreen
      ? 66
      : isTablet
        ? 86
        : 76;

  const fabSize = isSmallScreen
    ? 54
    : isTablet
      ? 66
      : 60;

  useFocusEffect(
    useCallback(() => {
      loadTecnicos();
    }, [])
  );

  const loadTecnicos = async () => {
    try {
      setLoading(true);

      const data =
        await getTecnicos.execute();

      setTecnicos(data);
    } finally {
      setLoading(false);
    }
  };

  const normalizeText = (
    text: string
  ) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const filteredTecnicos =
    tecnicos.filter((tecnico) => {
      const empresa = normalizeText(
        tecnico.empresa ?? ""
      );

      const nombre = normalizeText(
        tecnico.nombre ?? ""
      );

      const search =
        normalizeText(searchText);

      return (
        empresa.includes(search) ||
        nombre.includes(search)
      );
    });

  const handleEdit = (id: number) => {
    router.push({
      pathname: "/editproveedor",
      params: {
        id: id.toString(),
      },
    });
  };

  const handleDelete = async (
    id: number
  ) => {
    try {
      await deleteTecnico.execute(id);

      loadTecnicos();
    } catch (error: any) {
      alert(error.message);
    }
  };

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
          backgroundColor="#F3F5F4"
        />

        <SafeAreaView style={styles.center}>
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color="#148248"
            />

            <Text style={styles.loadingText}>
              Cargando técnicos...
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
          <View
            style={[
              styles.header,
              {
                height: headerHeight,
              },
            ]}
          >
            <View
              style={
                styles.headerDecorationOne
              }
            />

            <View
              style={
                styles.headerDecorationTwo
              }
            />

            <TouchableOpacity
              style={[
                styles.backBtn,
                {
                  top: isLandscape
                    ? 8
                    : isTablet
                      ? 21
                      : 14,
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
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={27}
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

          <View
            pointerEvents="none"
            style={
              styles.backgroundCircleLeft
            }
          />

          <View
            pointerEvents="none"
            style={
              styles.backgroundCircleRight
            }
          />

          <View
            style={[
              styles.content,
              {
                width: contentWidth,
                paddingTop: isSmallScreen
                  ? 16
                  : 22,
                paddingBottom: isSmallScreen
                  ? 12
                  : 18,
              },
            ]}
          >
            <View
              style={
                styles.titleContainer
              }
            >
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: isSmallScreen
                      ? 21
                      : isTablet
                        ? 28
                        : 24,
                  },
                ]}
              >
                Técnicos externos
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    fontSize: isSmallScreen
                      ? 12
                      : 14,
                  },
                ]}
              >
                Consulta y administra los
                técnicos registrados
              </Text>
            </View>

            <View
              style={[
                styles.searchContainer,
                {
                  minHeight: isSmallScreen
                    ? 48
                    : 54,
                  marginTop: isSmallScreen
                    ? 14
                    : 19,
                  marginBottom:
                    isSmallScreen
                      ? 12
                      : 16,
                },
              ]}
            >
            
                <MaterialCommunityIcons
                  name="magnify"
                  size={
                    isSmallScreen ? 20 : 22
                  }
                  color="#949493"
                />

              <TextInput
                style={[
                  styles.searchInput,
                  {
                    fontSize: isSmallScreen
                      ? 13
                      : 15,
                  },
                ]}
                placeholder="Buscar por empresa o técnico"
                placeholderTextColor="#8B9490"
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                autoCapitalize="none"
              />

              {searchText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() =>
                    setSearchText("")
                  }
                  activeOpacity={0.75}
                  hitSlop={{
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.listContainer}>
              {filteredTecnicos.length ===
              0 ? (
                <View
                  style={styles.emptyContainer}
                >
                  <View
                    style={
                      styles.emptyIconContainer
                    }
                  >
                    <MaterialCommunityIcons
                      name="account-hard-hat"
                      size={
                        isSmallScreen ? 48 : 62
                      }
                      color="#78AE62"
                    />
                  </View>

                  <Text
                    style={[
                      styles.emptyTitle,
                      {
                        fontSize: isSmallScreen
                          ? 16
                          : 19,
                      },
                    ]}
                  >
                    No se encontraron técnicos
                  </Text>

                  <Text
                    style={[
                      styles.emptyText,
                      {
                        fontSize: isSmallScreen
                          ? 12
                          : 14,
                      },
                    ]}
                  >
                    Intenta buscar con otro
                    nombre o empresa.
                  </Text>
                </View>
              ) : (
                <TecnicoExternoList
                  tecnicos={
                    filteredTecnicos
                  }
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  resetKey={`${searchText}-${filteredTecnicos.length}`}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              {
                width: fabSize,
                height: fabSize,
                borderRadius:
                  fabSize / 2,
                right: isTablet ? 32 : 20,
                bottom: isSmallScreen
                  ? 20
                  : 28,
              },
            ]}
            onPress={() =>
              router.push(
                "/createproveedor"
              )
            }
            activeOpacity={0.82}
          >
            <MaterialCommunityIcons
              name="plus"
              size={
                isSmallScreen ? 28 : 32
              }
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
    backgroundColor: "#F3F5F4",
  },

  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F3F5F4",
    position: "relative",
    overflow: "hidden",
  },

  header: {
    width: "100%",
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
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
    left: 13,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.12)",
    zIndex: 10,
  },

  headerDecorationOne: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor:
      "rgba(255,255,255,0.07)",
    top: -50,
    right: -28,
  },

  headerDecorationTwo: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    bottom: -40,
    left: -22,
  },

  backgroundCircleLeft: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor:
      "rgba(20,130,72,0.035)",
    left: -170,
    top: 250,
  },

  backgroundCircleRight: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor:
      "rgba(20,130,72,0.035)",
    right: -190,
    bottom: -130,
  },

  content: {
    flex: 1,
    alignSelf: "center",
    zIndex: 2,
  },

  titleContainer: {
    width: "100%",
    alignItems: "center",
  },

  title: {
    color: "#111827",
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 33,
  },

  subtitle: {
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 3,
  },

  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5E3",
    paddingHorizontal: 10,
    borderRadius: 15,

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  searchIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDF5EA",
    marginRight: 8,
    flexShrink: 0,
  },

  searchIconContainerSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    color: "#1F2937",
    paddingVertical: 8,
  },

  clearButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  resultsRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 9,
    paddingHorizontal: 3,
  },

  resultsText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "600",
  },

  listContainer: {
    flex: 1,
    width: "100%",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 80,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDF5EA",
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#374151",
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },

  createButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#67B346",
    zIndex: 20,

    shadowColor: "#2F6B25",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F5F4",
    padding: 20,
  },

  loadingCard: {
    minWidth: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 34,
    paddingVertical: 28,

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 4,
  },

  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
});