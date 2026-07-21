import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useRouter } from "expo-router";
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

import { ResetPasswordUseCase } from "../../application/resetPassword";
import { VerifyUserUseCase } from "../../application/verifyUserCase";
import { User } from "../../domain/user";
import { ApiFastUserRepository } from "../../infraestructure/userDataSource";
import NewPasswordModal from "./NewPasswordModal";

export default function Password() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const userRepo = new ApiFastUserRepository();

  const verifyUserUseCase =
    new VerifyUserUseCase(userRepo);

  const resetPasswordUseCase =
    new ResetPasswordUseCase(userRepo);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] =
    useState<User | null>(null);

  /*
   * Medidas responsivas
   */
  const isSmallScreen = width < 360 || height < 650;
  const isTablet = width >= 700;
  const isLandscape = width > height;

  const horizontalPadding = isTablet ? 32 : 16;

  const cardWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 560 : 460
  );

  /*
   * Banner compacto
   */
  const headerHeight = isLandscape
    ? 120
    : isSmallScreen
      ? 130
      : isTablet
        ? 170
        : 145;

  /*
   * Logo grande y responsivo
   */
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

  /*
   * Ícono responsivo
   */
  const avatarSize = isSmallScreen
    ? 86
    : isTablet
      ? 120
      : 104;

  const shieldSize = isSmallScreen
    ? 45
    : isTablet
      ? 68
      : 56;

  const cardPaddingHorizontal = isSmallScreen
    ? 16
    : isTablet
      ? 34
      : 22;

  const handleVerify = async () => {
    try {
      setLoading(true);

      const user = await verifyUserUseCase.execute(
        username,
        email
      );

      console.log("USER VERIFY:", user);

      setProfile(user);
      setModalOpen(true);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (
    newPass: string,
    confirmPass: string
  ) => {
    if (!profile) return;

    try {
      await resetPasswordUseCase.execute({
        user: profile,
        newPassword: newPass,
        confirmPassword: confirmPass,
      });

      Alert.alert(
        "Listo",
        "Contraseña actualizada correctamente"
      );

      setModalOpen(false);

      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
              styles.container,
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
                  paddingTop: isLandscape
                    ? 4
                    : isTablet
                      ? 12
                      : 6,
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
                        ? 25
                        : 18,
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
                styles.recoveryCard,
                {
                  width: cardWidth,
                  marginTop: avatarSize / 2 + 14,
                  paddingTop:
                    avatarSize / 2 + 28,
                  paddingHorizontal:
                    cardPaddingHorizontal,
                  paddingBottom: isSmallScreen
                    ? 20
                    : 26,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarContainer,
                  {
                    top: -(avatarSize / 2),
                  },
                ]}
              >
                <View
                  style={[
                    styles.avatarBox,
                    {
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius:
                        avatarSize / 2,
                    },
                  ]}
                >
                  <FontAwesome6
                    name="shield-halved"
                    size={shieldSize}
                    color="#148248"
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.subtitle,
                  {
                    fontSize: isSmallScreen
                      ? 19
                      : isTablet
                        ? 25
                        : 22,
                  },
                ]}
              >
                Recupera tu contraseña
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    fontSize: isSmallScreen
                      ? 13
                      : 14,
                    marginBottom: isSmallScreen
                      ? 17
                      : 23,
                  },
                ]}
              >
                Ingresa tu usuario y correo
                electrónico para verificar tu
                identidad
              </Text>

              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>
                  Usuario
                </Text>

                <View
                  style={[
                    styles.inputBox,
                    isSmallScreen &&
                      styles.inputBoxSmall,
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons
                      name="account"
                      size={22}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu nombre completo"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>

                <Text style={styles.inputLabel}>
                  Correo electrónico
                </Text>

                <View
                  style={[
                    styles.inputBox,
                    isSmallScreen &&
                      styles.inputBoxSmall,
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <MaterialIcons
                      name="email"
                      size={21}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleVerify}
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
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <View
                    style={styles.loadingContent}
                  >
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.loadingText}
                    >
                      Verificando...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    Verificar
                  </Text>
                )}
              </TouchableOpacity>

              <View
                style={[
                  styles.separator,
                  isSmallScreen &&
                    styles.separatorSmall,
                ]}
              >
                <View
                  style={styles.separatorLine}
                />

                <View
                  style={styles.separatorLine}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.backButton,
                  isSmallScreen &&
                    styles.backButtonSmall,
                ]}
                onPress={() => router.back()}
                disabled={loading}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={21}
                  color="#148248"
                />

                <Text style={styles.backText}>
                  Volver al inicio de sesión
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <NewPasswordModal
            visible={modalOpen}
            loading={loading}
            onClose={() => setModalOpen(false)}
            onSubmit={handlePasswordChange}
          />
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

  container: {
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

  recoveryCard: {
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

  avatarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },

  avatarBox: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 5,
    borderColor: "#E8F3ED",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },

  subtitle: {
    textAlign: "center",
    lineHeight: 30,
    color: "#1F2937",
    fontWeight: "800",
    marginTop: 3,
  },

  description: {
    textAlign: "center",
    lineHeight: 21,
    color: "#6B7280",
    marginTop: 7,
    paddingHorizontal: 5,
  },

  formContainer: {
    width: "100%",
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 3,
    marginBottom: 7,
  },

  inputBox: {
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

  inputBoxSmall: {
    minHeight: 52,
    marginBottom: 14,
  },

  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F3ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
    flexShrink: 0,
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 8,
  },

  button: {
    width: "100%",
    minHeight: 54,
    backgroundColor: "#232323",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
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

  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },

  separatorSmall: {
    marginVertical: 16,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  backButton: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8F4",
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButtonSmall: {
    minHeight: 44,
  },
  backText: {
    flexShrink: 1,
    color: "#148248",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
    textAlign: "center",
  },
});