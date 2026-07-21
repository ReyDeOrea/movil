import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
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

import { TipoMaterial } from "../../domain/material";

interface Props {
  initialNumMaterial?: string;
  initialName?: string;
  initialQuantity?: string;
  initialUnit?: string;
  initialType?: TipoMaterial;

  onSubmit: (
    numMaterial: number,
    nombre: string,
    cantidad: number,
    unidad: string,
    tipoMaterial: TipoMaterial
  ) => void | Promise<void>;
}

export default function MaterialForm({
  initialNumMaterial = "",
  initialName = "",
  initialQuantity = "",
  initialUnit = "",
  initialType = "material",
  onSubmit,
}: Props) {
  const { width, height } = useWindowDimensions();

  const [numMaterial, setNumMaterial] =
    useState(initialNumMaterial);

  const [nombre, setNombre] =
    useState(initialName);

  const [cantidad, setCantidad] =
    useState(initialQuantity);

  const [unidad, setUnidad] =
    useState(initialUnit);

  const [tipoMaterial, setTipoMaterial] =
    useState<TipoMaterial>(initialType);

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;
  const useTwoColumns = width >= 620;
  const verticalTypeButtons = width < 390;

  const headerHeight = isLandscape
    ? 105
    : isTablet
      ? 145
      : 120;

  const logoWidth = Math.min(
    width * (isTablet ? 0.42 : 0.58),
    isTablet ? 320 : 250
  );

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
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={[
              styles.header,
              {
                height: headerHeight,
              },
            ]}
          >
            <View style={styles.headerDecorationOne} />
            <View style={styles.headerDecorationTwo} />

            <TouchableOpacity
              style={styles.backBtn}
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

            <Image
              source={require("../../../../../assets/images/ZUCARMEX.png")}
              style={{
                width: logoWidth,
                height: isTablet ? 85 : 68,
              }}
              resizeMode="contain"
            />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              isTablet && styles.scrollContentTablet,
              isSmallScreen && styles.scrollContentSmall,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.card,
                isTablet && styles.cardTablet,
                isSmallScreen && styles.cardSmall,
              ]}
            >
              <View style={styles.formIntroduction}>
                <View
                  style={[
                    styles.formIconContainer,
                    isTablet &&
                    styles.formIconContainerTablet,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      tipoMaterial === "herramienta"
                        ? "tools"
                        : "package-variant-closed"
                    }
                    size={isTablet ? 36 : 31}
                    color="#148248"
                  />
                </View>

                <View style={styles.introductionText}>
                  <Text style={styles.formDescription}>
                    Ingresa los datos para guardar el registro.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View
                style={[
                  styles.fieldsRow,
                  useTwoColumns &&
                  styles.fieldsRowHorizontal,
                ]}
              >
                <View
                  style={[
                    styles.field,
                    useTwoColumns &&
                    styles.leftField,
                  ]}
                >
                  <Text style={styles.label}>
                    Número
                  </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconBox}>
                      <MaterialCommunityIcons
                        name="pound-box" size={21}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      placeholder="Número de material o herramienta"
                      placeholderTextColor="#8A919C"
                      keyboardType="numeric"
                      value={numMaterial}
                      onChangeText={(text) =>
                        setNumMaterial(
                          text.replace(/[^0-9]/g, "")
                        )
                      }
                      style={styles.input}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Nombre
                  </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconBox}>
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={21}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      placeholder="Nombre"
                      placeholderTextColor="#8A919C"
                      value={nombre}
                      onChangeText={setNombre}
                      style={styles.input}
                      returnKeyType="next"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.typeSection}>
                <Text style={styles.label}>
                  Tipo de registro
                </Text>

                <View
                  style={[
                    styles.typeContainer,
                    verticalTypeButtons &&
                    styles.typeContainerVertical,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      !verticalTypeButtons &&
                      styles.typeButtonLeft,
                      tipoMaterial === "material" &&
                      styles.typeButtonSelected,
                    ]}
                    onPress={() =>
                      setTipoMaterial("material")
                    }
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.typeIconBox,
                        tipoMaterial === "material" &&
                        styles.typeIconBoxSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={22}
                        color={
                          tipoMaterial === "material"
                            ? "#FFFFFF"
                            : "#148248"
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.typeButtonText,
                        tipoMaterial === "material" &&
                        styles.typeButtonTextSelected,
                      ]}
                    >
                      Material
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      tipoMaterial === "herramienta" &&
                      styles.typeButtonSelected,
                    ]}
                    onPress={() =>
                      setTipoMaterial("herramienta")
                    }
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.typeIconBox,
                        tipoMaterial === "herramienta" &&
                        styles.typeIconBoxSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="tools"
                        size={22}
                        color={
                          tipoMaterial === "herramienta"
                            ? "#FFFFFF"
                            : "#148248"
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.typeButtonText,
                        tipoMaterial === "herramienta" &&
                        styles.typeButtonTextSelected,
                      ]}
                    >
                      Herramienta
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={[
                  styles.fieldsRow,
                  styles.secondFieldsRow,
                  useTwoColumns &&
                  styles.fieldsRowHorizontal,
                ]}
              >
                <View
                  style={[
                    styles.field,
                    useTwoColumns &&
                    styles.leftField,
                  ]}
                >
                  <Text style={styles.label}>
                    Cantidad
                  </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconBox}>
                      <MaterialCommunityIcons
                        name="counter"
                        size={21}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      placeholder="Cantidad"
                      placeholderTextColor="#8A919C"
                      value={cantidad}
                      onChangeText={(text) =>
                        setCantidad(
                          text.replace(/[^0-9]/g, "")
                        )
                      }
                      keyboardType="numeric"
                      style={styles.input}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Unidad
                  </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconBox}>
                      <MaterialCommunityIcons
                        name="ruler"
                        size={21}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      placeholder="Ejemplo: pieza, litro, kg"
                      placeholderTextColor="#8A919C"
                      value={unidad}
                      onChangeText={setUnidad}
                      style={styles.input}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.actionsContainer,
                  useTwoColumns &&
                  styles.actionsHorizontal,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    useTwoColumns &&
                    styles.actionHorizontal,
                  ]}
                  onPress={() =>
                    onSubmit(
                      Number(numMaterial),
                      nombre,
                      Number(cantidad || 0),
                      unidad,
                      tipoMaterial
                    )
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>
                    Guardar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    useTwoColumns &&
                    styles.actionHorizontal,
                    useTwoColumns &&
                    styles.cancelButtonHorizontal,
                  ]}
                  onPress={() => router.back()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "#148248",
  },

  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  header: {
    width: "100%",
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#148248",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",

    shadowColor: "#148248",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 6,
  },

  backBtn: {
    position: "absolute",
    left: 14,
    top: "50%",
    width: 44,
    height: 44,
    marginTop: -22,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    zIndex: 10,
  },

  headerDecorationOne: {
    position: "absolute",
    top: -55,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  headerDecorationTwo: {
    position: "absolute",
    bottom: -45,
    left: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  scrollView: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F1F5F3",
  },

  scrollContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 35,
  },

  scrollContentTablet: {
    paddingHorizontal: 32,
    paddingTop: 25,
  },

  scrollContentSmall: {
    paddingTop: 12,
    paddingBottom: 25,
  },

  card: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 22,
    padding: 22,

    shadowColor: "#000000",
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  cardSmall: {
    padding: 16,
    borderRadius: 18,
  },

  cardTablet: {
    padding: 30,
    borderRadius: 26,
  },

  formIntroduction: {
  width: "100%",
  alignItems: "center",
},

formIconContainer: {
  width: 61,
  height: 61,
  borderRadius: 19,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#E8F3ED",
  borderWidth: 1,
  borderColor: "#D7EADF",
  marginBottom: 10,
  flexShrink: 0,
},


  formIconContainerTablet: {
    width: 70,
    height: 70,
    borderRadius: 22,
  },

 introductionText: {
  width: "100%",
  alignItems: "center",
},
  formTitle: {
    color: "#26322C",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
  },

  formTitleTablet: {
    fontSize: 23,
    lineHeight: 28,
  },

  formDescription: {
  color: "#727C76",
  fontSize: 13,
  lineHeight: 19,
  textAlign: "center",
},
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E8EEEA",
    marginTop: 18,
    marginBottom: 20,
  },

  fieldsRow: {
    width: "100%",
  },

  fieldsRowHorizontal: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  secondFieldsRow: {
    marginTop: 9,
  },

  field: {
    flex: 1,
    minWidth: 0,
    marginBottom: 17,
  },

  leftField: {
    marginRight: 14,
  },

  label: {
    color: "#46524C",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  inputContainer: {
    width: "100%",
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FBFA",
    borderWidth: 1,
    borderColor: "#DDE5E0",
    borderRadius: 15,
    paddingHorizontal: 10,
  },

  inputIconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 53,
    color: "#26322C",
    fontSize: 15,
    fontWeight: "500",
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  typeSection: {
    width: "100%",
  },

  typeContainer: {
    width: "100%",
    flexDirection: "row",
  },

  typeContainerVertical: {
    flexDirection: "column",
  },

  typeButton: {
    flex: 1,
    minHeight: 58,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#D9E3DD",
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 9,
  },

  typeButtonLeft: {
    marginRight: 10,
  },

  typeButtonSelected: {
    backgroundColor: "#148248",
    borderColor: "#148248",
    elevation: 2,
  },

  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5F2EA",
    marginRight: 9,
  },

  typeIconBoxSelected: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  typeButtonText: {
    color: "#148248",
    fontSize: 14,
    fontWeight: "800",
  },

  typeButtonTextSelected: {
    color: "#FFFFFF",
  },

  actionsContainer: {
    width: "100%",
    marginTop: 10,
  },

  actionsHorizontal: {
    flexDirection: "row",
  },

  actionHorizontal: {
    flex: 1,
  },

  saveButton: {
    minHeight: 54,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    elevation: 3,
  },

  cancelButton: {
    minHeight: 54,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870C0C",
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    elevation: 3,
  },

  cancelButtonHorizontal: {
    marginLeft: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },
});