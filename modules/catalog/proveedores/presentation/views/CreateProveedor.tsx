import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useRouter,
} from "expo-router";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { CreateTecnicoExternoUseCase } from "../../application/createProveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoForm from "../components/proveedorForm";

export default function CreateTecnicoExternoView() {
  const router = useRouter();

  const { width, height } =
    useWindowDimensions();

  const repository =
    new TecnicoExternoDataSource();

  const createTecnico =
    new CreateTecnicoExternoUseCase(
      repository
    );

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding =
    isTablet ? 32 : 14;

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

  const handleCreate = async (
    numTecnicoExterno: number,
    nombre: string,
    empresa: string,
    telefono: string,
    especialidad: string
  ) => {
    try {
      await createTecnico.execute({
        numTecnicoExterno,
        nombre,
        empresa,
        telefono,
        especialidad,
      });

      Alert.alert(
        "Éxito",
        "Técnico creado"
      );

      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message
      );
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
                      fontSize: isSmallScreen
                        ? 19
                        : isTablet
                          ? 24
                          : 21,
                    },
                  ]}
                >
                  Crear técnico externo
                </Text>

                <Text style={styles.subtitle}>
                  Ingresa la información del
                  nuevo técnico
                </Text>
              </View>

              <View
                style={styles.formContainer}
              >
                <TecnicoExternoForm
                  onSubmit={handleCreate}
                />
              </View>
            </View>
          </ScrollView>
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

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },

  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 22,

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  header: {
    width: "100%",
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
    zIndex: 2,
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
});