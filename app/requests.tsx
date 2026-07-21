import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import RequestsAssigned from "@/modules/requests/presentation/views/RequestAsigned";
import RequestsCompleted from "@/modules/requests/presentation/views/RequestCompleted";
import RequestsInProgress from "@/modules/requests/presentation/views/RequestProgress";
import RequestsReceived from "@/modules/requests/presentation/views/RequestReceived";
import RequestsRejected from "@/modules/requests/presentation/views/RequestRejected";
import RequestsSent from "@/modules/requests/presentation/views/RequestSent";
import { ModalMenu } from "@/modules/user/presentation/components/modalMenu";

export default function Requests() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] =
    useState("enviadas");

  const [modalOpen, setModalOpen] =
    useState(false);

  /*
   * Valores utilizados únicamente para
   * adaptar la interfaz.
   */
  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding =
    isTablet ? 32 : 16;

  const contentWidth = Math.max(
    280,
    Math.min(
      width - horizontalPadding * 2,
      isTablet ? 1000 : 720
    )
  );

  const headerHeight = isLandscape
    ? 110
    : isSmallScreen
      ? 120
      : isTablet
        ? 160
        : 138;

  const logoWidth = Math.min(
    width *
      (isTablet
        ? 0.42
        : isSmallScreen
          ? 0.55
          : 0.62),
    isTablet ? 320 : 270
  );

  const logoHeight = isTablet ? 88 : 72;

  const floatingButtonSize =
    isTablet ? 66 : 58;

  const floatingButtonRight = Math.max(
    18,
    (width - contentWidth) / 2 + 8
  );

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData =
      await AsyncStorage.getItem("user");

    if (!userData) return;

    const parsedUser = JSON.parse(userData);

    setUser(parsedUser);

    if (parsedUser.numRol === 1) {
      setActiveTab("recibidas");
    } else if (parsedUser.numRol === 2) {
      setActiveTab("enviadas");
    } else if (parsedUser.numRol === 3) {
      setActiveTab("asignadas");
    }
  };

  if (!user) return null;

  const isAdmin = user.numRol === 1;
  const isSolicitante = user.numRol === 2;
  const isTecnico = user.numRol === 3;

  const renderContent = () => {
    switch (activeTab) {
      case "recibidas":
        return <RequestsReceived />;

      case "enviadas":
        return <RequestsSent />;

      case "asignadas":
        return <RequestsAssigned />;

      case "proceso":
        return <RequestsInProgress />;

      case "completadas":
        return <RequestsCompleted />;

      case "rechazadas":
        return <RequestsRejected />;

      default:
        return null;
    }
  };

  const renderTab = (
    key: string,
    label: string
  ) => {
    const isActive = activeTab === key;

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.tabButton,
          isActive && styles.activeTab,
          isTablet && styles.tabButtonTablet,
        ]}
        onPress={() => setActiveTab(key)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{
          selected: isActive,
        }}
      >
        <Text
          style={[
            styles.tabText,
            isActive && styles.activeTabText,
            isTablet && styles.tabTextTablet,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
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

          <View style={styles.headerRow}>
            <Image
              source={require("../assets/images/ZUCARMEX.png")}
              style={{
                width: logoWidth,
                height: logoHeight,
              }}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={[
                styles.menuButton,
                isTablet &&
                  styles.menuButtonTablet,
              ]}
              onPress={() =>
                setModalOpen(true)
              }
              activeOpacity={0.75}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              accessibilityLabel="Abrir menú"
            >
              <Feather
                name="menu"
                size={27}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cuerpo */}
        <View
          style={[
            styles.body,
            {
              width: contentWidth,
            },
          ]}
        >

          {/* Pestañas */}
          <View style={styles.tabsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.tabs
              }
              keyboardShouldPersistTaps="handled"
            >
              {isAdmin && (
                <>
                  {renderTab(
                    "recibidas",
                    "Recibidas"
                  )}

                  {renderTab(
                    "proceso",
                    "En proceso"
                  )}

                  {renderTab(
                    "completadas",
                    "Completadas"
                  )}

                  {renderTab(
                    "rechazadas",
                    "Rechazadas"
                  )}
                </>
              )}

              {isSolicitante && (
                <>
                  {renderTab(
                    "enviadas",
                    "Enviadas"
                  )}

                  {renderTab(
                    "proceso",
                    "En proceso"
                  )}

                  {renderTab(
                    "completadas",
                    "Completadas"
                  )}

                  {renderTab(
                    "rechazadas",
                    "Rechazadas"
                  )}
                </>
              )}

              {isTecnico && (
                <>
                  {renderTab(
                    "asignadas",
                    "Asignadas"
                  )}

                  {renderTab(
                    "proceso",
                    "En proceso"
                  )}

                  {renderTab(
                    "completadas",
                    "Completadas"
                  )}
                </>
              )}
            </ScrollView>
          </View>
         
          {/* Contenido de la pestaña */}
          <View style={styles.content}>
            {renderContent()}
          </View>
        </View>


        {/* Menú */}
        <ModalMenu
          visible={modalOpen}
          onClose={() =>
            setModalOpen(false)
          }
          user={user}
          setUser={setUser}
          onUpdate={() => {}}
        />

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
                ? 54
                : 62,
            },
          ]}
          onPress={() =>
            router.push("/createRequest")
          }
          activeOpacity={0.85}
          accessibilityLabel="Crear solicitud"
        >
          <Feather
            name="plus"
            size={isTablet ? 34 : 30}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
  },

  header: {
    width: "100%",
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#148248",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",

    ...Platform.select({
      android: {
        elevation: 6,
      },
      ios: {
        shadowColor: "#148248",
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: {
          width: 0,
          height: 5,
        },
      },
    }),
  },

  headerDecorationOne: {
    position: "absolute",
    top: -55,
    right: -30,
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor:
      "rgba(255,255,255,0.07)",
  },

  headerDecorationTwo: {
    position: "absolute",
    bottom: -48,
    left: -28,
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  headerRow: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },

  menuButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.17)",
  },

  menuButtonTablet: {
    right: 28,
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  body: {
    flex: 1,
    alignSelf: "center",
    minHeight: 0,
  },

  titleSection: {
    width: "100%",
    minHeight: 130,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 13,
  },


  titleSectionSmall: {
    paddingTop: 13,
    paddingBottom: 10,
  },

  titleIconBox: {
    width: 54,
    height: 54,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginBottom: 10,
    flexShrink: 0,
  },

  titleIconBoxTablet: {
    width: 62,
    height: 62,
    borderRadius: 19,
  },
  titleTextContainer: {
    width: "100%",
    alignItems: "center",
  },

  title: {
    width: "100%",
    color: "#26322C",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "800",
    textAlign: "center",
  },

  titleTablet: {
    fontSize: 25,
    lineHeight: 30,
  },

  subtitle: {
    width: "100%",
    maxWidth: 540,
    color: "#727C76",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
    textAlign: "center",
  },

  tabsSection: {
    width: "100%",
    minHeight: 61,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 17,
    marginBottom: 12,

    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  tabs: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },

  tabButton: {
    minHeight: 43,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7F5",
    borderWidth: 1,
    borderColor: "#E4E9E6",
    borderRadius: 22,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginRight: 8,
  },

  tabButtonTablet: {
    minHeight: 46,
    paddingHorizontal: 15,
  },

  activeTab: {
    backgroundColor: "#148248",
    borderColor: "#148248",

    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#148248",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  tabText: {
    color: "#69736E",
    fontSize: 13,
    fontWeight: "700",
  },

  tabTextTablet: {
    fontSize: 14,
  },

  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  content: {
    flex: 1,
    width: "100%",
    minHeight: 0,
  },

  createButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#67B346",
    borderWidth: 4,
    borderColor: "#E2F1DC",

    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: "#234D14",
        shadowOpacity: 0.28,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 4,
        },
      },
    }),
  },
});