import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import {
  Stack,
  useRouter,
} from "expo-router";
import { useState } from "react";
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

import { checkUserExists } from "../../application/checkUserExists";
import { registerUser } from "../../application/registerUser";
import { validateSignUpData } from "../../application/validateSignUpData";
import { saveAvatar } from "../../infraestructure/uploadimgs";

export default function RegisterUser() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const [numUsuario, setNumUsuario] =
    useState("");

  const [nombre, setNombre] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [numRol, setNumRol] =
    useState("2");

  const [numTipo, setNumTipo] =
    useState("1");

  const [loading, setLoading] =
    useState(false);

  const [avatar, setAvatar] =
    useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const useTwoColumns =
    isTablet ||
    (isLandscape && width >= 650);

  const horizontalPadding =
    isTablet ? 40 : 16;

  const cardWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 650 : 470
  );

  const cardPadding = isSmallScreen
    ? 14
    : isTablet
      ? 26
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

  const avatarSize = isSmallScreen
    ? 86
    : isTablet
      ? 122
      : 102;

  const fieldWidth = useTwoColumns
    ? "48.5%"
    : "100%";

  const uploadSelectedAvatar = async (
    uri: string
  ) => {
    setAvatar(uri);

    const uploadedUrl = await saveAvatar({
      uri,
    });

    if (!uploadedUrl) {
      Alert.alert(
        "Error",
        "No se pudo subir la imagen"
      );

      return;
    }

    setAvatarUrl(uploadedUrl);
  };

  const pickFromGallery = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset?.uri) return;

    await uploadSelectedAvatar(asset.uri);
  };

  const takePhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitas permitir el uso de la cámara para tomar una foto."
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset?.uri) return;

    await uploadSelectedAvatar(asset.uri);
  };

  const pickImage = async () => {
    Alert.alert(
      "Foto de perfil",
      "Elige una opción",
      [
        {
          text: "Galería",
          onPress: () => pickFromGallery(),
        },
        {
          text: "Cámara",
          onPress: () => takePhoto(),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      validateSignUpData({
        numUsuario: Number(numUsuario),
        nombre,
        telefono,
        email,
        password,
        confirmPassword,
      });

      await checkUserExists(
        numUsuario.trim(),
        email.trim().toLowerCase(),
        nombre.trim(),
        telefono.trim()
      );

      await registerUser({
        numUsuario: Number(numUsuario),
        nombre,
        telefono,
        email,
        password,
        numRol: Number(numRol),
        numTipo: Number(numTipo),
        imagen: avatarUrl ?? undefined,
      });

      Alert.alert(
        "Éxito",
        "Trabajador registrado correctamente"
      );

      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setLoading(false);
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
                  ? 20
                  : 35,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                  style={
                    styles.titleTextContainer
                  }
                >
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
                    Registrar trabajador
                  </Text>

                  <Text style={styles.subtitle}>
                    Ingresa la información de la nueva
                    cuenta
                  </Text>
                </View>
              </View>

              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatarCircle,
                    {
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius:
                        avatarSize / 2,
                    },
                  ]}
                >
                  {avatar ? (
                    <Image
                      source={{ uri: avatar }}
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius:
                          avatarSize / 2,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={
                        styles.avatarPlaceholder
                      }
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={
                          isSmallScreen ? 42 : 50
                        }
                        color="#8A9690"
                      />
                    </View>
                  )}
                </View>

                {/* ÚNICO BOTÓN PARA SUBIR LA FOTO */}
                <TouchableOpacity
                  style={styles.uploadPhotoButton}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={
                      avatar
                        ? "camera-retake-outline"
                        : "camera-plus-outline"
                    }
                    size={19}
                    color="#148248"
                  />

                  <Text
                    style={
                      styles.uploadPhotoButtonText
                    }
                  >
                    {avatar
                      ? "Cambiar foto"
                      : "Subir foto"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.fieldsContainer}>
                <View
                  style={[
                    styles.fieldGroup,
                    {
                      width: fieldWidth,
                    },
                  ]}
                >
                  <Text style={styles.label}>
                    Número de trabajador
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
                      <MaterialIcons
                        name="badge"
                        size={20}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Número de trabajador"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={numUsuario}
                      onChangeText={setNumUsuario}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.fieldGroup,
                    {
                      width: fieldWidth,
                    },
                  ]}
                >
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
                      <MaterialIcons
                        name="person"
                        size={20}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Nombre completo"
                      placeholderTextColor="#9CA3AF"
                      value={nombre}
                      onChangeText={setNombre}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.fieldGroup,
                    {
                      width: fieldWidth,
                    },
                  ]}
                >
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
                      <Feather
                        name="phone"
                        size={19}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Teléfono"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={telefono}
                      onChangeText={setTelefono}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.fieldGroup,
                    {
                      width: fieldWidth,
                    },
                  ]}
                >
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
                      <MaterialIcons
                        name="email"
                        size={20}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Correo"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.fieldGroup,
                    {
                      width: fieldWidth,
                    },
                  ]}
                >
                  <Text style={styles.label}>
                    Contraseña
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
                      <MaterialIcons
                        name="lock"
                        size={20}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Contraseña"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.fieldGroup,
                    {
                      width: fieldWidth,
                    },
                  ]}
                >
                  <Text style={styles.label}>
                    Confirmar contraseña
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
                      <MaterialIcons
                        name="lock"
                        size={20}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Confirmar contraseña"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={
                        setConfirmPassword
                      }
                    />
                  </View>
                </View>
              </View>

              <View style={styles.optionsSection}>
                <View
                  style={styles.sectionTitleRow}
                >
                  <MaterialCommunityIcons
                    name="shield-account-outline"
                    size={20}
                    color="#148248"
                  />

                  <Text style={styles.sectionTitle}>
                    Rol
                  </Text>
                </View>

                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      numRol === "1" &&
                        styles.optionSelected,
                    ]}
                    onPress={() => setNumRol("1")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        numRol === "1" &&
                          styles.optionTextSelected,
                      ]}
                    >
                      Administrador
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.option,
                      numRol === "2" &&
                        styles.optionSelected,
                    ]}
                    onPress={() => setNumRol("2")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        numRol === "2" &&
                          styles.optionTextSelected,
                      ]}
                    >
                      Solicitante
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.option,
                      numRol === "3" &&
                        styles.optionSelected,
                    ]}
                    onPress={() => setNumRol("3")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        numRol === "3" &&
                          styles.optionTextSelected,
                      ]}
                    >
                      Técnico
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionsSection}>
                <View
                  style={styles.sectionTitleRow}
                >
                  <MaterialCommunityIcons
                    name="account-hard-hat-outline"
                    size={20}
                    color="#148248"
                  />

                  <Text style={styles.sectionTitle}>
                    Tipo de trabajador
                  </Text>
                </View>

                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      numTipo === "1" &&
                        styles.optionSelected,
                    ]}
                    onPress={() => setNumTipo("1")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        numTipo === "1" &&
                          styles.optionTextSelected,
                      ]}
                    >
                      No sindicalizado
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.option,
                      numTipo === "2" &&
                        styles.optionSelected,
                    ]}
                    onPress={() => setNumTipo("2")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        numTipo === "2" &&
                          styles.optionTextSelected,
                      ]}
                    >
                      Obrero
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.option,
                      numTipo === "6" &&
                        styles.optionSelected,
                    ]}
                    onPress={() => setNumTipo("6")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        numTipo === "6" &&
                          styles.optionTextSelected,
                      ]}
                    >
                      Campo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  loading &&
                    styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <>
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />

                    <Text
                      style={
                        styles.buttonTextLoading
                      }
                    >
                      Registrando...
                    </Text>
                  </>
                ) : (
                  <>

                    <Text
                      style={styles.buttonText}
                    >
                      Registrar trabajador
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                activeOpacity={0.75}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
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
    marginBottom: 12,
  },

  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    flexShrink: 0,
  },

  titleIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },

  titleTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  title: {
    color: "#1F2937",
    fontWeight: "800",
    lineHeight: 28,
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
    marginBottom: 16,
  },

  avatarCircle: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#F0F3F1",
    borderWidth: 4,
    borderColor: "#E0EEE6",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  uploadPhotoButton: {
    minHeight: 38,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8F4",
    borderWidth: 1,
    borderColor: "#D6EADF",
    borderRadius: 11,
    paddingHorizontal: 15,
    marginTop: 9,
  },

  uploadPhotoButtonText: {
    color: "#148248",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  fieldsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  fieldGroup: {
    minWidth: 0,
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

  optionsSection: {
    width: "100%",
    marginTop: 3,
    marginBottom: 8,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  sectionTitle: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },

  optionsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },

  option: {
    minHeight: 39,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D8DEDB",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },

  optionSelected: {
    backgroundColor: "#148248",
    borderColor: "#148248",

    shadowColor: "#148248",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },

  optionText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "700",
  },

  optionTextSelected: {
    color: "#FFFFFF",
  },

  button: {
    width: "100%",
    minHeight: 49,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,

    shadowColor: "#232323",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 7,
  },

  buttonTextLoading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 9,
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

  cancelButtonText: {
    color: "#fffbfb",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
});