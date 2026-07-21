import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { EditMaterialUseCase } from "../../application/editMaterial";
import { GetMaterialByIdUseCase } from "../../application/getMaterialByIS";
import {
  Material,
  TipoMaterial,
} from "../../domain/material";
import { MaterialDataSource } from "../../infraestructure/materialesDatasource";

export default function EditMaterial() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  const repository = new MaterialDataSource();

  const getMaterialUseCase =
    new GetMaterialByIdUseCase(repository);

  const editMaterialUseCase =
    new EditMaterialUseCase(repository);

  const [nombreMaterial, setNombreMaterial] =
    useState("");

  const [unidad, setUnidad] =
    useState("");

  const [cantidad, setCantidad] =
    useState("");

  const [tipoMaterial, setTipoMaterial] =
    useState<TipoMaterial>("material");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
   * Valores utilizados únicamente para hacer
   * responsiva la interfaz.
   */
  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;
  const useTwoColumns = width >= 620;
  const verticalTypeButtons = width < 390;

  const headerHeight = isLandscape
    ? 105
    : isTablet
      ? 150
      : 120;

  const logoWidth = Math.min(
    width * (isTablet ? 0.44 : 0.58),
    isTablet ? 330 : 250
  );

  const logoHeight = isTablet ? 86 : 68;

  const formWidth = Math.max(
    280,
    Math.min(
      width - (isTablet ? 64 : 24),
      760
    )
  );

  useEffect(() => {
    loadMaterial();
  }, [id]);

  const loadMaterial = async () => {
    try {
      setLoading(true);

      const material =
        await getMaterialUseCase.execute(
          Number(id)
        );

      if (!material) {
        Alert.alert(
          "Error",
          "Material o herramienta no encontrado"
        );

        router.back();
        return;
      }

      setNombreMaterial(
        material.nombreMaterial
      );

      setUnidad(
        material.unidad ?? ""
      );

      setCantidad(
        String(material.cantidad ?? 0)
      );

      setTipoMaterial(
        material.tipoMaterial ?? "material"
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.detail ??
        error?.message ??
        "No se pudo cargar el registro"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const material: Material = {
        numMaterial: Number(id),
        nombreMaterial,
        unidad,
        cantidad: Number(cantidad || 0),
        tipoMaterial,
      };

      await editMaterialUseCase.execute(
        material
      );

      Alert.alert(
        "Éxito",
        tipoMaterial === "herramienta"
          ? "Herramienta actualizada correctamente"
          : "Material actualizado correctamente",
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
        error?.response?.data?.detail ??
        error?.message ??
        "No se pudo actualizar el registro"
      );
    } finally {
      setSaving(false);
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

      <View style={styles.screen}>
        {/* Encabezado */}
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
            style={styles.backBtn}
            onPress={() => router.back()}
            disabled={saving}
            activeOpacity={0.75}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
            accessibilityLabel="Regresar"
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
              height: logoHeight,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Contenido desplazable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet &&
            styles.scrollContentTablet,
            isSmallScreen &&
            styles.scrollContentSmall,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <View
            style={[
              styles.card,
              {
                width: formWidth,
              },
              isTablet && styles.cardTablet,
              isSmallScreen && styles.cardSmall,
            ]}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIcon}>
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={40}
                    color="#148248"
                  />
                </View>

                <ActivityIndicator
                  size="large"
                  color="#148248"
                />

                <Text style={styles.loadingTitle}>
                  Cargando registro
                </Text>

                <Text style={styles.loadingText}>
                  Estamos obteniendo la información
                  del material o herramienta.
                </Text>
              </View>
            ) : (
              <>
                {/* Presentación */}
                <View
                  style={styles.formIntroduction}
                >
                  <View
                    style={[
                      styles.formIconContainer,
                      isTablet &&
                      styles.formIconContainerTablet,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        tipoMaterial ===
                          "herramienta"
                          ? "tools"
                          : "package-variant-closed"
                      }
                      size={isTablet ? 36 : 31}
                      color="#148248"
                    />
                  </View>

                  <View
                    style={styles.introductionText}
                  >
                    <Text
                      style={styles.formDescription}
                    >
                      Actualiza la información del
                      material o herramienta.
                    </Text>

                    <View style={styles.codeBadge}>
                      <MaterialCommunityIcons
                        name="pound-box"
                        size={15}
                        color="#148248"
                      />

                      <Text
                        style={styles.codeBadgeText}
                      >
                        Número: {String(id)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Nombre */}
                <View style={styles.field}>
                  <Text style={styles.label}>
                    Nombre
                  </Text>

                  <View
                    style={styles.inputContainer}
                  >
                    <View
                      style={styles.inputIconBox}
                    >
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={21}
                        color="#148248"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Nombre del material o herramienta"
                      placeholderTextColor="#8A919C"
                      value={nombreMaterial}
                      onChangeText={
                        setNombreMaterial
                      }
                      editable={!saving}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Tipo */}
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
                        tipoMaterial ===
                        "material" &&
                        styles.typeButtonSelected,
                      ]}
                      onPress={() =>
                        setTipoMaterial("material")
                      }
                      disabled={saving}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.typeIconBox,
                          tipoMaterial ===
                          "material" &&
                          styles.typeIconBoxSelected,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="package-variant"
                          size={22}
                          color={
                            tipoMaterial ===
                              "material"
                              ? "#FFFFFF"
                              : "#148248"
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.typeButtonText,
                          tipoMaterial ===
                          "material" &&
                          styles.typeButtonTextSelected,
                        ]}
                      >
                        Material
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        tipoMaterial ===
                        "herramienta" &&
                        styles.typeButtonSelected,
                      ]}
                      onPress={() =>
                        setTipoMaterial(
                          "herramienta"
                        )
                      }
                      disabled={saving}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.typeIconBox,
                          tipoMaterial ===
                          "herramienta" &&
                          styles.typeIconBoxSelected,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="tools"
                          size={22}
                          color={
                            tipoMaterial ===
                              "herramienta"
                              ? "#FFFFFF"
                              : "#148248"
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.typeButtonText,
                          tipoMaterial ===
                          "herramienta" &&
                          styles.typeButtonTextSelected,
                        ]}
                      >
                        Herramienta
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Unidad y cantidad */}
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
                      Unidad
                    </Text>

                    <View
                      style={styles.inputContainer}
                    >
                      <View
                        style={styles.inputIconBox}
                      >
                        <MaterialCommunityIcons
                          name="ruler"
                          size={21}
                          color="#148248"
                        />
                      </View>

                      <TextInput
                        style={styles.input}
                        placeholder="Ejemplo: pieza, litro, kg"
                        placeholderTextColor="#8A919C"
                        value={unidad}
                        onChangeText={setUnidad}
                        editable={!saving}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Cantidad
                    </Text>

                    <View
                      style={styles.inputContainer}
                    >
                      <View
                        style={styles.inputIconBox}
                      >
                        <MaterialCommunityIcons
                          name="counter"
                          size={21}
                          color="#148248"
                        />
                      </View>

                      <TextInput
                        style={styles.input}
                        placeholder="Cantidad disponible"
                        placeholderTextColor="#8A919C"
                        keyboardType="numeric"
                        value={cantidad}
                        onChangeText={(text) =>
                          setCantidad(
                            text.replace(
                              /[^0-9]/g,
                              ""
                            )
                          )
                        }
                        editable={!saving}
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                </View>

                {/* Acciones */}
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
                      saving &&
                      styles.disabledButton,
                    ]}
                    onPress={handleUpdate}
                    disabled={saving}
                    activeOpacity={0.85}
                  >
                    {saving && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    )}

                    <Text
                      style={[
                        styles.buttonText,
                        saving && styles.buttonText,
                      ]}
                    >
                      {saving
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      useTwoColumns &&
                      styles.actionHorizontal,
                      useTwoColumns &&
                      styles.cancelButtonHorizontal,
                      saving &&
                      styles.disabledButton,
                    ]}
                    onPress={() => router.back()}
                    disabled={saving}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.buttonText}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
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
    backgroundColor:
      "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.16)",
    zIndex: 10,
  },

  headerDecorationOne: {
    position: "absolute",
    top: -55,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor:
      "rgba(255,255,255,0.07)",
  },

  headerDecorationTwo: {
    position: "absolute",
    bottom: -45,
    left: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  scrollView: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F1F5F3",
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 18,
    paddingBottom: 120,
  },

  scrollContentTablet: {
    paddingTop: 25,
  },

  scrollContentSmall: {
    paddingTop: 12,
  },

  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 22,
    padding: 22,

    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.09,
        shadowRadius: 10,
        shadowOffset: {
          width: 0,
          height: 4,
        },
      },
    }),
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

  codeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },

  codeBadgeText: {
    color: "#148248",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
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

  field: {
    flex: 1,
    minWidth: 0,
    marginBottom: 18,
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
    marginBottom: 10,
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

    shadowColor: "#148248",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
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
    backgroundColor:
      "rgba(255,255,255,0.16)",
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
    paddingVertical: 13,
    marginBottom: 12,

    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
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
    paddingVertical: 13,
    marginBottom: 12,

    shadowColor: "#870C0C",
    shadowOpacity: 0.17,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
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

  disabledButton: {
    opacity: 0.65,
  },

  loadingContainer: {
    minHeight: 310,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginBottom: 18,
  },

  loadingTitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14,
  },

  loadingText: {
    maxWidth: 340,
    color: "#737B87",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },
});