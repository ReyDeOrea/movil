import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
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

import { GetUsersUseCase } from "../../application/getUsersCase";
import { User } from "../../domain/user";
import { SupabaseUserRepository } from "../../infraestructure/userDataSource";
import UserList from "../components/UserList";

type RoleFilter = "todos" | "tecnico" | "administrador" | "solicitante";

const ROLE_BY_ID: Record<number, string> = {
  1: "administrador",
  2: "solicitante",
  3: "tecnico",
};

export default function UsersView() {
  const router = useRouter();

  const repository = new SupabaseUserRepository();
  const getUsers = new GetUsersUseCase(repository);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("todos");

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    try {
      setLoading(true);

      const data = await getUsers.execute();

      setUsers(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar los usuarios"
      );
    } finally {
      setLoading(false);
    }
  };

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

    const nombre = normalizeText(getUserName(user));
    const numeroTrabajador = normalizeText(getWorkerNumber(user));
    const rol = getUserRole(user);

    const matchesSearch =
      nombre.includes(search) || numeroTrabajador.includes(search);

    const matchesRole =
      selectedRole === "todos" || rol.includes(selectedRole);

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

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="#777"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o número de trabajador"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            keyboardType="default"
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={22}
                color="#777"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedRole === "todos" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedRole("todos")}
          >
            <Text
              style={[
                styles.filterText,
                selectedRole === "todos" && styles.filterTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedRole === "tecnico" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedRole("tecnico")}
          >
            <Text
              style={[
                styles.filterText,
                selectedRole === "tecnico" && styles.filterTextActive,
              ]}
            >
              Técnicos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedRole === "administrador" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedRole("administrador")}
          >
            <Text
              style={[
                styles.filterText,
                selectedRole === "administrador" && styles.filterTextActive,
              ]}
            >
              Admins
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedRole === "solicitante" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedRole("solicitante")}
          >
            <Text
              style={[
                styles.filterText,
                selectedRole === "solicitante" && styles.filterTextActive,
              ]}
            >
              Solicitantes
            </Text>
          </TouchableOpacity>
        </View>

        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-search"
              size={70}
              color="#C5C5C5"
            />

            <Text style={styles.emptyTitle}>
              No se encontraron usuarios
            </Text>

            <Text style={styles.emptyText}>
              Intenta buscar con otro nombre, número o filtro.
            </Text>
          </View>
        ) : (
          <UserList
            users={filteredUsers}
            onPress={handleUserPress}
          />
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/signUp")}
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

  header: {
    width: "100%",
    height: 100,
    paddingTop: 35,
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 15,
    height: 52,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  filtersContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
  },

  filterButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  filterButtonActive: {
    backgroundColor: "#148248",
    borderColor: "#148248",
  },

  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 15,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },

  createButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#67B346",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  fabText: {
    color: "white",
    fontSize: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});