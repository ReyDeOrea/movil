import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Stack,
  useFocusEffect,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { checkUserExistsUpdate } from "../../application/checkUserExistsUpdate";
import { GetUserByIdUseCase } from "../../application/getUserByid";
import { getUserProfile } from "../../application/getUserProfile";
import { updateUserProfile } from "../../application/updateUserProfile";
import { validateUserProfile } from "../../application/validateUpdate";
import { User } from "../../domain/user";
import { ApiFastUserRepository } from "../../infraestructure/userDataSource";
import AvatarView from "../components/AvatarView";

const { width } = Dimensions.get("window");

const AVATAR_SIZE = width * 0.32;
const LOGO_WIDTH = Math.min(width * 0.28, 115);

export default function Account() {
  const router = useRouter();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarVersion, setAvatarVersion] =
    useState(Date.now());

  const [user, setUser] =
    useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const repository = new ApiFastUserRepository();

  const getUserByIdUseCase =
    new GetUserByIdUseCase(repository);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);

      const sessionUser = await getUserProfile();

      if (!sessionUser) {
        setUser(null);
        setAvatarUrl("");
        setEmail("");
        setTelefono("");
        return;
      }

      const freshUser =
        await getUserByIdUseCase.execute(
          Number(sessionUser.numUsuario)
        );

      if (!freshUser) {
        setUser(null);
        setAvatarUrl("");
        setEmail("");
        setTelefono("");

        Alert.alert(
          "Error",
          "No se encontró la información actualizada del usuario"
        );

        return;
      }

      setUser(freshUser);
      setAvatarUrl(freshUser.imagen ?? "");
      setEmail(freshUser.email ?? "");
      setTelefono(freshUser.telefono ?? "");

      setAvatarVersion(Date.now());
    } catch (error: any) {
      console.log(
        "ERROR ACTUALIZANDO PERFIL:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ??
          "No se pudo cargar el perfil"
      );
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleUpdate = async () => {
    if (!user || loading) {
      return;
    }

    try {
      setLoading(true);

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanTelefono = telefono.trim();

      const currentEmail = (user.email ?? "")
        .trim()
        .toLowerCase();

      const currentTelefono = (
        user.telefono ?? ""
      ).trim();

      validateUserProfile(
        cleanEmail,
        cleanTelefono
      );

      const changedEmail =
        cleanEmail !== currentEmail;

      const changedTelefono =
        cleanTelefono !== currentTelefono;

      if (changedEmail || changedTelefono) {
        await checkUserExistsUpdate(
          cleanEmail,
          cleanTelefono,
          user.numUsuario
        );
      }

      await updateUserProfile(user, {
        email: cleanEmail,
        telefono: cleanTelefono,
      });

      await loadProfile();

      Alert.alert(
        "Éxito",
        "Perfil actualizado correctamente",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ??
          "No se pudo actualizar el perfil"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile && !user) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#148248"
          />

          <Text style={styles.loadingText}>
            Cargando perfil...
          </Text>
        </View>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <View style={styles.center}>
          <Text>No hay usuario logueado</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProfile}
          >
            <Text style={styles.retryButtonText}>
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const getAvatarUrl = () => {
    if (!avatarUrl) {
      return "";
    }

    if (
      !avatarUrl.startsWith("http://") &&
      !avatarUrl.startsWith("https://")
    ) {
      return avatarUrl;
    }

    const separator =
      avatarUrl.includes("?") ? "&" : "?";

    return `${avatarUrl}${separator}v=${avatarVersion}`;
  };

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Image
            source={require("../../../../assets/images/ZUCARMEX.png")}
            style={styles.imageZucarmex}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          {loadingProfile && (
            <View style={styles.refreshContainer}>
              <ActivityIndicator
                size="small"
                color="#148248"
              />

              <Text style={styles.refreshText}>
                Actualizando información...
              </Text>
            </View>
          )}

          <View style={styles.avatarContainer}>
            <AvatarView
              key={`${user.numUsuario}-${avatarVersion}`}
              size={AVATAR_SIZE}
              url={getAvatarUrl()}
              editable={false}
            />

            <Text style={styles.avatarHint}>
              Foto de perfil
            </Text>
          </View>

          <Text style={styles.label}>
            Nombre
          </Text>

          <TextInput
            style={styles.inputDisabled}
            value={user.nombre ?? ""}
            editable={false}
          />

          <Text style={styles.label}>
            Correo
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>
            Teléfono
          </Text>

          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            editable={!loading}
            maxLength={10}
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <View
                style={
                  styles.buttonLoadingContent
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  Guardando...
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                Actualizar perfil
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  header: {
    backgroundColor: "#148248",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },

  backButton: {
    zIndex: 2,
    padding: 4,
  },

  card: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  refreshContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },

  refreshText: {
    color: "#6B7280",
    fontSize: 13,
  },

  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#111827",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    color: "#111827",
  },

  inputDisabled: {
    backgroundColor: "#D8D5D5",
    borderWidth: 1,
    borderColor: "#ACACAC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: "#6B7280",
  },

  button: {
    marginTop: 15,
    backgroundColor: "#232323",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonLoadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#148248",
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  imageZucarmex: {
    width: LOGO_WIDTH,
    height: 50,
    position: "absolute",
    left: (width - LOGO_WIDTH) / 2,
    top: 45,
  },
});