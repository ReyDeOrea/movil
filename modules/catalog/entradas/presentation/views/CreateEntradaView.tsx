import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Stack,
    useFocusEffect,
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

import { CreateEntradaUseCase } from "../../application/createEntrada";
import { EntradaDataSource } from "../../infrastructure/entradaDataSource";

import EntradaFormView, {
    EntradaFormValues,
} from "../components/EntradaFormView";

const entradaRepository = new EntradaDataSource();
const materialRepository = new MaterialDataSource();
const tecnicoRepository =
  new TecnicoExternoDataSource();

const createEntrada =
  new CreateEntradaUseCase(entradaRepository);

const getMaterials =
  new GetMaterialsUseCase(materialRepository);

const getTecnicos =
  new GetTecnicosExternosUseCase(tecnicoRepository);

export default function CreateEntradaView() {
  const router = useRouter();

  const [materiales, setMateriales] =
    useState<Material[]>([]);

  const [tecnicos, setTecnicos] =
    useState<TecnicoExterno[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCatalogos = useCallback(async () => {
    try {
      setLoading(true);

      const [materialesData, tecnicosData] =
        await Promise.all([
          getMaterials.execute(),
          getTecnicos.execute(),
        ]);

      setMateriales(materialesData);
      setTecnicos(tecnicosData);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ??
          "No se pudieron cargar los datos"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCatalogos();
    }, [loadCatalogos])
  );

  const guardarEntrada = async (
    values: EntradaFormValues
  ) => {
    if (!values.materialSeleccionado || saving) {
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

      await createEntrada.execute(payload);

      Alert.alert(
        "Éxito",
        "Entrada registrada correctamente",
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
          "No se pudo registrar la entrada"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
            Cargando formulario...
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
            Nueva entrada
          </Text>

          <EntradaFormView
            materiales={materiales}
            tecnicos={tecnicos}
            saving={saving}
            submitText="Guardar entrada"
            onSubmit={guardarEntrada}
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