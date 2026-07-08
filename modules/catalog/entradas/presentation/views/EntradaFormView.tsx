import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { GetMaterialsUseCase } from "../../../materiales/application/getMaterials";
import { Material } from "../../../materiales/domain/material";
import { MaterialDataSource } from "../../../materiales/infraestructure/materialesDatasource";
import { GetTecnicosExternosUseCase } from "../../../proveedores/application/getProveedores";
import { TecnicoExterno } from "../../../proveedores/domain/proveedor";
import { TecnicoExternoDataSource } from "../../../proveedores/infraestructure/proveedorDataSource";
import { CreateEntradaUseCase } from "../../application/createEntrada";
import { EditEntradaUseCase } from "../../application/editEntrada";
import { GetEntradaByIdUseCase } from "../../application/getEntradaById";
import { EntradaDataSource } from "../../infrastructure/entradaDataSource";

const entradaRepository = new EntradaDataSource();
const materialRepository = new MaterialDataSource();
const tecnicoRepository = new TecnicoExternoDataSource();

const createEntrada = new CreateEntradaUseCase(entradaRepository);
const editEntrada = new EditEntradaUseCase(entradaRepository);
const getEntradaById = new GetEntradaByIdUseCase(entradaRepository);

const getMaterials = new GetMaterialsUseCase(materialRepository);
const getTecnicos = new GetTecnicosExternosUseCase(tecnicoRepository);

export default function EntradaFormView() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const idEntradaParam = Array.isArray(params.idEntrada)
    ? params.idEntrada[0]
    : params.idEntrada;

  const isEditing = !!idEntradaParam;

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoExterno[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(null);

  const [tecnicoSeleccionado, setTecnicoSeleccionado] =
    useState<TecnicoExterno | null>(null);

  const [cantidad, setCantidad] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [modalMaterialesVisible, setModalMaterialesVisible] = useState(false);
  const [modalTecnicosVisible, setModalTecnicosVisible] = useState(false);

  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [busquedaTecnico, setBusquedaTecnico] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [idEntradaParam])
  );

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [materialesData, tecnicosData] = await Promise.all([
        getMaterials.execute(),
        getTecnicos.execute(),
      ]);

      setMateriales(materialesData);
      setTecnicos(tecnicosData);

      if (idEntradaParam) {
        const entrada = await getEntradaById.execute(String(idEntradaParam));

        if (!entrada) {
          Alert.alert("Error", "No se encontró la entrada");
          router.replace("/entradas" as any);
          return;
        }

        const material = materialesData.find(
          (item) => Number(item.numMaterial) === Number(entrada.numMaterial)
        );

        const tecnico = tecnicosData.find(
          (item) =>
            Number(item.numTecnicoExterno) ===
            Number(entrada.numTecnicoExterno)
        );

        setMaterialSeleccionado(
          material ?? {
            numMaterial: entrada.numMaterial,
            nombreMaterial: entrada.nombreMaterial ?? "Material",
            unidad: entrada.unidad ?? "unidad",
            cantidad: entrada.stockActual ?? 0,
          }
        );

        setTecnicoSeleccionado(tecnico ?? null);
        setCantidad(String(entrada.cantidad ?? ""));
        setObservaciones(entrada.observaciones ?? "");
      } else {
        limpiarFormulario();
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo cargar el formulario"
      );
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setMaterialSeleccionado(null);
    setTecnicoSeleccionado(null);
    setCantidad("");
    setObservaciones("");
    setBusquedaMaterial("");
    setBusquedaTecnico("");
  };

  const materialesFiltrados = useMemo(() => {
    const search = normalizeText(busquedaMaterial);

    if (!search) return materiales;

    return materiales.filter((material) => {
      const nombre = normalizeText(material.nombreMaterial ?? "");
      const codigo = String(material.numMaterial ?? "");

      return nombre.includes(search) || codigo.includes(search);
    });
  }, [busquedaMaterial, materiales]);

  const tecnicosFiltrados = useMemo(() => {
    const search = normalizeText(busquedaTecnico);

    if (!search) return tecnicos;

    return tecnicos.filter((tecnico) => {
      const nombre = normalizeText(tecnico.nombre ?? "");
      const empresa = normalizeText(tecnico.empresa ?? "");

      return nombre.includes(search) || empresa.includes(search);
    });
  }, [busquedaTecnico, tecnicos]);

  const guardarEntrada = async () => {
    try {
      if (!materialSeleccionado) {
        Alert.alert("Campo obligatorio", "Selecciona un material");
        return;
      }

      const cantidadNumerica = Number(cantidad);

      if (!cantidad.trim() || isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
        Alert.alert("Campo obligatorio", "Ingresa una cantidad mayor a 0");
        return;
      }

      setSaving(true);

      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      const payload = {
        numMaterial: materialSeleccionado.numMaterial,
        cantidad: cantidadNumerica,
        observaciones,
        numUsuario: user?.numUsuario ?? null,
        numTecnicoExterno: tecnicoSeleccionado?.numTecnicoExterno ?? null,
      };

      if (isEditing && idEntradaParam) {
        await editEntrada.execute(String(idEntradaParam), payload);

        Alert.alert(
          "Éxito",
          "Entrada actualizada correctamente",
          [
            {
              text: "Aceptar",
              onPress: () => router.replace("/entradas" as any),
            },
          ]
        );
      } else {
        await createEntrada.execute(payload);

        Alert.alert(
          "Éxito",
          "Entrada registrada correctamente",
          [
            {
              text: "Aceptar",
              onPress: () => router.replace("/entradas" as any),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo guardar la entrada"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.rowHeader}>
            <Image
              source={require("../../../../../assets/images/ZUCARMEX.png")}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {isEditing ? "Editar entrada" : "Nueva entrada"}
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Datos de la entrada
            </Text>

            <Text style={styles.label}>Material</Text>

            <TouchableOpacity
              style={styles.selector}
              onPress={() => setModalMaterialesVisible(true)}
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
                Stock actual: {materialSeleccionado.cantidad ?? 0}{" "}
                {materialSeleccionado.unidad ?? ""}
              </Text>
            )}

            <Text style={styles.label}>Cantidad de entrada</Text>

            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              keyboardType="numeric"
              value={cantidad}
              onChangeText={(text) =>
                setCantidad(text.replace(/[^0-9]/g, ""))
              }
            />

            <Text style={styles.label}>Técnico externo / empresa</Text>

            <TouchableOpacity
              style={styles.selector}
              onPress={() => setModalTecnicosVisible(true)}
            >
              <Text style={styles.selectorText}>
                {tecnicoSeleccionado
                  ? `${tecnicoSeleccionado.nombre} - ${
                      tecnicoSeleccionado.empresa ?? "Sin empresa"
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
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={guardarEntrada}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar entrada"
                    : "Guardar entrada"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={modalMaterialesVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMaterialesVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar material
              </Text>

              <TouchableOpacity
                onPress={() => setModalMaterialesVisible(false)}
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
              value={busquedaMaterial}
              onChangeText={setBusquedaMaterial}
            />

            <ScrollView keyboardShouldPersistTaps="handled">
              {materialesFiltrados.map((material) => (
                <TouchableOpacity
                  key={material.numMaterial}
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
                    Stock actual: {material.cantidad ?? 0}{" "}
                    {material.unidad ?? ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalTecnicosVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalTecnicosVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar técnico externo
              </Text>

              <TouchableOpacity
                onPress={() => setModalTecnicosVisible(false)}
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
              value={busquedaTecnico}
              onChangeText={setBusquedaTecnico}
            />

            <ScrollView keyboardShouldPersistTaps="handled">
              {tecnicosFiltrados.map((tecnico) => (
                <TouchableOpacity
                  key={tecnico.numTecnicoExterno}
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
                    Empresa: {tecnico.empresa || "Sin empresa"}
                  </Text>

                  <Text style={styles.optionText}>
                    Teléfono: {tecnico.telefono || "Sin teléfono"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    width: "100%",
    height: 100,
    paddingTop: 35,
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  rowHeader: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
    zIndex: 10,
  },

  imageZucarmex: {
    width: "45%",
    height: 60,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111827",
  },

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
    marginTop: 8,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 90,
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
  },

  helperText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5,
  },

  clearTecnicoButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  clearTecnicoText: {
    color: "#870c0c",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#232323",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  cancelButton: {
    backgroundColor: "#870c0c",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
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
});