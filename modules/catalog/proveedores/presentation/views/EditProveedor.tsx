import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { EditTecnicoExternoUseCase } from "../../application/editProveedor";
import { GetTecnicoExternoByIdUseCase } from "../../application/getProvedor";
import { TecnicoExterno } from "../../domain/proveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoForm from "../components/proveedorForm";

export default function EditTecnicoExternoView() {
  const router = useRouter();

  const { id } = useLocalSearchParams();

  const { width, height } =
    useWindowDimensions();

  const repository = useMemo(
    () => new TecnicoExternoDataSource(),
    []
  );

  const getTecnicoUseCase = useMemo(
    () =>
      new GetTecnicoExternoByIdUseCase(
        repository
      ),
    [repository]
  );

  const editTecnicoUseCase = useMemo(
    () =>
      new EditTecnicoExternoUseCase(
        repository
      ),
    [repository]
  );

  const [tecnico, setTecnico] =
    useState<TecnicoExterno | null>(null);

  const [loading, setLoading] =
    useState(true);

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding = isTablet
    ? 32
    : isSmallScreen
      ? 12
      : 14;

  const cardWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 680 : 520
  );

  const cardPadding = isSmallScreen
    ? 14
    : isTablet
      ? 24
      : 18;

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

  const backButtonTop =
    (headerHeight - 42) / 2;

  useEffect(() => {
    const loadTecnico = async () => {
      try {
        setLoading(true);

        const currentId = Array.isArray(id)
          ? id[0]
          : id;

        const data =
          await getTecnicoUseCase.execute(
            Number(currentId)
          );

        if (!data) {
          Alert.alert(
            "Error",
            "Técnico externo no encontrado",
            [
              {
                text: "Aceptar",
                onPress: () =>
                  router.back(),
              },
            ]
          );

          return;
        }

        setTecnico(data);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar el técnico externo";

        Alert.alert("Error", message);
      } finally {
        setLoading(false);
      }
    };

    loadTecnico();
  }, [id, getTecnicoUseCase, router]);

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

      Alert.alert(
        "Éxito",
        "Técnico actualizado correctamente"
      );

      router.back();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el técnico externo";

      Alert.alert("Error", message);
    }
  };

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
                  top: backButtonTop,
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

          {/* Decoraciones de fondo */}
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

          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingHorizontal:
                    horizontalPadding,
                  paddingTop: isSmallScreen
                    ? 14
                    : 22,
                  paddingBottom: isSmallScreen
                    ? 20
                    : 32,
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    padding: cardPadding,
                  },
                ]}
              >
                {/* Título de la tarjeta */}
                <View
                  style={styles.titleContainer}
                >
                  <View
                    style={[
                      styles.titleIconContainer,
                      isSmallScreen &&
                        styles.titleIconContainerSmall,
                    ]}
                  >
                     <MaterialCommunityIcons
                    name="account-hard-hat-outline"
                    size={
                      isSmallScreen ? 30 : 36
                    }
                    color="#148248"
                  />
                  </View>

                  <Text
                    style={[
                      styles.title,
                      {
                        fontSize:
                          isSmallScreen
                            ? 19
                            : isTablet
                              ? 24
                              : 21,
                      },
                    ]}
                  >
                    Editar técnico externo
                  </Text>

                  <Text
                    style={styles.subtitle}
                  >
                    Actualiza la información del
                    técnico
                  </Text>
     
                </View>

                {/* Cargando */}
                {loading && (
                  <View
                    style={
                      styles.loadingContainer
                    }
                  >
                    <ActivityIndicator
                      size="large"
                      color="#148248"
                    />

                    <Text
                      style={styles.loadingText}
                    >
                      Cargando información...
                    </Text>
                  </View>
                )}

                {/* Formulario */}
                {!loading && tecnico && (
                  <View
                    style={
                      styles.formContainer
                    }
                  >
                    <TecnicoExternoForm
                      initialNumTecnicoExterno={tecnico.numTecnicoExterno.toString()}
                      showNumero
                      initialNombre={
                        tecnico.nombre
                      }
                      initialEmpresa={
                        tecnico.empresa ?? ""
                      }
                      initialTelefono={
                        tecnico.telefono ?? ""
                      }
                      initialEspecialidad={
                        tecnico.especialidad ??
                        ""
                      }
                      onSubmit={
                        handleUpdate
                      }
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
    position: "relative",
    backgroundColor: "#F3F5F4",
  },

  keyboardView: {
    flex: 1,
    zIndex: 2,
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },

  header: {
    width: "100%",
    position: "relative",
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
    zIndex: 3,

    shadowColor: "#148248",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 7,
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
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.15)",
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

  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 22,
    zIndex: 2,

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  titleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  titleIconContainer: {
    width: 66,
    height: 66,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginBottom: 10,

    shadowColor: "#148248",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

  titleIconContainerSmall: {
    width: 58,
    height: 58,
    borderRadius: 17,
    marginBottom: 8,
  },

  title: {
    width: "100%",
    color: "#1F2937",
    fontWeight: "800",
    lineHeight: 29,
    textAlign: "center",
  },

  subtitle: {
    width: "100%",
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 3,
  },
  formContainer: {
    width: "100%",
  },

  loadingContainer: {
    width: "100%",
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
});