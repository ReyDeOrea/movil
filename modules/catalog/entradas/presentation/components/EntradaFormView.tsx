import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Material } from "../../../materiales/domain/material";
import { TecnicoExterno } from "../../../proveedores/domain/proveedor";

export interface EntradaFormValues {
  materialSeleccionado: Material | null;
  tecnicoSeleccionado: TecnicoExterno | null;
  cantidad: string;
  observaciones: string;
}

interface EntradaFormViewProps {
  materiales: Material[];
  tecnicos: TecnicoExterno[];
  initialValues?: EntradaFormValues;
  saving?: boolean;
  submitText: string;
  onSubmit: (
    values: EntradaFormValues
  ) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: EntradaFormValues = {
  materialSeleccionado: null,
  tecnicoSeleccionado: null,
  cantidad: "",
  observaciones: "",
};

export default function EntradaFormView({
  materiales,
  tecnicos,
  initialValues = EMPTY_VALUES,
  saving = false,
  submitText,
  onSubmit,
  onCancel,
}: EntradaFormViewProps) {
  const { width, height } = useWindowDimensions();

  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(
      initialValues.materialSeleccionado
    );

  const [tecnicoSeleccionado, setTecnicoSeleccionado] =
    useState<TecnicoExterno | null>(
      initialValues.tecnicoSeleccionado
    );

  const [cantidad, setCantidad] =
    useState(initialValues.cantidad);

  const [observaciones, setObservaciones] =
    useState(initialValues.observaciones);

  const [
    modalMaterialesVisible,
    setModalMaterialesVisible,
  ] = useState(false);

  const [
    modalTecnicosVisible,
    setModalTecnicosVisible,
  ] = useState(false);

  const [
    busquedaMaterial,
    setBusquedaMaterial,
  ] = useState("");

  const [
    busquedaTecnico,
    setBusquedaTecnico,
  ] = useState("");

  /*
   * Valores utilizados únicamente para
   * adaptar la presentación.
   */
  const isSmallScreen =
    width < 380 || height < 650;

  const isTablet = width >= 700;
  const useTwoColumns = width >= 620;
  const horizontalButtons = width >= 500;

  const modalWidth = Math.max(
    280,
    Math.min(
      width - (isTablet ? 96 : 16),
      720
    )
  );

  useEffect(() => {
    setMaterialSeleccionado(
      initialValues.materialSeleccionado
    );

    setTecnicoSeleccionado(
      initialValues.tecnicoSeleccionado
    );

    setCantidad(initialValues.cantidad);

    setObservaciones(
      initialValues.observaciones
    );
  }, [initialValues]);

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const materialesFiltrados = useMemo(() => {
    const search = normalizeText(
      busquedaMaterial
    );

    if (!search) {
      return materiales;
    }

    return materiales.filter((material) => {
      const nombre = normalizeText(
        material.nombreMaterial ?? ""
      );

      const codigo = String(
        material.numMaterial ?? ""
      );

      return (
        nombre.includes(search) ||
        codigo.includes(search)
      );
    });
  }, [busquedaMaterial, materiales]);

  const tecnicosFiltrados = useMemo(() => {
    const search = normalizeText(
      busquedaTecnico
    );

    if (!search) {
      return tecnicos;
    }

    return tecnicos.filter((tecnico) => {
      const nombre = normalizeText(
        tecnico.nombre ?? ""
      );

      const empresa = normalizeText(
        tecnico.empresa ?? ""
      );

      return (
        nombre.includes(search) ||
        empresa.includes(search)
      );
    });
  }, [busquedaTecnico, tecnicos]);

  const handleSubmit = async () => {
    if (!materialSeleccionado) {
      Alert.alert(
        "Campo obligatorio",
        "Selecciona un material o herramienta"
      );

      return;
    }

    const cantidadNumerica = Number(cantidad);

    if (
      !cantidad.trim() ||
      Number.isNaN(cantidadNumerica) ||
      cantidadNumerica <= 0
    ) {
      Alert.alert(
        "Campo obligatorio",
        "Ingresa una cantidad mayor a 0"
      );

      return;
    }

    await onSubmit({
      materialSeleccionado,
      tecnicoSeleccionado,
      cantidad: cantidad.trim(),
      observaciones: observaciones.trim(),
    });
  };

  return (
    <>
      <View
        style={[
          styles.formCard,
          isSmallScreen && styles.formCardSmall,
          isTablet && styles.formCardTablet,
        ]}
      >
        {/* Presentación */}
        <View style={styles.formHeader}>
          <View
            style={[
              styles.formHeaderIcon,
              isTablet &&
              styles.formHeaderIconTablet,
            ]}
          >
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={isTablet ? 36 : 31}
              color="#148248"
            />
          </View>

          <View style={styles.formHeaderText}>

            <Text style={styles.formDescription}>
              Selecciona el material o herramienta e ingresa la
              cantidad y el técnico externo
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Material */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Material o herramienta
          </Text>

          <TouchableOpacity
            style={[
              styles.selector,
              materialSeleccionado &&
              styles.selectorSelected,
            ]}
            onPress={() =>
              setModalMaterialesVisible(true)
            }
            disabled={saving}
            activeOpacity={0.8}
          >
            <View style={styles.selectorIconBox}>
              <MaterialCommunityIcons
                name={
                  materialSeleccionado
                    ?.tipoMaterial === "herramienta"
                    ? "tools"
                    : "package-variant"
                }
                size={22}
                color="#148248"
              />
            </View>

            <Text
              style={[
                styles.selectorText,
                !materialSeleccionado &&
                styles.placeholderText,
              ]}
              numberOfLines={2}
            >
              {materialSeleccionado
                ? `${materialSeleccionado.nombreMaterial} (${materialSeleccionado.numMaterial})`
                : "Selecciona un material o herramienta"}
            </Text>

            <MaterialCommunityIcons
              name="chevron-down"
              size={25}
              color="#748079"
            />
          </TouchableOpacity>

          {materialSeleccionado && (
            <View
              style={[
                styles.materialInformation,
                isSmallScreen &&
                styles.materialInformationSmall,
              ]}
            >
              <View
                style={[
                  styles.informationItem,
                  !isSmallScreen &&
                  styles.informationItemLeft,
                ]}
              >
                <View style={styles.informationIcon}>
                  <MaterialCommunityIcons
                    name={
                      materialSeleccionado.tipoMaterial ===
                        "herramienta"
                        ? "tools"
                        : "package-variant"
                    }
                    size={18}
                    color="#148248"
                  />
                </View>

                <View style={styles.informationText}>
                  <Text
                    style={styles.informationLabel}
                  >
                    Tipo
                  </Text>

                  <Text
                    style={styles.informationValue}
                  >
                    {materialSeleccionado.tipoMaterial ===
                      "herramienta"
                      ? "Herramienta"
                      : "Material"}
                  </Text>
                </View>
              </View>

              <View style={styles.informationItem}>
                <View style={styles.informationIcon}>
                  <MaterialCommunityIcons
                    name="warehouse"
                    size={18}
                    color="#148248"
                  />
                </View>

                <View style={styles.informationText}>
                  <Text
                    style={styles.informationLabel}
                  >
                    Stock actual
                  </Text>

                  <Text
                    style={styles.informationValue}
                    numberOfLines={1}
                  >
                    {materialSeleccionado.cantidad ?? 0}{" "}
                    {materialSeleccionado.unidad ?? ""}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Cantidad y técnico */}
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
              styles.quantityField,
            ]}
          >
            <Text style={styles.label}>
              Cantidad de entrada
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
                style={styles.input}
                placeholder="Cantidad"
                placeholderTextColor="#8A919C"
                keyboardType="numeric"
                value={cantidad}
                editable={!saving}
                onChangeText={(text) => {
                  setCantidad(
                    text.replace(/[^0-9]/g, "")
                  );
                }}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Técnico externo / empresa
            </Text>

            <TouchableOpacity
              style={[
                styles.selector,
                tecnicoSeleccionado &&
                styles.selectorSelected,
              ]}
              onPress={() =>
                setModalTecnicosVisible(true)
              }
              disabled={saving}
              activeOpacity={0.8}
            >
              <View style={styles.selectorIconBox}>
                <MaterialCommunityIcons
                  name="account-hard-hat-outline"
                  size={22}
                  color="#148248"
                />
              </View>

              <Text
                style={[
                  styles.selectorText,
                  !tecnicoSeleccionado &&
                  styles.placeholderText,
                ]}
                numberOfLines={2}
              >
                {tecnicoSeleccionado
                  ? `${tecnicoSeleccionado.nombre} - ${tecnicoSeleccionado.empresa ??
                  "Sin empresa"
                  }`
                  : "Sin técnico externo"}
              </Text>

              <MaterialCommunityIcons
                name="chevron-down"
                size={25}
                color="#748079"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comentarios */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Comentarios
          </Text>

          <View
            style={styles.textAreaContainer}
          >
            <View style={styles.textAreaIcon}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={21}
                color="#148248"
              />
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Escriba sus comentarios"
              placeholderTextColor="#8A919C"
              value={observaciones}
              editable={!saving}
              onChangeText={setObservaciones}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Acciones */}
        <View
          style={[
            styles.actions,
            horizontalButtons &&
            styles.actionsHorizontal,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              horizontalButtons &&
              styles.actionHorizontal,
              saving && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
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
              {saving ? "Guardando..." : submitText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cancelButton,
              horizontalButtons &&
              styles.actionHorizontal,
              horizontalButtons &&
              styles.cancelButtonHorizontal,
              saving && styles.buttonDisabled,
            ]}
            onPress={onCancel}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de materiales */}
      <Modal
        visible={modalMaterialesVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalMaterialesVisible(false)
        }
      >
        <View
          style={[
            styles.modalOverlay,
            isTablet &&
            styles.modalOverlayTablet,
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                width: modalWidth,
              },
              isTablet &&
              styles.modalContentTablet,
            ]}
          >
            {!isTablet && (
              <View style={styles.modalHandle} />
            )}

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalTitleIcon}>
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={23}
                    color="#148248"
                  />
                </View>

                <Text
                  style={styles.modalTitle}
                  numberOfLines={2}
                >
                  Seleccionar material o herramienta
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() =>
                  setModalMaterialesVisible(false)
                }
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#4B5563"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color="#148248"
              />

              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar por nombre o número"
                placeholderTextColor="#8A919C"
                value={busquedaMaterial}
                onChangeText={setBusquedaMaterial}
                returnKeyType="search"
              />

              {busquedaMaterial.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    setBusquedaMaterial("")
                  }
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={21}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.modalList}
              contentContainerStyle={
                styles.modalListContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {materialesFiltrados.length > 0 ? (
                materialesFiltrados.map(
                  (material) => {
                    const esHerramienta =
                      material.tipoMaterial ===
                      "herramienta";

                    const isSelected =
                      materialSeleccionado
                        ?.numMaterial ===
                      material.numMaterial;

                    return (
                      <TouchableOpacity
                        key={String(
                          material.numMaterial
                        )}
                        style={[
                          styles.optionCard,
                          isSelected &&
                          styles.optionCardSelected,
                        ]}
                        onPress={() => {
                          setMaterialSeleccionado(
                            material
                          );

                          setModalMaterialesVisible(
                            false
                          );

                          setBusquedaMaterial("");
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.optionIcon,
                            esHerramienta &&
                            styles.toolOptionIcon,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={
                              esHerramienta
                                ? "tools"
                                : "package-variant"
                            }
                            size={22}
                            color={
                              esHerramienta
                                ? "#7C3AED"
                                : "#148248"
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.optionTextContainer
                          }
                        >
                          <Text
                            style={styles.optionTitle}
                            numberOfLines={2}
                          >
                            {material.nombreMaterial}
                          </Text>

                          <Text
                            style={styles.optionText}
                          >
                            Número:{" "}
                            {material.numMaterial}
                          </Text>

                          <Text
                            style={styles.optionText}
                          >
                            {esHerramienta
                              ? "Herramienta"
                              : "Material"}{" "}
                            · Stock:{" "}
                            {material.cantidad ?? 0}{" "}
                            {material.unidad ?? ""}
                          </Text>
                        </View>

                        {isSelected && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={23}
                            color="#148248"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="package-variant-closed-remove"
                    size={49}
                    color="#B7C1BC"
                  />

                  <Text style={styles.emptyTitle}>
                    No se encontraron materiales
                  </Text>

                  <Text style={styles.emptyText}>
                    Prueba con otro nombre o número.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de técnicos */}
      <Modal
        visible={modalTecnicosVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalTecnicosVisible(false)
        }
      >
        <View
          style={[
            styles.modalOverlay,
            isTablet &&
            styles.modalOverlayTablet,
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                width: modalWidth,
              },
              isTablet &&
              styles.modalContentTablet,
            ]}
          >
            {!isTablet && (
              <View style={styles.modalHandle} />
            )}

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalTitleIcon}>
                  <MaterialCommunityIcons
                    name="account-hard-hat-outline"
                    size={23}
                    color="#148248"
                  />
                </View>

                <Text
                  style={styles.modalTitle}
                  numberOfLines={2}
                >
                  Seleccionar técnico externo
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() =>
                  setModalTecnicosVisible(false)
                }
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#4B5563"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.noTechnicianOption,
                !tecnicoSeleccionado &&
                styles.noTechnicianSelected,
              ]}
              onPress={() => {
                setTecnicoSeleccionado(null);
                setModalTecnicosVisible(false);
                setBusquedaTecnico("");
              }}
              activeOpacity={0.8}
            >
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={22}
                  color="#148248"
                />
              </View>

              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  Sin técnico externo
                </Text>

                <Text style={styles.optionText}>
                  Guardar entrada sin técnico externo
                </Text>
              </View>

              {!tecnicoSeleccionado && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={23}
                  color="#148248"
                />
              )}
            </TouchableOpacity>

            <View style={styles.modalSearch}>
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color="#148248"
              />

              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar técnico o empresa"
                placeholderTextColor="#8A919C"
                value={busquedaTecnico}
                onChangeText={setBusquedaTecnico}
                returnKeyType="search"
              />

              {busquedaTecnico.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    setBusquedaTecnico("")
                  }
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={21}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.modalList}
              contentContainerStyle={
                styles.modalListContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {tecnicosFiltrados.length > 0 ? (
                tecnicosFiltrados.map(
                  (tecnico) => {
                    const isSelected =
                      tecnicoSeleccionado
                        ?.numTecnicoExterno ===
                      tecnico.numTecnicoExterno;

                    return (
                      <TouchableOpacity
                        key={String(
                          tecnico.numTecnicoExterno
                        )}
                        style={[
                          styles.optionCard,
                          isSelected &&
                          styles.optionCardSelected,
                        ]}
                        onPress={() => {
                          setTecnicoSeleccionado(
                            tecnico
                          );

                          setModalTecnicosVisible(
                            false
                          );

                          setBusquedaTecnico("");
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={styles.optionIcon}
                        >
                          <MaterialCommunityIcons
                            name="account-hard-hat-outline"
                            size={22}
                            color="#148248"
                          />
                        </View>

                        <View
                          style={
                            styles.optionTextContainer
                          }
                        >
                          <Text
                            style={styles.optionTitle}
                            numberOfLines={2}
                          >
                            {tecnico.nombre}
                          </Text>

                          <Text
                            style={styles.optionText}
                            numberOfLines={1}
                          >
                            Empresa:{" "}
                            {tecnico.empresa ||
                              "Sin empresa"}
                          </Text>

                          <Text
                            style={styles.optionText}
                          >
                            Teléfono:{" "}
                            {tecnico.telefono ||
                              "Sin teléfono"}
                          </Text>
                        </View>

                        {isSelected && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={23}
                            color="#148248"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="account-search-outline"
                    size={49}
                    color="#B7C1BC"
                  />

                  <Text style={styles.emptyTitle}>
                    No se encontraron técnicos
                  </Text>

                  <Text style={styles.emptyText}>
                    Prueba con otro nombre o empresa.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  formCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 22,
    padding: 21,

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

  formCardSmall: {
    padding: 16,
    borderRadius: 18,
  },

  formCardTablet: {
    padding: 29,
    borderRadius: 26,
  },

  formHeader: {
    width: "100%",
    alignItems: "center",
  },

  formHeaderIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginBottom: 10,
    flexShrink: 0,
  },

  formHeaderIconTablet: {
    width: 72,
    height: 72,
    borderRadius: 22,
  },

  formHeaderText: {
    width: "100%",
    alignItems: "center",
  },
  formTitle: {
    color: "#26322C",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
  },

  formTitleTablet: {
    fontSize: 23,
    lineHeight: 28,
  },

  formDescription: {
    color: "#727C76",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
    textAlign: "center",
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E8EEEA",
    marginTop: 18,
    marginBottom: 19,
  },

  field: {
    flex: 1,
    minWidth: 0,
    marginBottom: 18,
  },

  label: {
    color: "#46524C",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  selector: {
    width: "100%",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FBFA",
    borderWidth: 1,
    borderColor: "#DDE5E0",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  selectorSelected: {
    borderColor: "#B9D9C6",
    backgroundColor: "#FAFCFB",
  },

  selectorIconBox: {
    width: 39,
    height: 39,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
    flexShrink: 0,
  },

  selectorText: {
    flex: 1,
    minWidth: 0,
    color: "#26322C",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    marginRight: 8,
  },

  placeholderText: {
    color: "#7F8984",
    fontWeight: "500",
  },

  materialInformation: {
    width: "100%",
    flexDirection: "row",
    marginTop: 10,
  },

  materialInformationSmall: {
    flexDirection: "column",
  },

  informationItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8F6",
    borderWidth: 1,
    borderColor: "#E3EAE6",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  informationItemLeft: {
    marginRight: 9,
  },

  informationIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5F2EA",
    marginRight: 8,
    flexShrink: 0,
  },

  informationText: {
    flex: 1,
    minWidth: 0,
  },

  informationLabel: {
    color: "#7A837E",
    fontSize: 11,
    fontWeight: "600",
  },

  informationValue: {
    color: "#27332D",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },

  fieldsRow: {
    width: "100%",
  },

  fieldsRowHorizontal: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  quantityField: {
    flex: 0.55,
    marginRight: 13,
  },

  inputContainer: {
    width: "100%",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FBFA",
    borderWidth: 1,
    borderColor: "#DDE5E0",
    borderRadius: 15,
    paddingHorizontal: 10,
  },

  inputIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    color: "#26322C",
    fontSize: 15,
    fontWeight: "500",
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  textAreaContainer: {
    width: "100%",
    minHeight: 115,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FBFA",
    borderWidth: 1,
    borderColor: "#DDE5E0",
    borderRadius: 15,
    padding: 10,
  },

  textAreaIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    flexShrink: 0,
  },

  textArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 95,
    color: "#26322C",
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 8,
  },

  actions: {
    width: "100%",
    marginTop: 4,
  },

  actionsHorizontal: {
    flexDirection: "row",
  },

  actionHorizontal: {
    flex: 1,
  },

  submitButton: {
    minHeight: 55,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 13,
    marginBottom: 11,
    elevation: 3,
  },

  cancelButton: {
    minHeight: 55,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870C0C",
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 13,
    marginBottom: 11,
    elevation: 3,
  },

  cancelButtonHorizontal: {
    marginLeft: 11,
  },

  buttonDisabled: {
    opacity: 0.62,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(10,20,15,0.48)",
  },

  modalOverlayTablet: {
    justifyContent: "center",
    paddingVertical: 30,
  },

  modalContent: {
    maxHeight: "82%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 26,
  },

  modalContentTablet: {
    maxHeight: "78%",
    borderRadius: 25,
    padding: 21,
  },

  modalHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D6DDD9",
    marginBottom: 13,
  },

  modalHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  modalTitleContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  modalTitleIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
    flexShrink: 0,
  },

  modalTitle: {
    flex: 1,
    color: "#26322C",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },

  modalCloseButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F3F1",
  },

  modalSearch: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#DDE5E0",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  modalSearchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    color: "#26322C",
    fontSize: 14,
    paddingHorizontal: 9,
    paddingVertical: 9,
  },

  modalList: {
    flexGrow: 0,
  },

  modalListContent: {
    paddingBottom: 10,
  },

  optionCard: {
    width: "100%",
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E3E9E5",
    borderRadius: 15,
    padding: 11,
    marginBottom: 9,
  },

  optionCardSelected: {
    backgroundColor: "#EFF8F2",
    borderColor: "#97C5A9",
  },

  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
    flexShrink: 0,
  },

  toolOptionIcon: {
    backgroundColor: "#F3E8FF",
  },

  optionTextContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  optionTitle: {
    color: "#26322C",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },

  optionText: {
    color: "#6F7974",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  noTechnicianOption: {
    width: "100%",
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E3E9E5",
    borderRadius: 15,
    padding: 11,
    marginBottom: 11,
  },

  noTechnicianSelected: {
    backgroundColor: "#EFF8F2",
    borderColor: "#97C5A9",
  },

  emptyContainer: {
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },

  emptyText: {
    color: "#7B8580",
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },
});