import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
  KeyboardAvoidingView,
  Platform,
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

import { checkUserExistsUpdate } from "../../application/checkUserExistsUpdate";
import { GetUserByIdUseCase } from "../../application/getUserByid";
import { getUserProfile } from "../../application/getUserProfile";
import { updateUserProfile } from "../../application/updateUserProfile";
import { validateUserProfile } from "../../application/validateUpdate";
import { User } from "../../domain/user";
import { ApiFastUserRepository } from "../../infraestructure/userDataSource";
import AvatarView from "../components/AvatarView";

export default function Account() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

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

  /*
   * Medidas responsivas
   */
  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding = isTablet ? 32 : 16;

  const cardWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 600 : 480
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

  const avatarSize = isSmallScreen
    ? 96
    : isTablet
      ? 145
      : 120;

  const cardPadding = isSmallScreen
    ? 16
    : isTablet
      ? 32
      : 22;

  const repository = useMemo(
    () => new ApiFastUserRepository(),
    []
  );

  const getUserByIdUseCase = useMemo(
    () => new GetUserByIdUseCase(repository),
    [repository]
  );

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
  }, [getUserByIdUseCase]);

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

  if (loadingProfile && !user) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F1F5F3"
        />

        <SafeAreaView style={styles.center}>
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color="#148248"
            />

            <Text style={styles.loadingText}>
              Cargando perfil...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F1F5F3"
        />

        <SafeAreaView style={styles.center}>
          <View
            style={[
              styles.emptyCard,
              {
                width: cardWidth,
              },
            ]}
          >
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="account-alert-outline"
                size={48}
                color="#148248"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No hay usuario logueado
            </Text>

            <Text style={styles.emptyDescription}>
              No se pudo obtener la información del
              perfil.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadProfile}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.retryButtonText}>
                Volver a intentar
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <StatusBar
        barStyle="light-content"
        backgroundColor="#148248"
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            style={styles.screen}
            contentContainerStyle={[
              styles.scrollContent,
              {
                minHeight: height,
                paddingBottom: isSmallScreen
                  ? 20
                  : 36,
              },
            ]}
            keyboardShouldPersistTaps="handled"
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
                onPress={() => router.back()}
                style={[
                  styles.backButton,
                  {
                    top: isLandscape
                      ? 10
                      : isTablet
                        ? 24
                        : 17,
                  },
                ]}
                disabled={loading}
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

              <View style={styles.logoContainer}>
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
                styles.card,
                {
                  width: cardWidth,
                  padding: cardPadding,
                  marginTop: isSmallScreen
                    ? 16
                    : 20,
                },
              ]}
            >
              {loadingProfile && (
                <View
                  style={styles.refreshContainer}
                >
                  <ActivityIndicator
                    size="small"
                    color="#148248"
                  />

                  <Text style={styles.refreshText}>
                    Actualizando información...
                  </Text>
                </View>
              )}

                 <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.profileTitle,
                    {
                      fontSize: isSmallScreen
                        ? 20
                        : isTablet
                          ? 26
                          : 23,
                    },
                  ]}
                >
                  Mi perfil
                </Text>

                <Text
                  style={styles.profileDescription}
                >
                  Consulta y actualiza tus datos de
                  contacto
                </Text>
              </View>

              <View
                style={styles.avatarContainer}
              >
                <View
                  style={styles.avatarBorder}
                >
                  <AvatarView
                    key={`${user.numUsuario}-${avatarVersion}`}
                    size={avatarSize}
                    url={getAvatarUrl()}
                    editable={false}
                  />
                </View>

                <Text style={styles.avatarHint}>
                  Foto de perfil
                </Text>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.label}>
                  Nombre
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    styles.inputContainerDisabled,
                    isSmallScreen &&
                      styles.inputContainerSmall,
                  ]}
                >
                  <View
                    style={[
                      styles.inputIcon,
                      styles.inputIconDisabled,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={21}
                      color="#6B7280"
                    />
                  </View>

                  <TextInput
                    style={[
                      styles.input,
                      styles.inputDisabled,
                    ]}
                    value={user.nombre ?? ""}
                    editable={false}
                  />
                </View>

                <Text style={styles.label}>
                  Correo electrónico
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    isSmallScreen &&
                      styles.inputContainerSmall,
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={21}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>

                <Text style={styles.label}>
                  Teléfono
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    isSmallScreen &&
                      styles.inputContainerSmall,
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={21}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    value={telefono}
                    onChangeText={setTelefono}
                    placeholder="Número de teléfono"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    editable={!loading}
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={handleUpdate}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  isSmallScreen &&
                    styles.buttonSmall,
                  loading &&
                    styles.buttonDisabled,
                ]}
                onPress={handleUpdate}
                disabled={loading}
                activeOpacity={0.85}
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
                  <>
                    <Text
                      style={styles.buttonTextWithIcon}
                    >
                      Actualizar perfil
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  keyboardView: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  scrollContent: {
    flexGrow: 1,
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

  logoContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  backButton: {
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

  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 7,
  },

  refreshContainer: {
    minHeight: 36,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8F4",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  refreshText: {
    color: "#6B7280",
    fontSize: 13,
    marginLeft: 8,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  avatarBorder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#E8F3ED",
    borderRadius: 1000,
    backgroundColor: "#FFFFFF",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },

  avatarHint: {
    marginTop: 9,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  titleContainer: {
    alignItems: "center",
    marginBottom: 22,
  },

  profileTitle: {
    color: "#1F2937",
    textAlign: "center",
    fontWeight: "800",
    lineHeight: 31,
  },

  profileDescription: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 8,
  },

  formContainer: {
    width: "100%",
  },

  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 3,
    marginBottom: 7,
  },

  inputContainer: {
    width: "100%",
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#DDE5E1",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 18,
  },

  inputContainerSmall: {
    minHeight: 52,
    marginBottom: 14,
  },

  inputContainerDisabled: {
    backgroundColor: "#F0F1F2",
    borderColor: "#D1D5DB",
  },

  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  inputIconDisabled: {
    backgroundColor: "#E1E3E5",
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    color: "#111827",
    fontSize: 15,
    paddingVertical: 8,
  },

  inputDisabled: {
    color: "#6B7280",
  },

  button: {
    width: "100%",
    minHeight: 54,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 15,
    marginTop: 4,

    shadowColor: "#232323",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 4,
  },

  buttonSmall: {
    minHeight: 50,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonLoadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 9,
  },

  buttonTextWithIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
    padding: 20,
  },

  loadingBox: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 32,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 30,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginBottom: 16,
  },

  emptyTitle: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },

  retryButton: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 20,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
});