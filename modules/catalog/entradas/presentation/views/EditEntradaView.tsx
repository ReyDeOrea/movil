import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { GetMaterialsUseCase } from "../../../materiales/application/getMaterials";
import { Material } from "../../../materiales/domain/material";
import { MaterialDataSource } from "../../../materiales/infraestructure/materialesDatasource";

import { GetTecnicosExternosUseCase } from "../../../proveedores/application/getProveedores";
import { TecnicoExterno } from "../../../proveedores/domain/proveedor";
import { TecnicoExternoDataSource } from "../../../proveedores/infraestructure/proveedorDataSource";

import { EditEntradaUseCase } from "../../application/editEntrada";
import { GetEntradaByIdUseCase } from "../../application/getEntradaById";
import { EntradaDataSource } from "../../infrastructure/entradaDataSource";

import EntradaFormView, {
  EntradaFormValues,
} from "../components/EntradaFormView";

const entradaRepository = new EntradaDataSource();
const materialRepository = new MaterialDataSource();
const tecnicoRepository =
  new TecnicoExternoDataSource();

const editEntrada =
  new EditEntradaUseCase(entradaRepository);

const getEntradaById =
  new GetEntradaByIdUseCase(entradaRepository);

const getMaterials =
  new GetMaterialsUseCase(materialRepository);

const getTecnicos =
  new GetTecnicosExternosUseCase(tecnicoRepository);

export default function EditEntradaView() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const idEntradaParam = Array.isArray(
    params.idEntrada
  )
    ? params.idEntrada[0]
    : params.idEntrada;

  const [materiales, setMateriales] =
    useState<Material[]>([]);

  const [tecnicos, setTecnicos] =
    useState<TecnicoExterno[]>([]);

  const [initialValues, setInitialValues] =
    useState<EntradaFormValues | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadEntrada = useCallback(async () => {
    if (!idEntradaParam) {
      Alert.alert(
        "Error",
        "No se recibió el identificador de la entrada"
      );

      router.replace("/entradas" as any);
      return;
    }

    try {
      setLoading(true);

      const [
        materialesData,
        tecnicosData,
        entrada,
      ] = await Promise.all([
        getMaterials.execute(),
        getTecnicos.execute(),
        getEntradaById.execute(
          String(idEntradaParam)
        ),
      ]);

      if (!entrada) {
        Alert.alert(
          "Error",
          "No se encontró la entrada"
        );

        router.replace("/entradas" as any);
        return;
      }

      setMateriales(materialesData);
      setTecnicos(tecnicosData);

      const materialEncontrado =
        materialesData.find(
          (material) =>
            Number(material.numMaterial) ===
            Number(entrada.numMaterial)
        );

      const tecnicoEncontrado =
        tecnicosData.find(
          (tecnico) =>
            Number(
              tecnico.numTecnicoExterno
            ) ===
            Number(
              entrada.numTecnicoExterno
            )
        );

      const materialInicial =
        materialEncontrado ??
        ({
          numMaterial: entrada.numMaterial,
          nombreMaterial:
            entrada.nombreMaterial ?? "Material",
          unidad: entrada.unidad ?? "unidad",
          cantidad: entrada.stockActual ?? 0,
          tipoMaterial: entrada.tipoMaterial ?? "material",
        } as Material);

      setInitialValues({
        materialSeleccionado: materialInicial,
        tecnicoSeleccionado:
          tecnicoEncontrado ?? null,
        cantidad: String(
          entrada.cantidad ?? ""
        ),
        observaciones:
          entrada.observaciones ?? "",
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ??
          "No se pudo cargar la entrada"
      );
    } finally {
      setLoading(false);
    }
  }, [idEntradaParam, router]);

  useFocusEffect(
    useCallback(() => {
      loadEntrada();
    }, [loadEntrada])
  );

  const actualizarEntrada = async (
    values: EntradaFormValues
  ) => {
    if (
      !idEntradaParam ||
      !values.materialSeleccionado ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);

      const userData =
        await AsyncStorage.getItem("user");

      const user = userData
        ? JSON.parse(userData)
        : null;

      const payload = {
        numMaterial:
          values.materialSeleccionado.numMaterial,

        cantidad: Number(values.cantidad),

        observaciones: values.observaciones,

        numUsuario:
          user?.numUsuario ?? null,

        numTecnicoExterno:
          values.tecnicoSeleccionado
            ?.numTecnicoExterno ?? null,
      };

      await editEntrada.execute(
        String(idEntradaParam),
        payload
      );

      Alert.alert(
        "Éxito",
        "Entrada actualizada correctamente",
        [
          {
            text: "Aceptar",
            onPress: () =>
              router.replace("/entradas" as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ??
          "No se pudo actualizar la entrada"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !initialValues) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#148248"
          />

          <Text style={styles.loadingText}>
            Cargando entrada...
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            disabled={saving}
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
            Editar entrada
          </Text>

          <EntradaFormView
            materiales={materiales}
            tecnicos={tecnicos}
            initialValues={initialValues}
            saving={saving}
            submitText="Actualizar entrada"
            onSubmit={actualizarEntrada}
            onCancel={() => router.back()}
          />
        </ScrollView>
      </View>
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
    backgroundColor: "#F5F5F5",
  },

  loadingText: {
    color: "#6B7280",
    marginTop: 10,
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
});