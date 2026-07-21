import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Stack,
  useRouter,
} from "expo-router";
import {
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

export default function CatalogosView() {
  const router = useRouter();

  const { width, height } =
    useWindowDimensions();

  const catalogos = [
    {
      titulo: "Materiales",
      icono: "hammer",
      ruta: "/materials",
    },
    {
      titulo: "Entradas",
      icono: "inbox-arrow-down",
      ruta: "/entradas",
    },
    {
      titulo: "Proveedores",
      icono: "truck",
      ruta: "/proveedor",
    },
    {
      titulo: "Cuentas",
      icono: "account-group",
      ruta: "/user",
    },

    // {
    //   titulo: "Mantenimiento",
    //   icono: "cog",
    //   ruta: "/maintenance",
    // },
  ];

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding =
    isTablet ? 32 : 16;

  const contentWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 760 : 560
  );

  const cardsGap = isSmallScreen
    ? 10
    : isTablet
      ? 18
      : 14;

  const cardWidth =
    (contentWidth - cardsGap) / 2;

  const cardHeight = isSmallScreen
    ? 122
    : isTablet
      ? 175
      : 145;

  /*
   * Mismas medidas responsivas
   * del banner de las demás pantallas.
   */
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

  const iconSize = isSmallScreen
    ? 43
    : isTablet
      ? 64
      : 53;

  const iconContainerSize = isSmallScreen
    ? 64
    : isTablet
      ? 88
      : 76;

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
        <ScrollView
          style={styles.screen}
          contentContainerStyle={[
            styles.container,
            {
              minHeight: height,
              paddingBottom: isSmallScreen
                ? 24
                : 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
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
                source={require("../../assets/images/ZUCARMEX.png")}
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
            style={styles.backgroundCircleLeft}
          />

          <View
            pointerEvents="none"
            style={styles.backgroundCircleRight}
          />

          <View
            style={[
              styles.titleContainer,
              {
                width: contentWidth,
                marginTop: isSmallScreen
                  ? 18
                  : 25,
                marginBottom: isSmallScreen
                  ? 17
                  : 23,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  fontSize: isSmallScreen
                    ? 22
                    : isTablet
                      ? 29
                      : 25,
                },
              ]}
            >
              Catálogos
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
              Selecciona el catálogo que deseas
              consultar
            </Text>
          </View>

          <View
            style={[
              styles.grid,
              {
                width: contentWidth,
                columnGap: cardsGap,
                rowGap: cardsGap,
              },
            ]}
          >
            {catalogos.map((item) => (
              <TouchableOpacity
                key={item.titulo}
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    minHeight: cardHeight,
                    paddingHorizontal:
                      isSmallScreen ? 8 : 14,
                    paddingVertical:
                      isSmallScreen ? 14 : 20,
                  },
                ]}
                onPress={() =>
                  router.push(item.ruta as any)
                }
                activeOpacity={0.82}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      width: iconContainerSize,
                      height: iconContainerSize,
                      borderRadius: isSmallScreen
                        ? 19
                        : isTablet
                          ? 25
                          : 22,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icono as any}
                    size={iconSize}
                    color="#78AE62"
                  />
                </View>

                <Text
                  style={[
                    styles.cardText,
                    {
                      fontSize: isSmallScreen
                        ? 14
                        : isTablet
                          ? 19
                          : 16,
                    },
                  ]}
                >
                  {item.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F5F4",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F3F5F4",
  },

  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#F3F5F4",
    position: "relative",
    overflow: "hidden",
  },

  /*
   * Banner con el mismo estilo
   * de las demás pantallas.
   */
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
    left: -160,
    top: 230,
  },

  backgroundCircleRight: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor:
      "rgba(20,130,72,0.035)",
    right: -190,
    bottom: -120,
  },

  titleContainer: {
    alignSelf: "center",
    alignItems: "center",
    zIndex: 2,
  },

  title: {
    color: "#111827",
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 34,
  },

  subtitle: {
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
    zIndex: 2,
  },

  card: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDF5EA",
  },

  cardText: {
    color: "#111827",
    fontWeight: "800",
    textAlign: "center",
    marginTop: 13,
  },
});