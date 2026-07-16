import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  onSubmit: (values: EntradaFormValues) => Promise<void>;
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
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(initialValues.materialSeleccionado);

  const [tecnicoSeleccionado, setTecnicoSeleccionado] =
    useState<TecnicoExterno | null>(initialValues.tecnicoSeleccionado);

  const [cantidad, setCantidad] = useState(initialValues.cantidad);
  const [observaciones, setObservaciones] = useState(
    initialValues.observaciones
  );

  const [modalMaterialesVisible, setModalMaterialesVisible] =
    useState(false);

  const [modalTecnicosVisible, setModalTecnicosVisible] =
    useState(false);

  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [busquedaTecnico, setBusquedaTecnico] = useState("");

  useEffect(() => {
    setMaterialSeleccionado(initialValues.materialSeleccionado);
    setTecnicoSeleccionado(initialValues.tecnicoSeleccionado);
    setCantidad(initialValues.cantidad);
    setObservaciones(initialValues.observaciones);
  }, [initialValues]);

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const materialesFiltrados = useMemo(() => {
    const search = normalizeText(busquedaMaterial);

    if (!search) {
      return materiales;
    }

    return materiales.filter((material) => {
      const nombre = normalizeText(
        material.nombreMaterial ?? ""
      );

      const codigo = String(material.numMaterial ?? "");

      return (
        nombre.includes(search) ||
        codigo.includes(search)
      );
    });
  }, [busquedaMaterial, materiales]);

  const tecnicosFiltrados = useMemo(() => {
    const search = normalizeText(busquedaTecnico);

    if (!search) {
      return tecnicos;
    }

    return tecnicos.filter((tecnico) => {
      const nombre = normalizeText(tecnico.nombre ?? "");
      const empresa = normalizeText(tecnico.empresa ?? "");

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
        "Selecciona un material"
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
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          Datos de la entrada
        </Text>

        <Text style={styles.label}>Material</Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalMaterialesVisible(true)}
          disabled={saving}
        >
          <Text style={styles.selectorText}>
            {materialSeleccionado
              ? `${materialSeleccionado.nombreMaterial} (${materialSeleccionado.numMaterial})`
              : "Selecciona un material"}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>

        {materialSeleccionado && (
          <Text style={styles.helperText}>
            Stock actual:{" "}
            {materialSeleccionado.cantidad ?? 0}{" "}
            {materialSeleccionado.unidad ?? ""}
          </Text>
        )}

        <Text style={styles.label}>
          Cantidad de entrada
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Cantidad"
          placeholderTextColor="#888888"
          keyboardType="numeric"
          value={cantidad}
          editable={!saving}
          onChangeText={(text) => {
            setCantidad(text.replace(/[^0-9]/g, ""));
          }}
        />

        <Text style={styles.label}>
          Técnico externo / empresa
        </Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalTecnicosVisible(true)}
          disabled={saving}
        >
          <Text style={styles.selectorText}>
            {tecnicoSeleccionado
              ? `${tecnicoSeleccionado.nombre} - ${
                  tecnicoSeleccionado.empresa ??
                  "Sin empresa"
                }`
              : "Sin técnico externo"}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>

        <Text style={styles.label}>Comentarios</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Escriba sus comentarios"
          placeholderTextColor="#888888"
          value={observaciones}
          editable={!saving}
          onChangeText={setObservaciones}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.button,
            saving && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Guardando..." : submitText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cancelButton,
            saving && styles.buttonDisabled,
          ]}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalMaterialesVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalMaterialesVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar material
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setModalMaterialesVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={26}
                  color="#111827"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar por nombre o código"
              placeholderTextColor="#888888"
              value={busquedaMaterial}
              onChangeText={setBusquedaMaterial}
            />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {materialesFiltrados.length > 0 ? (
                materialesFiltrados.map((material) => (
                  <TouchableOpacity
                    key={String(material.numMaterial)}
                    style={styles.optionCard}
                    onPress={() => {
                      setMaterialSeleccionado(material);
                      setModalMaterialesVisible(false);
                      setBusquedaMaterial("");
                    }}
                  >
                    <Text style={styles.optionTitle}>
                      {material.nombreMaterial}
                    </Text>

                    <Text style={styles.optionText}>
                      Código: {material.numMaterial}
                    </Text>

                    <Text style={styles.optionText}>
                      Stock actual:{" "}
                      {material.cantidad ?? 0}{" "}
                      {material.unidad ?? ""}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No se encontraron materiales
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalTecnicosVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalTecnicosVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar técnico externo
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setModalTecnicosVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={26}
                  color="#111827"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                setTecnicoSeleccionado(null);
                setModalTecnicosVisible(false);
                setBusquedaTecnico("");
              }}
            >
              <Text style={styles.optionTitle}>
                Sin técnico externo
              </Text>

              <Text style={styles.optionText}>
                Guardar entrada sin técnico externo
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar técnico o empresa"
              placeholderTextColor="#888888"
              value={busquedaTecnico}
              onChangeText={setBusquedaTecnico}
            />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {tecnicosFiltrados.length > 0 ? (
                tecnicosFiltrados.map((tecnico) => (
                  <TouchableOpacity
                    key={String(
                      tecnico.numTecnicoExterno
                    )}
                    style={styles.optionCard}
                    onPress={() => {
                      setTecnicoSeleccionado(tecnico);
                      setModalTecnicosVisible(false);
                      setBusquedaTecnico("");
                    }}
                  >
                    <Text style={styles.optionTitle}>
                      {tecnico.nombre}
                    </Text>

                    <Text style={styles.optionText}>
                      Empresa:{" "}
                      {tecnico.empresa || "Sin empresa"}
                    </Text>

                    <Text style={styles.optionText}>
                      Teléfono:{" "}
                      {tecnico.telefono ||
                        "Sin teléfono"}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No se encontraron técnicos
                </Text>
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
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },

  label: {
    fontWeight: "bold",
    color: "#374151",
    marginTop: 12,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 90,
    color: "#111827",
  },

  selector: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectorText: {
    flex: 1,
    color: "#111827",
    marginRight: 8,
  },

  helperText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5,
  },

  button: {
    backgroundColor: "#232323",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },

  cancelButton: {
    backgroundColor: "#870C0C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    paddingBottom: 34,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    maxHeight: "75%",
    marginHorizontal: 8,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  modalSearchInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    marginBottom: 12,
    color: "#111827",
  },

  optionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },

  optionText: {
    color: "#6B7280",
    marginTop: 2,
  },

  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
});