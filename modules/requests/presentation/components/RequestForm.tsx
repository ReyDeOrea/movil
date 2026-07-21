import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { CreateRequestUseCase } from "../../application/create";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();
const createRequest = new CreateRequestUseCase(repository);

export default function RequestForm() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [numTipo, setNumTipo] = useState("");
  const [numTipoMantenimiento, setNumTipoMantenimiento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [numArea, setNumArea] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [fecha] = useState(new Date().toLocaleDateString("en-CA"));
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isSmallScreen = width < 370 || height < 650;
  const isTablet = width >= 700;
  const isLandscape = width > height;
  const useTwoColumns = isTablet || (isLandscape && width >= 620);

  const contentWidth = Math.max(
    280,
    Math.min(width - (isTablet ? 64 : 24), 900)
  );

  const previewSize = isTablet ? 142 : isSmallScreen ? 98 : 112;
  const logoWidth = isTablet ? 195 : isSmallScreen ? 132 : 160;

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");

        if (userData) {
          const user = JSON.parse(userData);
          setNombreUsuario(user.nombre);
        }
      } catch (error) {
        console.log("Error cargando usuario:", error);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    if (numTipo !== "2") {
      setNumTipoMantenimiento("");
    }
  }, [numTipo]);

  const seleccionarImagenes = async () => {
    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Debes permitir acceso a tus fotos para seleccionar evidencias."
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        selectionLimit: 0,
        quality: 1,
      });

      if (resultado.canceled) return;

      const nuevasImagenes = resultado.assets
        .map((asset) => asset.uri)
        .filter((uri) => uri && uri.length > 0);

      if (nuevasImagenes.length === 0) {
        Alert.alert("Error", "No se pudo obtener ninguna imagen.");
        return;
      }

      setImagenes((prev) => {
        const imagenesSinRepetir = nuevasImagenes.filter(
          (uri) => !prev.includes(uri)
        );

        return [...prev, ...imagenesSinRepetir];
      });
    } catch (error) {
      console.log("Error real seleccionando imágenes:", error);

      Alert.alert(
        "Error",
        "No se pudieron seleccionar las imágenes."
      );
    }
  };

  const eliminarImagen = (uri: string) => {
    setImagenes((prev) => prev.filter((img) => img !== uri));
  };

  const enviarSolicitud = async () => {
    if (loading) return;

    if (!numTipo) {
      Alert.alert("Campo requerido", "Selecciona el tipo de solicitud.");
      return;
    }

    if (numTipo === "2" && !numTipoMantenimiento) {
      Alert.alert(
        "Campo requerido",
        "Selecciona el tipo de mantenimiento."
      );
      return;
    }

    if (!numArea) {
      Alert.alert("Campo requerido", "Selecciona el área.");
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert("Campo requerido", "Escribe una descripción.");
      return;
    }

    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem("user");

      if (!userData) {
        Alert.alert("Error", "No se encontró la sesión del usuario.");
        return;
      }

      const user = JSON.parse(userData);

      await createRequest.execute(
        {
          numSolicitante: user.numUsuario,
          fecha: fecha,
          numTipo: Number(numTipo),
          numTipoMantenimiento:
            numTipo === "2" && numTipoMantenimiento
              ? Number(numTipoMantenimiento)
              : undefined,
          numArea: Number(numArea),
          descripcion: descripcion.trim(),
        },
        imagenes,
        "solicitante"
      );

      Alert.alert("Éxito", "Solicitud enviada correctamente.");
      router.replace("/requests");
    } catch (error: any) {
      console.log("Error enviando solicitud:", error);

      Alert.alert(
        "Error",
        error.message || "No se pudo enviar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          <View
            style={[
              styles.header,
              isTablet && styles.headerTablet,
              isSmallScreen && styles.headerSmall,
            ]}
          >
            <View style={styles.headerDecorationOne} />
            <View style={styles.headerDecorationTwo} />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
              accessibilityLabel="Regresar"
              disabled={loading}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={25}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Image
                source={require("../../../../assets/images/ZUCARMEX.png")}
                style={[
                  styles.imageZucarmex,
                  {
                    width: logoWidth,
                  },
                ]}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.scrollContent,
              isTablet && styles.scrollContentTablet,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.content, { width: contentWidth }]}>

              <View style={styles.formCard}>
                <View style={styles.introCenteredContainer}>
                  <View style={styles.introIconBox}>
                    <MaterialCommunityIcons
                      name="clipboard-plus-outline"
                      size={29}
                      color="#148248"
                    />
                  </View>

                  <Text style={styles.introTitle}>Nueva solicitud</Text>

                  <Text style={styles.introSubtitle}>
                    Ingrese la información necesaria para enviar la solicitud
                  </Text>
                </View>

                <View
                  style={[
                    styles.fieldsRow,
                    useTwoColumns && styles.fieldsRowColumns,
                  ]}
                >
                  <View
                    style={[
                      styles.fieldGroup,
                      useTwoColumns && styles.fieldHalf,
                      useTwoColumns && styles.fieldSpacingRight,
                    ]}
                  >
                    <View style={styles.labelRow}>
                      <MaterialCommunityIcons
                        name="calendar-outline"
                        size={17}
                        color="#148248"
                      />
                      <Text style={styles.label}>Fecha</Text>
                    </View>

                    <View style={styles.disabledField}>
                      <TextInput
                        style={styles.disabledInput}
                        editable={false}
                        value={fecha}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.fieldGroup,
                      useTwoColumns && styles.fieldHalf,
                    ]}
                  >
                    <View style={styles.labelRow}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={17}
                        color="#148248"
                      />
                      <Text style={styles.label}>Solicitante</Text>
                    </View>

                    <View style={styles.disabledField}>
                      <TextInput
                        style={styles.disabledInput}
                        editable={false}
                        value={nombreUsuario}
                      />
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.fieldsRow,
                    numTipo === "2" &&
                    useTwoColumns &&
                    styles.fieldsRowColumns,
                  ]}
                >
                  <View
                    style={[
                      styles.fieldGroup,
                      numTipo === "2" && useTwoColumns && styles.fieldHalf,
                      numTipo === "2" &&
                      useTwoColumns &&
                      styles.fieldSpacingRight,
                    ]}
                  >
                    <View style={styles.labelRow}>
                      <MaterialCommunityIcons
                        name="clipboard-text-outline"
                        size={17}
                        color="#148248"
                      />
                      <Text style={styles.label}>Tipo de solicitud</Text>
                    </View>

                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={numTipo}
                        onValueChange={(itemValue) =>
                          setNumTipo(String(itemValue))
                        }
                        style={styles.picker}
                        dropdownIconColor="#148248"
                        enabled={!loading}
                      >
                        <Picker.Item
                          label="Seleccione..."
                          value=""
                          enabled={false}
                          color="#999999"
                        />
                        <Picker.Item label="Servicio" value="1" />
                        <Picker.Item label="Mantenimiento" value="2" />
                      </Picker>
                    </View>
                  </View>

                  {numTipo === "2" && (
                    <View
                      style={[
                        styles.fieldGroup,
                        useTwoColumns && styles.fieldHalf,
                      ]}
                    >
                      <View style={styles.labelRow}>
                        <MaterialCommunityIcons
                          name="wrench-clock-outline"
                          size={17}
                          color="#148248"
                        />
                        <Text style={styles.label}>
                          Tipo de mantenimiento
                        </Text>
                      </View>

                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={numTipoMantenimiento}
                          onValueChange={(itemValue) =>
                            setNumTipoMantenimiento(String(itemValue))
                          }
                          style={styles.picker}
                          dropdownIconColor="#148248"
                          enabled={!loading}
                        >
                          <Picker.Item
                            label="Seleccione..."
                            value=""
                            enabled={false}
                            color="#999999"
                          />
                          <Picker.Item label="Preventivo" value="1" />
                          <Picker.Item label="Correctivo" value="2" />
                          <Picker.Item label="Reactivo" value="3" />
                        </Picker>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={17}
                      color="#148248"
                    />
                    <Text style={styles.label}>Área</Text>
                  </View>

                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={numArea}
                      onValueChange={(itemValue) =>
                        setNumArea(String(itemValue))
                      }
                      style={styles.picker}
                      dropdownIconColor="#148248"
                      enabled={!loading}
                    >
                      <Picker.Item
                        label="Seleccione un área..."
                        value=""
                        enabled={false}
                        color="#999999"
                      />
                      <Picker.Item label="Administración" value="1" />
                      <Picker.Item label="Fábrica" value="2" />
                      <Picker.Item label="Campo" value="3" />
                      <Picker.Item label="Zona habitacional" value="4" />
                    </Picker>
                  </View>
                </View>

                <View style={[styles.fieldGroup, styles.fieldGroupLast]}>
                  <View style={styles.labelRow}>
                    <MaterialCommunityIcons
                      name="text-box-outline"
                      size={17}
                      color="#148248"
                    />
                    <Text style={styles.label}>Descripción</Text>
                  </View>

                  <TextInput
                    style={[
                      styles.textArea,
                      isSmallScreen && styles.textAreaSmall,
                    ]}
                    multiline
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Describe la solicitud..."
                    placeholderTextColor="#929B96"
                    textAlignVertical="top"
                    editable={!loading}
                  />

                  <Text style={styles.helperText}>
                    Describe con claridad el servicio o mantenimiento que necesitas.
                  </Text>
                </View>
              </View>

              <View style={styles.evidenceCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBox}>
                    <MaterialCommunityIcons
                      name="image-multiple-outline"
                      size={22}
                      color="#148248"
                    />
                  </View>

                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Evidencias</Text>
                    <Text style={styles.sectionSubtitle}>
                      Puedes seleccionar una o varias imágenes.
                    </Text>
                  </View>

                  {imagenes.length > 0 && (
                    <View style={styles.evidenceCountBadge}>
                      <Text style={styles.evidenceCountText}>
                        {imagenes.length}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.imagePickerButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={seleccionarImagenes}
                  activeOpacity={0.83}
                  disabled={loading}
                  accessibilityLabel="Seleccionar imágenes"
                >
                  <View style={styles.imagePickerIconBox}>
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={27}
                      color="#148248"
                    />
                  </View>

                  <View style={styles.imagePickerTextContainer}>
                    <Text style={styles.imagePickerTitle}>
                      Seleccionar imágenes
                    </Text>
                    <Text style={styles.imagePickerSubtitle}>
                      Elige evidencias desde la galería
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={25}
                    color="#148248"
                  />
                </TouchableOpacity>

                {imagenes.length > 0 ? (
                  <>
                    <View style={styles.imagesGrid}>
                      {imagenes.map((img, index) => (
                        <View
                          key={img}
                          style={[
                            styles.imageContainer,
                            {
                              width: previewSize,
                              height: previewSize,
                            },
                          ]}
                        >
                          <Image
                            source={{ uri: img }}
                            style={styles.previewImage}
                            resizeMode="cover"
                          />

                          <View style={styles.imageNumberBadge}>
                            <Text style={styles.imageNumberText}>
                              {index + 1}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => eliminarImagen(img)}
                            activeOpacity={0.8}
                            disabled={loading}
                            accessibilityLabel={`Eliminar imagen ${index + 1}`}
                          >
                            <MaterialCommunityIcons
                              name="close"
                              size={18}
                              color="#FFFFFF"
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>

                    <Text style={styles.selectedImagesText}>
                      {imagenes.length}{" "}
                      {imagenes.length === 1
                        ? "imagen seleccionada"
                        : "imágenes seleccionadas"}
                    </Text>
                  </>
                ) : (
                  <View style={styles.emptyEvidenceBox}>
                    <MaterialCommunityIcons
                      name="image-outline"
                      size={38}
                      color="#A0AAA5"
                    />
                    <Text style={styles.emptyEvidenceTitle}>
                      Sin evidencias seleccionadas
                    </Text>
                    <Text style={styles.emptyEvidenceText}>
                      Las imágenes que agregues aparecerán aquí.
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.actionsContainer,
                  useTwoColumns && styles.actionsContainerRow,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    useTwoColumns && styles.actionButtonHalf,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={enviarSolicitud}
                  disabled={loading}
                  activeOpacity={0.84}
                  accessibilityLabel="Enviar solicitud"
                >
                  {loading ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.actionButtonText}>Enviando...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.actionButtonText}>
                        Enviar solicitud
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    useTwoColumns && styles.actionButtonHalf,
                    useTwoColumns && styles.cancelButtonRow,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={() => router.back()}
                  disabled={loading}
                  activeOpacity={0.84}
                  accessibilityLabel="Cancelar"
                >
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  android: {
    elevation: 3,
  },
  ios: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#148248",
  },

  keyboardView: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  header: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#148248",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  headerTablet: {
    minHeight: 96,
    paddingHorizontal: 28,
  },

  headerSmall: {
    minHeight: 76,
    paddingVertical: 8,
  },

  headerDecorationOne: {
    position: "absolute",
    top: -55,
    right: -28,
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  headerDecorationTwo: {
    position: "absolute",
    bottom: -48,
    left: 72,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    zIndex: 2,
  },

  headerCenter: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  imageZucarmex: {
    height: 58,
  },

  container: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 48,
  },

  scrollContentTablet: {
    paddingTop: 22,
    paddingBottom: 70,
  },

  content: {
    alignSelf: "center",
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    ...cardShadow,
  },

  introCenteredContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
    marginBottom: 22,
  },

  introIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginBottom: 10,
    flexShrink: 0,
  },

  introTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  introTitle: {
    color: "#243029",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    textAlign: "center",
  },

  introSubtitle: {
    maxWidth: 360,
    color: "#748079",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 3,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },

  evidenceCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  sectionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
    flexShrink: 0,
  },

  sectionTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color: "#27332D",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#7A847F",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    marginTop: 2,
  },

  fieldsRow: {
    width: "100%",
  },

  fieldsRowColumns: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  fieldGroup: {
    width: "100%",
    marginBottom: 15,
  },

  fieldGroupLast: {
    marginBottom: 0,
  },

  fieldHalf: {
    flex: 1,
    width: undefined,
  },

  fieldSpacingRight: {
    marginRight: 12,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  label: {
    color: "#3F4A44",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    marginLeft: 6,
  },

  disabledField: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2EF",
    borderWidth: 1,
    borderColor: "#D8E0DC",
    borderRadius: 13,
    paddingHorizontal: 12,
  },

  disabledInput: {
    flex: 1,
    minWidth: 0,
    color: "#66716B",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },

  pickerContainer: {
    minHeight: 52,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3DF",
    borderRadius: 13,
  },

  picker: {
    color: "#27332D",
    backgroundColor: "transparent",
  },

  textArea: {
    minHeight: 132,
    color: "#27332D",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3DF",
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 12,
  },

  textAreaSmall: {
    minHeight: 112,
  },

  helperText: {
    color: "#87918C",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },

  evidenceCountBadge: {
    minWidth: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#148248",
    borderRadius: 14,
    paddingHorizontal: 7,
    marginLeft: 8,
  },

  evidenceCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  imagePickerButton: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F4",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#9ECAB3",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  imagePickerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginRight: 11,
    flexShrink: 0,
  },

  imagePickerTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  imagePickerTitle: {
    color: "#148248",
    fontSize: 14,
    fontWeight: "800",
  },

  imagePickerSubtitle: {
    color: "#718078",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    marginRight: -9,
    marginBottom: -9,
  },

  imageContainer: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#EEF2F0",
    borderWidth: 1,
    borderColor: "#DDE5E1",
    borderRadius: 14,
    marginRight: 9,
    marginBottom: 9,
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  imageNumberBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(20,130,72,0.9)",
    borderRadius: 12,
    paddingHorizontal: 5,
  },

  imageNumberText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870C0C",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  selectedImagesText: {
    color: "#69756F",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 13,
  },

  emptyEvidenceBox: {
    minHeight: 135,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E5EAE7",
    borderRadius: 14,
    paddingHorizontal: 18,
    marginTop: 15,
  },

  emptyEvidenceTitle: {
    color: "#626E68",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
  },

  emptyEvidenceText: {
    color: "#8A948F",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 3,
  },

  actionsContainer: {
    width: "100%",
    marginTop: 2,
  },

  actionsContainerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButtonHalf: {
    flex: 1,
  },

  submitButton: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 10,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.17,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  cancelButton: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870C0C",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 10,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#500505",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  cancelButtonRow: {
    marginLeft: 12,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  buttonDisabled: {
    opacity: 0.62,
  },
});