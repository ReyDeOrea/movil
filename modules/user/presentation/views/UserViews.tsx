import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { GetUsersUseCase } from "../../application/getUsersCase";
import { User } from "../../domain/user";
import { ApiFastUserRepository } from "../../infraestructure/userDataSource";
import UserList from "../components/UserList";

type RoleFilter =
  | "todos"
  | "tecnico"
  | "administrador"
  | "solicitante";

const ROLE_BY_ID: Record<number, string> = {
  1: "administrador",
  2: "solicitante",
  3: "tecnico",
};

export default function UsersView() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<RoleFilter>("todos");

  /*
   * Valores responsivos
   */
  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding = isTablet ? 32 : 16;

  const contentWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 900 : 680
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

  const floatingButtonSize = isTablet ? 64 : 58;

  const floatingButtonRight = Math.max(
    18,
    (width - contentWidth) / 2 + 8
  );

  const repository = useMemo(
    () => new ApiFastUserRepository(),
    []
  );

  const getUsers = useMemo(
    () => new GetUsersUseCase(repository),
    [repository]
  );

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getUsers.execute();

      setUsers(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "No se pudieron cargar los usuarios"
      );
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const getUserName = (user: User) => {
    return String(
      (user as any).nombre ??
        (user as any).name ??
        (user as any).username ??
        ""
    );
  };

  const getWorkerNumber = (user: User) => {
    return String(
      (user as any).numUsuario ??
        (user as any).numusuario ??
        (user as any).numeroTrabajador ??
        (user as any).numero_trabajador ??
        (user as any).id ??
        ""
    );
  };

  const getUserRole = (user: User) => {
    const roleText = String(
      (user as any).nombrerol ??
        (user as any).nombreRol ??
        (user as any).rol ??
        (user as any).role ??
        ""
    );

    if (roleText.trim() !== "") {
      return normalizeText(roleText);
    }

    const roleId = Number(
      (user as any).numRol ??
        (user as any).numrol ??
        (user as any).roleId ??
        (user as any).rolId
    );

    return ROLE_BY_ID[roleId] ?? "";
  };

  const filteredUsers = users.filter((user) => {
    const search = normalizeText(searchText);

    const nombre = normalizeText(
      getUserName(user)
    );

    const numeroTrabajador = normalizeText(
      getWorkerNumber(user)
    );

    const rol = getUserRole(user);

    const matchesSearch =
      nombre.includes(search) ||
      numeroTrabajador.includes(search);

    const matchesRole =
      selectedRole === "todos" ||
      rol.includes(selectedRole);

    return matchesSearch && matchesRole;
  });

  const handleUserPress = (id: number) => {
    router.push({
      pathname: "/userDetail",
      params: {
        id: id.toString(),
      },
    });
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
          backgroundColor="#F1F5F3"
        />

        <SafeAreaView style={styles.center}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIcon}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={45}
                color="#148248"
              />
            </View>

            <ActivityIndicator
              size="large"
              color="#148248"
            />

            <Text style={styles.loadingText}>
              Cargando usuarios...
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
                style={{
                  width: logoWidth,
                  height: logoHeight,
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View
            style={[
              styles.toolbar,
              {
                width: contentWidth,
                paddingTop: isSmallScreen ? 14 : 18,
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
                    ? "Buscar usuario"
                    : "Buscar por nombre o número de trabajador"
                }
                placeholderTextColor="#8A919C"
                value={searchText}
                onChangeText={setSearchText}
                keyboardType="default"
                autoCorrect={false}
                returnKeyType="search"
              />

              {searchText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchText("")}
                  activeOpacity={0.7}
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
          </View>

          <View
            style={[
              styles.filtersWrapper,
              {
                width: contentWidth,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.filtersContainer
              }
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedRole === "todos" &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedRole("todos")
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedRole === "todos" &&
                      styles.filterTextActive,
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedRole === "tecnico" &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedRole("tecnico")
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedRole === "tecnico" &&
                      styles.filterTextActive,
                  ]}
                >
                  Técnicos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedRole ===
                    "administrador" &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedRole("administrador")
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedRole ===
                      "administrador" &&
                      styles.filterTextActive,
                  ]}
                >
                  Admins
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedRole === "solicitante" &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedRole("solicitante")
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedRole ===
                      "solicitante" &&
                      styles.filterTextActive,
                  ]}
                >
                  Solicitantes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {filteredUsers.length === 0 ? (
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
                  name="account-search-outline"
                  size={60}
                  color="#148248"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No se encontraron usuarios
              </Text>

              <Text style={styles.emptyText}>
                Intenta buscar con otro nombre,
                número de trabajador o filtro.
              </Text>

              {(searchText.length > 0 ||
                selectedRole !== "todos") && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchText("");
                    setSelectedRole("todos");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="filter-remove-outline"
                    size={20}
                    color="#148248"
                  />

                  <Text
                    style={
                      styles.clearFiltersButtonText
                    }
                  >
                    Limpiar filtros
                  </Text>
                </TouchableOpacity>
              )}
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
              <UserList
                users={filteredUsers}
                onPress={handleUserPress}
                resetKey={`${searchText}-${selectedRole}-${filteredUsers.length}`}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              {
                width: floatingButtonSize,
                height: floatingButtonSize,
                borderRadius:
                  floatingButtonSize / 2,
                right: floatingButtonRight,
                bottom: isSmallScreen ? 18 : 28,
              },
            ]}
            onPress={() => router.push("/signUp")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.fabText,
                {
                  fontSize: isTablet ? 35 : 31,
                },
              ]}
            >
              +
            </Text>
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

    shadowColor: "#000000",
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
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
    minHeight: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 3,
    marginTop: 8,
  },

  filtersWrapper: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  filtersContainer: {
    alignItems: "center",
    paddingRight: 8,
    paddingBottom: 3,
  },

  filterButton: {
    minHeight: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8DEDB",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: "#148248",
    borderColor: "#148248",

    shadowColor: "#148248",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  filterText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  listContainer: {
    flex: 1,
    alignSelf: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingBottom: 70,
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
    maxWidth: 380,
    color: "#737B87",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 7,
  },

  clearFiltersButton: {
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

  clearFiltersButtonText: {
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

    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 7,
  },

  fabText: {
    color: "#FFFFFF",
    fontWeight: "400",
    lineHeight: 36,
    textAlign: "center",
    marginTop: -2,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
    padding: 20,
  },

  loadingCard: {
    minWidth: 230,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 36,
    paddingVertical: 30,

    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  loadingIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginBottom: 16,
  },

  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
});