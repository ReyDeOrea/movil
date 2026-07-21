import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { GetUserByIdUseCase } from "../../application/getUserByid";
import { User } from "../../domain/user";
import { ApiFastUserRepository } from "../../infraestructure/userDataSource";
import AvatarView from "../components/AvatarView";

import { ApiFastRequestsRepository } from "../../../requests/infraestructure/requestsDatasurce";

const userRepository =
  new ApiFastUserRepository();

const getUser =
  new GetUserByIdUseCase(userRepository);

const requestsRepository: any =
  new ApiFastRequestsRepository();

export default function UserDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { width, height } = useWindowDimensions();

  const [user, setUser] =
    useState<User | null>(null);

  const [requests, setRequests] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [requestsLoading, setRequestsLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * Medidas responsivas.
   *
   * La división siempre se conserva:
   * izquierda = cuenta
   * derecha = solicitudes
   */
  const isVerySmallScreen = width < 360;
  const isSmallScreen = width < 500;
  const isTablet = width >= 700;
  const isLandscape = width > height;

  const contentPadding = isVerySmallScreen
    ? 6
    : isSmallScreen
      ? 8
      : isTablet
        ? 24
        : 14;

  const columnsGap = isVerySmallScreen
    ? 6
    : isSmallScreen
      ? 8
      : 14;

  const cardPadding = isVerySmallScreen
    ? 8
    : isSmallScreen
      ? 10
      : isTablet
        ? 22
        : 16;

  const headerHeight = isLandscape
    ? 112
    : isVerySmallScreen
      ? 120
      : isSmallScreen
        ? 130
        : isTablet
          ? 165
          : 142;

  const logoWidth = Math.min(
    width *
      (isTablet
        ? 0.42
        : isVerySmallScreen
          ? 0.58
          : 0.65),
    isTablet ? 340 : 290
  );

  const logoHeight = isLandscape
    ? 65
    : isVerySmallScreen
      ? 64
      : isSmallScreen
        ? 72
        : isTablet
          ? 92
          : 80;

  const avatarSize = isVerySmallScreen
    ? 58
    : isSmallScreen
      ? 70
      : isTablet
        ? 125
        : 100;

  const titleSize = isVerySmallScreen
    ? 13
    : isSmallScreen
      ? 15
      : isTablet
        ? 21
        : 18;

  const labelSize = isVerySmallScreen
    ? 9
    : isSmallScreen
      ? 10
      : 12;

  const valueSize = isVerySmallScreen
    ? 11
    : isSmallScreen
      ? 12
      : 15;

  const requestTextSize = isVerySmallScreen
    ? 10
    : isSmallScreen
      ? 11
      : 14;

  const getId = () => {
    const value = Array.isArray(id)
      ? id[0]
      : id;

    return Number(value);
  };

  const getValue = (
    obj: any,
    ...keys: string[]
  ) => {
    for (const key of keys) {
      if (
        obj &&
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {
        return obj[key];
      }
    }

    return undefined;
  };

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "Sin fecha";
    }

    const cleanDate =
      String(date).split("T")[0];

    const parts = cleanDate.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;

      return `${day}/${month}/${year}`;
    }

    return String(date);
  };

  const renderTipo = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Servicio";

      case 2:
        return "Mantenimiento";

      default:
        return "Desconocido";
    }
  };

  const renderStatusName = (
    status: number
  ) => {
    switch (status) {
      case 1:
        return "Generada";

      case 2:
        return "Asignada";

      case 3:
        return "En proceso";

      case 4:
        return "Terminada";

      case 5:
        return "Cancelada";

      default:
        return "Desconocido";
    }
  };

  const renderStatusColor = (
    status: number
  ) => {
    switch (status) {
      case 1:
        return "#E5E7EB";

      case 2:
        return "#FEF3C7";

      case 3:
        return "#DBEAFE";

      case 4:
        return "#D1FAE5";

      case 5:
        return "#FECACA";

      default:
        return "#E5E7EB";
    }
  };

  const renderStatusTextColor = (
    status: number
  ) => {
    switch (status) {
      case 1:
        return "#374151";

      case 2:
        return "#92400E";

      case 3:
        return "#1E40AF";

      case 4:
        return "#065F46";

      case 5:
        return "#991B1B";

      default:
        return "#374151";
    }
  };

  const filtrarSolicitudesDelUsuario = (
    list: any[]
  ) => {
    const userId = getId();

    return list.filter((request) => {
      const numSolicitante = Number(
        getValue(
          request,
          "numSolicitante",
          "numsolicitante",
          "num_solicitante",
          "idSolicitante",
          "id_solicitante",
          "solicitanteId",
          "solicitante_id"
        )
      );

      return numSolicitante === userId;
    });
  };

  const loadUser = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await getUser.execute(
        getId()
      );

      setUser(data);
    } catch (error) {
      console.log(
        "ERROR cargando usuario:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUserRequests = async () => {
    try {
      setRequestsLoading(true);

      const userId = getId();

      let data: any[] = [];

      if (
        typeof requestsRepository
          .getRequestsByUser === "function"
      ) {
        data =
          await requestsRepository
            .getRequestsByUser(userId);
      } else if (
        typeof requestsRepository
          .getUserRequests === "function"
      ) {
        data =
          await requestsRepository
            .getUserRequests(userId);
      } else if (
        typeof requestsRepository
          .getRequestsBySolicitante ===
        "function"
      ) {
        data =
          await requestsRepository
            .getRequestsBySolicitante(userId);
      } else if (
        typeof requestsRepository
          .getAllRequests === "function"
      ) {
        const allRequests =
          await requestsRepository
            .getAllRequests();

        data =
          filtrarSolicitudesDelUsuario(
            allRequests ?? []
          );
      } else if (
        typeof requestsRepository
          .getRequests === "function"
      ) {
        const allRequests =
          await requestsRepository
            .getRequests();

        data =
          filtrarSolicitudesDelUsuario(
            allRequests ?? []
          );
      } else if (
        typeof requestsRepository
          .getAll === "function"
      ) {
        const allRequests =
          await requestsRepository.getAll();

        data =
          filtrarSolicitudesDelUsuario(
            allRequests ?? []
          );
      }

      const filtradas =
        filtrarSolicitudesDelUsuario(
          data ?? []
        );

      setRequests(filtradas);
    } catch (error) {
      console.log(
        "ERROR cargando solicitudes del usuario:",
        error
      );

      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadScreenData = async (
    showLoader = true
  ) => {
    await Promise.all([
      loadUser(showLoader),
      loadUserRequests(),
    ]);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      await loadScreenData(false);
    } finally {
      setRefreshing(false);
    }
  };

  const viewRequest = (request: any) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  useEffect(() => {
    loadScreenData(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScreenData(false);
    }, [id])
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
            <ActivityIndicator
              size="large"
              color="#148248"
            />

            <Text style={styles.loadingText}>
              Cargando información...
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
        <ScrollView
          style={styles.screen}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#148248"]}
              tintColor="#148248"
            />
          }
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: height,
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
                    ? 9
                    : isTablet
                      ? 23
                      : 16,
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
                size={
                  isVerySmallScreen ? 24 : 28
                }
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.rowHeader}>
              <Image
                source={require("../../../../assets/images/ZUCARMEX.png")}
                style={{
                  width: logoWidth,
                  height: logoHeight,
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/*
           * La división original se conserva:
           * dos columnas del mismo tamaño.
           */}
          <View
            style={[
              styles.content,
              {
                padding: contentPadding,
              },
            ]}
          >
            {/* COLUMNA IZQUIERDA */}
            <View
              style={[
                styles.account,
                {
                  padding: cardPadding,
                  marginRight: columnsGap,
                },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: titleSize,
                    marginBottom:
                      isSmallScreen ? 12 : 18,
                  },
                ]}
              >
                Información de cuenta
              </Text>

              <View
                style={[
                  styles.avatarContainer,
                  {
                    marginBottom:
                      isSmallScreen ? 12 : 18,
                  },
                ]}
              >
                <View style={styles.avatarBorder}>
                  <AvatarView
                    size={avatarSize}
                    url={user?.imagen ?? null}
                    editable={false}
                  />
                </View>

                <Text
                  style={[
                    styles.avatarHint,
                    {
                      fontSize:
                        isVerySmallScreen
                          ? 9
                          : 11,
                    },
                  ]}
                >
                  Foto de perfil
                </Text>
              </View>

              <View
                style={[
                  styles.disabledInput,
                  {
                    padding:
                      isVerySmallScreen
                        ? 7
                        : isSmallScreen
                          ? 8
                          : 11,
                    marginBottom:
                      isSmallScreen ? 8 : 11,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: labelSize,
                    },
                  ]}
                >
                  Número de trabajador
                </Text>

                <Text
                  style={[
                    styles.disabledText,
                    {
                      fontSize: valueSize,
                    },
                  ]}
                >
                  {user?.numUsuario}
                </Text>
              </View>

              <View
                style={[
                  styles.dataBox,
                  {
                    padding:
                      isVerySmallScreen
                        ? 7
                        : isSmallScreen
                          ? 8
                          : 11,
                    marginBottom:
                      isSmallScreen ? 8 : 11,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: labelSize,
                    },
                  ]}
                >
                  Nombre
                </Text>

                <Text
                  style={[
                    styles.value,
                    {
                      fontSize: valueSize,
                    },
                  ]}
                >
                  {user?.nombre ||
                    "Sin nombre registrado"}
                </Text>
              </View>

              <View
                style={[
                  styles.dataBox,
                  {
                    padding:
                      isVerySmallScreen
                        ? 7
                        : isSmallScreen
                          ? 8
                          : 11,
                    marginBottom:
                      isSmallScreen ? 8 : 11,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: labelSize,
                    },
                  ]}
                >
                  Correo
                </Text>

                <Text
                  style={[
                    styles.value,
                    {
                      fontSize: valueSize,
                    },
                  ]}
                >
                  {user?.email ||
                    "Sin correo registrado"}
                </Text>
              </View>

              <View
                style={[
                  styles.dataBox,
                  {
                    padding:
                      isVerySmallScreen
                        ? 7
                        : isSmallScreen
                          ? 8
                          : 11,
                    marginBottom:
                      isSmallScreen ? 8 : 11,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: labelSize,
                    },
                  ]}
                >
                  Teléfono
                </Text>

                <Text
                  style={[
                    styles.value,
                    {
                      fontSize: valueSize,
                    },
                  ]}
                >
                  {user?.telefono ||
                    "Sin teléfono registrado"}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    minHeight:
                      isVerySmallScreen
                        ? 38
                        : isSmallScreen
                          ? 42
                          : 48,
                    marginTop:
                      isSmallScreen ? 9 : 17,
                  },
                ]}
                onPress={() => {
                  if (!user?.numUsuario) {
                    return;
                  }

                  router.push({
                    pathname: "/editUser",
                    params: {
                      id: user.numUsuario.toString(),
                    },
                  });
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.textButton,
                    {
                      fontSize:
                        isVerySmallScreen
                          ? 10
                          : isSmallScreen
                            ? 12
                            : 14,
                    },
                  ]}
                >
                  Editar cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* COLUMNA DERECHA */}
            <View
              style={[
                styles.requests,
                {
                  padding: cardPadding,
                },
              ]}
            >
              <View
                style={[
                  styles.requestsTitleRow,
                  {
                    marginBottom:
                      isSmallScreen ? 7 : 10,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.title,
                    {
                      flex: 1,
                      fontSize: titleSize,
                      marginBottom: 0,
                    },
                  ]}
                >
                  Solicitudes enviadas
                </Text>

                <View
                  style={[
                    styles.requestsCount,
                    {
                      minWidth:
                        isVerySmallScreen
                          ? 23
                          : 28,
                      height:
                        isVerySmallScreen
                          ? 23
                          : 27,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.requestsCountText,
                      {
                        fontSize:
                          isVerySmallScreen
                            ? 9
                            : 11,
                      },
                    ]}
                  >
                    {requests.length}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.text,
                  {
                    fontSize:
                      isVerySmallScreen
                        ? 9
                        : isSmallScreen
                          ? 10
                          : 14,
                    lineHeight:
                      isSmallScreen ? 15 : 20,
                    marginBottom:
                      isSmallScreen ? 9 : 12,
                  },
                ]}
              >
                Solicitudes realizadas por el usuario
              </Text>

              {requestsLoading ? (
                <View
                  style={styles.requestsLoader}
                >
                  <ActivityIndicator
                    color="#148248"
                    size={
                      isSmallScreen
                        ? "small"
                        : "large"
                    }
                  />

                  <Text
                    style={[
                      styles.requestsLoadingText,
                      {
                        fontSize:
                          isVerySmallScreen
                            ? 9
                            : 11,
                      },
                    ]}
                  >
                    Cargando...
                  </Text>
                </View>
              ) : requests.length > 0 ? (
                requests.map((request) => {
                  const numSolicitud =
                    getValue(
                      request,
                      "numSolicitud",
                      "numsolicitud",
                      "num_solicitud"
                    ) ?? "N/A";

                  const numTipo = Number(
                    getValue(
                      request,
                      "numTipo",
                      "numtipo",
                      "num_tipo"
                    ) ?? 0
                  );

                  const numStatus = Number(
                    getValue(
                      request,
                      "numStatus",
                      "numstatus",
                      "num_status"
                    ) ?? 1
                  );

                  const fecha = getValue(
                    request,
                    "fecha"
                  );

                  const descripcion =
                    getValue(
                      request,
                      "descripcion"
                    ) ?? "Sin descripción";

                  return (
                    <TouchableOpacity
                      key={String(numSolicitud)}
                      style={[
                        styles.requestCard,
                        {
                          padding:
                            isVerySmallScreen
                              ? 7
                              : isSmallScreen
                                ? 8
                                : 12,
                          marginBottom:
                            isSmallScreen
                              ? 8
                              : 12,
                        },
                      ]}
                      onPress={() =>
                        viewRequest(request)
                      }
                      activeOpacity={0.82}
                    >
                      <View
                        style={[
                          styles.requestHeader,
                          {
                            marginBottom:
                              isSmallScreen
                                ? 5
                                : 8,
                          },
                        ]}
                      >

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                renderStatusColor(
                                  numStatus
                                ),
                              paddingVertical:
                                isVerySmallScreen
                                  ? 2
                                  : 4,
                              paddingHorizontal:
                                isVerySmallScreen
                                  ? 5
                                  : 8,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  renderStatusTextColor(
                                    numStatus
                                  ),
                                fontSize:
                                  isVerySmallScreen
                                    ? 7
                                    : isSmallScreen
                                      ? 8
                                      : 11,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {renderStatusName(
                              numStatus
                            )}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.requestText,
                          {
                            fontSize:
                              requestTextSize,
                            lineHeight:
                              isSmallScreen
                                ? 15
                                : 19,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.requestLabel
                          }
                        >
                          Tipo:
                        </Text>{" "}
                        {renderTipo(numTipo)}
                      </Text>

                      <Text
                        style={[
                          styles.requestText,
                          {
                            fontSize:
                              requestTextSize,
                            lineHeight:
                              isSmallScreen
                                ? 15
                                : 19,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.requestLabel
                          }
                        >
                          Fecha:
                        </Text>{" "}
                        {formatDate(fecha)}
                      </Text>

                      <Text
                        style={[
                          styles.requestDescription,
                          {
                            fontSize:
                              isVerySmallScreen
                                ? 9
                                : isSmallScreen
                                  ? 10
                                  : 13,
                            lineHeight:
                              isSmallScreen
                                ? 15
                                : 19,
                          },
                        ]}
                        numberOfLines={
                          isSmallScreen ? 3 : 4
                        }
                      >
                        {descripcion}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View
                  style={styles.emptyContainer}
                >
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={
                      isVerySmallScreen
                        ? 28
                        : isSmallScreen
                          ? 38
                          : 52
                    }
                    color="#C5CBC8"
                  />

                  <Text
                    style={[
                      styles.emptyText,
                      {
                        fontSize:
                          isVerySmallScreen
                            ? 9
                            : isSmallScreen
                              ? 11
                              : 14,
                      },
                    ]}
                  >
                    Este usuario no ha realizado
                    solicitudes
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#F1F5F3",
  },

  header: {
    width: "100%",
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
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
    left: 12,
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
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor:
      "rgba(255,255,255,0.07)",
    top: -55,
    right: -30,
  },

  headerDecorationTwo: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    bottom: -45,
    left: -25,
  },

  /*
   * Esta división se conserva siempre.
   */
  content: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  account: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 15,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },

  requests: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 15,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },

  title: {
    flexShrink: 1,
    color: "#1F2937",
    fontWeight: "800",
    lineHeight: 24,
  },

  avatarContainer: {
    alignItems: "center",
  },

  avatarBorder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#E8F3ED",
    borderRadius: 1000,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  avatarHint: {
    marginTop: 6,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },

  dataBox: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
  },

  disabledInput: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    opacity: 0.75,
  },

  label: {
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: 3,
  },

  value: {
    color: "#111827",
    fontWeight: "600",
    lineHeight: 17,
    flexShrink: 1,
  },

  disabledText: {
    color: "#6B7280",
    fontWeight: "600",
    lineHeight: 17,
  },

  button: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 10,
    paddingHorizontal: 4,

    shadowColor: "#232323",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  textButton: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "800",
  },

  requestsTitleRow: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  requestsCount: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderRadius: 14,
    paddingHorizontal: 5,
    marginLeft: 4,
    flexShrink: 0,
  },

  requestsCountText: {
    color: "#148248",
    fontWeight: "800",
  },

  text: {
    color: "#4B5563",
  },

  requestsLoader: {
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  requestsLoadingText: {
    color: "#6B7280",
    marginTop: 7,
  },

  requestCard: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 11,
  },

  requestHeader: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    borderRadius: 20,
    flexShrink: 0,
  },

  statusText: {
    fontWeight: "800",
  },

  requestText: {
    color: "#374151",
    marginBottom: 3,
    flexShrink: 1,
  },

  requestLabel: {
    fontWeight: "800",
  },

  requestDescription: {
    color: "#6B7280",
    marginTop: 4,
    flexShrink: 1,
  },

  emptyContainer: {
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  emptyText: {
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
    padding: 20,
  },

  loadingCard: {
    minWidth: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 35,
    paddingVertical: 28,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
});