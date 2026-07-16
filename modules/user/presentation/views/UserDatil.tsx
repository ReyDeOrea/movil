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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { GetUserByIdUseCase } from "../../application/getUserByid";
import { User } from "../../domain/user";
import { ApiFastUserRepository } from "../../infraestructure/userDataSource";
import AvatarView from "../components/AvatarView";

import { SupabaseRequestsRepository } from "../../../requests/infraestructure/requestsDatasurce";

export default function UserDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const repository =
    new ApiFastUserRepository();

  const getUser =
    new GetUserByIdUseCase(repository);

  const requestsRepository: any =
    new SupabaseRequestsRepository();

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
    if (!date) return "Sin fecha";

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
        typeof requestsRepository.getAll ===
        "function"
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
    setRefreshing(true);

    await loadScreenData(false);

    setRefreshing(false);
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

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
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
                source={require("../../../../assets/images/ZUCARMEX.png")}
                style={styles.imageZucarmex}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.account}>
              <Text style={styles.title}>
                Información de cuenta
              </Text>

              <View
                style={
                  styles.avatarContainer
                }
              >
                <AvatarView
                  size={100}
                  url={user?.imagen ?? null}
                  editable={false}
                />

                <Text
                  style={styles.avatarHint}
                >
                  Foto de perfil
                </Text>
              </View>

              <View
                style={
                  styles.disabledInput
                }
              >
                <Text style={styles.label}>
                  Número de trabajador
                </Text>

                <Text
                  style={
                    styles.disabledText
                  }
                >
                  {user?.numUsuario}
                </Text>
              </View>

              <View style={styles.dataBox}>
                <Text style={styles.label}>
                  Nombre
                </Text>

                <Text style={styles.value}>
                  {user?.nombre}
                </Text>
              </View>

              <View style={styles.dataBox}>
                <Text style={styles.label}>
                  Correo
                </Text>

                <Text style={styles.value}>
                  {user?.email}
                </Text>
              </View>

              <View style={styles.dataBox}>
                <Text style={styles.label}>
                  Teléfono
                </Text>

                <Text style={styles.value}>
                  {user?.telefono}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push({
                    pathname: "/editUser",
                    params: {
                      id: user?.numUsuario
                        ?.toString(),
                    },
                  })
                }
              >
                <Text
                  style={styles.textButton}
                >
                  Editar cuenta
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.requests}>
              <Text style={styles.title}>
                Solicitudes enviadas
              </Text>

              <Text style={styles.text}>
                Solicitudes realizadas por el
                usuario
              </Text>

              {requestsLoading ? (
                <View
                  style={
                    styles.requestsLoader
                  }
                >
                  <ActivityIndicator />
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
                      key={String(
                        numSolicitud
                      )}
                      style={
                        styles.requestCard
                      }
                      onPress={() =>
                        viewRequest(request)
                      }
                    >
                      <View
                        style={
                          styles.requestHeader
                        }
                      >
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                renderStatusColor(
                                  numStatus
                                ),
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
                              },
                            ]}
                          >
                            {renderStatusName(
                              numStatus
                            )}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={
                          styles.requestText
                        }
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
                        style={
                          styles.requestText
                        }
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
                        style={
                          styles.requestDescription
                        }
                      >
                        {descripcion}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text
                  style={styles.emptyText}
                >
                  Este usuario no ha realizado
                  solicitudes
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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

  rowHeader: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  imageZucarmex: {
    width: "45%",
    height: 60,
  },

  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
    zIndex: 10,
  },

  content: {
    flex: 1,
    flexDirection: "row",
    padding: 15,
    gap: 15,
  },

  account: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
  },

  requests: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
  },

  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },

  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },

  text: {
    fontSize: 15,
    marginBottom: 12,
    color: "#4B5563",
  },

  button: {
    backgroundColor: "#232323",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },

  textButton: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  dataBox: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  disabledInput: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    opacity: 0.7,
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "bold",
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    color: "#111827",
  },

  disabledText: {
    fontSize: 16,
    color: "#6B7280",
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },

  scrollContent: {
    flexGrow: 1,
  },

  requestsLoader: {
    marginTop: 20,
    alignItems: "center",
  },

  requestCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  requestTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },

  requestText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },

  requestLabel: {
    fontWeight: "bold",
  },

  requestDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
});