import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useEffect, useState } from "react";
import {
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
import checkUserNameExistsUpdate from "../../application/CheckUserNameExist";
import { EditUserUseCase } from "../../application/editUser";
import { GetUserByIdUseCase } from "../../application/getUserByid";
import { validateUser } from "../../application/validateUpdateUser";
import { User } from "../../domain/user";
import { ApiFastUserRepository } from "../../infraestructure/userDataSource";
import AvatarView from "../components/AvatarView";

export default function EditUserView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { width, height } = useWindowDimensions();

  const repository =
    new ApiFastUserRepository();

  const getUserUseCase =
    new GetUserByIdUseCase(repository);

  const editUserUseCase =
    new EditUserUseCase(repository);

  const [userData, setUserData] =
    useState<User | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding = isTablet ? 40 : 20;

  const cardWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 510 : 420
  );

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

  const avatarSize = isSmallScreen
    ? 82
    : isTablet
      ? 116
      : 98;

  const cardPadding = isSmallScreen
    ? 14
    : isTablet
      ? 24
      : 18;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getUserUseCase.execute(
        Number(id)
      );

      if (!user) {
        Alert.alert(
          "Error",
          "Usuario no encontrado"
        );

        router.back();
        return;
      }

      setUserData(user);
      setNombre(user.nombre);
      setEmail(user.email);
      setTelefono(user.telefono);
      setAvatarUrl(user.imagen ?? "");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  const handleUpdate = async () => {
    try {
      if (!userData) return;

      const cleanNombre = nombre.trim();

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanTelefono =
        telefono.trim();

      const currentNombre = (
        userData.nombre ?? ""
      )
        .trim()
        .toLowerCase();

      const currentEmail = (
        userData.email ?? ""
      )
        .trim()
        .toLowerCase();

      const currentTelefono = (
        userData.telefono ?? ""
      ).trim();

      const updatedUser: User = {
        ...userData,
        nombre: cleanNombre,
        email: cleanEmail,
        telefono: cleanTelefono,
        imagen: avatarUrl || userData.imagen,
      };

      await validateUser(
        updatedUser.nombre,
        updatedUser.email,
        updatedUser.telefono
      );

      if (
        cleanNombre.toLowerCase() !==
        currentNombre
      ) {
        await checkUserNameExistsUpdate(
          updatedUser.nombre,
          updatedUser.numUsuario
        );
      }

      if (
        cleanEmail !== currentEmail ||
        cleanTelefono !== currentTelefono
      ) {
        await checkUserExistsUpdate(
          updatedUser.email,
          updatedUser.telefono,
          updatedUser.numUsuario
        );
      }

      await editUserUseCase.execute(
        updatedUser
      );

      Alert.alert(
        "Éxito",
        "Usuario actualizado correctamente"
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
                  ? 16
                  : 28,
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
                    ? 12
                    : 16,
                },
              ]}
            >
              <View style={styles.titleContainer}>
                <View
                  style={styles.titleTextContainer}
                >
                  <Text
                    style={[
                      styles.title,
                      {
                        fontSize: isSmallScreen
                          ? 19
                          : isTablet
                            ? 23
                            : 21,
                      },
                    ]}
                  >
                    Editar cuenta
                  </Text>

                  <Text style={styles.subtitle}>
                    Actualiza los datos del usuario
                  </Text>
                </View>
              </View>

              <View style={styles.avatarContainer}>
                <AvatarView
                  size={avatarSize}
                  url={avatarUrl}
                  editable
                  onUpload={(url) =>
                    setAvatarUrl(url)
                  }
                />
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.label}>
                  Nombre
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    isSmallScreen &&
                    styles.inputContainerSmall,
                  ]}
                >
                  <View
                    style={[
                      styles.inputIcon,
                      isSmallScreen &&
                      styles.inputIconSmall,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={20}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    placeholderTextColor="#9CA3AF"
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
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
                  <View
                    style={[
                      styles.inputIcon,
                      isSmallScreen &&
                      styles.inputIconSmall,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
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
                  <View
                    style={[
                      styles.inputIcon,
                      isSmallScreen &&
                      styles.inputIconSmall,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={20}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Teléfono"
                    placeholderTextColor="#9CA3AF"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
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
                ]}
                onPress={handleUpdate}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  Guardar cambios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  isSmallScreen &&
                  styles.cancelButtonSmall,
                ]}
                onPress={() => router.back()}
                activeOpacity={0.75}
              >
                <Text
                  style={styles.cancelButtonText}
                >
                  Cancelar
                </Text>
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

  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 20,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 5,
  },

 titleContainer: {
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
},

  titleTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  title: {
    color: "#1F2937",
    fontWeight: "800",
    lineHeight: 27,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },

  avatarContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  formContainer: {
    width: "100%",
  },

  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 3,
    marginBottom: 5,
  },

  inputContainer: {
    width: "100%",
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#DDE5E1",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  inputContainerSmall: {
    minHeight: 47,
    marginBottom: 10,
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 8,
    flexShrink: 0,
  },

  inputIconSmall: {
    width: 31,
    height: 31,
    borderRadius: 8,
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 47,
    color: "#111827",
    fontSize: 14,
    paddingVertical: 6,
  },

  button: {
    width: "100%",
    minHeight: 49,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    marginTop: 2,

    shadowColor: "#232323",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonSmall: {
    minHeight: 46,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 7,
  },

  cancelButton: {
    width: "100%",
    minHeight: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870c0c",
    borderRadius: 12,
    marginTop: 9,
  },

  cancelButtonSmall: {
    minHeight: 42,
  },

  cancelButtonText: {
    color: "#fefefe",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
});