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
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
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
  const { width, height } = useWindowDimensions();

  const [materiales, setMateriales] =
    useState<Material[]>([]);

  const [tecnicos, setTecnicos] =
    useState<TecnicoExterno[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * Valores utilizados únicamente para adaptar
   * la interfaz al tamaño de la pantalla.
   */
  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const contentWidth = Math.max(
    280,
    Math.min(
      width - (isTablet ? 64 : 24),
      760
    )
  );

  const headerHeight = isLandscape
    ? 108
    : isTablet
      ? 158
      : 125;

  const logoWidth = Math.min(
    width * (isTablet ? 0.44 : 0.6),
    isTablet ? 330 : 260
  );

  const logoHeight = isTablet ? 86 : 70;

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
          options={{
            headerShown: false,
          }}
        />

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F1F5F3"
        />

        <View style={styles.center}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIcon}>
              <MaterialCommunityIcons
                name="tray-arrow-down"
                size={44}
                color="#148248"
              />
            </View>

            <ActivityIndicator
              size="large"
              color="#148248"
            />

            <Text style={styles.loadingTitle}>
              Cargando formulario
            </Text>

            <Text style={styles.loadingText}>
              Estamos obteniendo los materiales y
              técnicos externos.
            </Text>
          </View>
        </View>
      </>
    );
  }

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
          <View style={styles.headerDecorationOne} />
          <View style={styles.headerDecorationTwo} />

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

        {/* Contenido */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isSmallScreen &&
              styles.scrollContentSmall,
            isTablet &&
              styles.scrollContentTablet,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View
            style={[
              styles.content,
              {
                width: contentWidth,
              },
            ]}
          >
            <EntradaFormView
              materiales={materiales}
              tecnicos={tecnicos}
              saving={saving}
              submitText="Guardar entrada"
              onSubmit={guardarEntrada}
              onCancel={() => router.back()}
            />
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
  },

  scrollContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 110,
  },

  scrollContentSmall: {
    paddingTop: 12,
    paddingBottom: 90,
  },

  scrollContentTablet: {
    paddingHorizontal: 32,
    paddingTop: 25,
  },

  content: {
    alignSelf: "center",
  },
titleSection: {
  alignSelf: "center",
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: 14,
},

titleTextContainer: {
  width: "100%",
  alignItems: "center",
},

title: {
  color: "#26322C",
  fontSize: 20,
  lineHeight: 25,
  fontWeight: "800",
  textAlign: "center",
},

  titleTablet: {
    fontSize: 25,
    lineHeight: 30,
  },

  subtitle: {
    color: "#727C76",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F3",
    padding: 20,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 350,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    paddingHorizontal: 32,
    paddingVertical: 31,

    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.1,
        shadowRadius: 9,
        shadowOffset: {
          width: 0,
          height: 4,
        },
      },
    }),
  },

  loadingIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginBottom: 17,
  },

  loadingTitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 13,
  },

  loadingText: {
    maxWidth: 290,
    color: "#737B87",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },
});