import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
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

import { loginUser } from "../../application/loginUser";
import { validateLoginData } from "../../application/validateLogin";

export default function LoginForm() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
   * Banner verde compacto.
   */
  const headerHeight = isLandscape
    ? 120
    : isSmallScreen
      ? 130
      : isTablet
        ? 170
        : 145;

  /*
   * Logo grande, pero limitado para evitar que se corte.
   */
  const logoWidth = Math.min(
    width * (isTablet ? 0.44 : 0.65),
    isTablet ? 340 : 290
  );

  const logoHeight = isLandscape
    ? 68
    : isSmallScreen
      ? 70
      : isTablet
        ? 94
        : 82;

  const avatarSize = isSmallScreen
    ? 86
    : isTablet
      ? 120
      : 104;

  const avatarIconSize = isSmallScreen
    ? 70
    : isTablet
      ? 100
      : 86;

  const cardPaddingHorizontal = isSmallScreen
    ? 16
    : isTablet
      ? 34
      : 22;

  const handleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();

      setEmail(cleanEmail);

      validateLoginData(cleanEmail, password);

      const user = await loginUser(cleanEmail, password);

      console.log("USER:", user);

      router.replace("/requests");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.message ?? "No se pudo iniciar sesión"
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.screen}
            contentContainerStyle={[
              styles.container,
              {
                minHeight: height,
                paddingBottom: isSmallScreen ? 20 : 36,
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
              <View style={styles.headerDecorationOne} />
              <View style={styles.headerDecorationTwo} />

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
                styles.loginCard,
                {
                  width: cardWidth,
                  marginTop: avatarSize / 2 + 14,
                  paddingTop: avatarSize / 2 + 28,
                  paddingHorizontal: cardPaddingHorizontal,
                  paddingBottom: isSmallScreen ? 20 : 26,
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
                      borderRadius: avatarSize / 2,
                    },
                  ]}
                >
                  <FontAwesome
                    name="user-circle-o"
                    size={avatarIconSize}
                    color="#C5CBC8"
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.welcomeTitle,
                  {
                    fontSize: isSmallScreen
                      ? 19
                      : isTablet
                        ? 25
                        : 22,
                  },
                ]}
              >
                ¡Bienvenido a ZucarService!
              </Text>

              <Text
                style={[
                  styles.welcomeSubtitle,
                  {
                    fontSize: isSmallScreen ? 13 : 14,
                    marginBottom: isSmallScreen ? 17 : 23,
                  },
                ]}
              >
                Ingresa tus datos para acceder a tu cuenta
              </Text>

              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>
                  Correo electrónico
                </Text>

                <View
                  style={[
                    styles.inputBox,
                    isSmallScreen && styles.inputBoxSmall,
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <FontAwesome
                      name="envelope"
                      size={19}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>

                <Text style={styles.inputLabel}>
                  Contraseña
                </Text>

                <View
                  style={[
                    styles.inputBox,
                    isSmallScreen && styles.inputBoxSmall,
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <MaterialIcons
                      name="password"
                      size={22}
                      color="#148248"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  isSmallScreen && styles.buttonSmall,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text style={styles.loadingText}>
                      Ingresando...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    Iniciar sesión
                  </Text>
                )}
              </TouchableOpacity>

              <View
                style={[
                  styles.separator,
                  isSmallScreen && styles.separatorSmall,
                ]}
              >
                <View style={styles.separatorLine} />
                <View style={styles.separatorLine} />
              </View>

              <TouchableOpacity
                style={[
                  styles.recoveryButton,
                  isSmallScreen && styles.recoveryButtonSmall,
                ]}
                onPress={() => router.push("/password")}
                disabled={loading}
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name="shield-halved"
                  size={19}
                  color="#148248"
                />

                <Text
                  style={[
                    styles.recoveryText,
                    isSmallScreen && styles.recoveryTextSmall,
                  ]}
                  numberOfLines={2}
                >
                  ¿Olvidaste tu contraseña?
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

  headerDecorationOne: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -55,
    right: -30,
  },

  headerDecorationTwo: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -45,
    left: -25,
  },

  loginCard: {
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
    overflow: "hidden",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },

  welcomeTitle: {
    textAlign: "center",
    lineHeight: 30,
    color: "#1F2937",
    fontWeight: "800",
    marginTop: 3,
  },

  welcomeSubtitle: {
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
  recoveryButton: {
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

  recoveryButtonSmall: {
    minHeight: 44,
  },

  recoveryText: {
    flexShrink: 1,
    color: "#148248",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
    textAlign: "center",
  },

  recoveryTextSmall: {
    fontSize: 13,
  },
});