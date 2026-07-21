import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
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

import { api } from "@/lib/api";
import { ApiFastRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new ApiFastRequestsRepository();

type TipoMaterial = "material" | "herramienta";

type MaterialCatalogo = {
    numMaterial: number;
    nombre: string;
    descripcion?: string;
    unidad?: string;
    stock?: number;
    tipoMaterial: TipoMaterial;
};

type MaterialSeleccionado = {
    numMaterial: number;
    nombre: string;
    unidad: string;
    cantidad: string;
    stock: number;
    tipoMaterial: TipoMaterial;
};

type ImagenSeleccionada = {
    uri: string;
    name: string;
    type: string;
};

function getValue<T = any>(obj: any, ...keys: string[]): T | undefined {
    for (const key of keys) {
        if (
            obj &&
            obj[key] !== undefined &&
            obj[key] !== null &&
            obj[key] !== ""
        ) {
            return obj[key];
        }
    }

    return undefined;
}

const parseRequestParam = (value: string | string[] | undefined) => {
    if (!value || Array.isArray(value)) return null;

    try {
        return JSON.parse(value);
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value));
        } catch {
            return null;
        }
    }
};

const dateToApi = (date: Date) => {
    return date.toLocaleDateString("en-CA");
};

const apiToDate = (value?: string | null) => {
    if (!value) return new Date();

    const cleanDate = String(value).split("T")[0];
    const parts = cleanDate.split("-");

    if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return new Date(year, month - 1, day);
        }
    }

    return new Date();
};

const formatDate = (date?: string | null) => {
    if (!date) return "Sin fecha";

    const cleanDate = String(date).split("T")[0];
    const parts = cleanDate.split("-");

    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    return String(date);
};

const normalizeTipoMaterial = (value: unknown): TipoMaterial => {
    return String(value ?? "material").trim().toLowerCase() === "herramienta"
        ? "herramienta"
        : "material";
};

const getAreaName = (area: number | string | undefined | null) => {
    if (area === undefined || area === null || area === "") {
        return "No disponible";
    }

    const areaNumber = Number(area);

    if (!isNaN(areaNumber)) {
        switch (areaNumber) {
            case 1:
                return "Administración";
            case 2:
                return "Fábrica";
            case 3:
                return "Campo";
            case 4:
                return "Zona habitacional";
            default:
                return "No disponible";
        }
    }

    return String(area);
};

const priorityColors: Record<
    string,
    { background: string; text: string; border: string }
> = {
    baja: {
        background: "#ECFDF5",
        text: "#065F46",
        border: "#A7F3D0",
    },
    media: {
        background: "#FFFBEB",
        text: "#92400E",
        border: "#FDE68A",
    },
    alta: {
        background: "#FFF7ED",
        text: "#9A3412",
        border: "#FDBA74",
    },
    urgente: {
        background: "#FEF2F2",
        text: "#991B1B",
        border: "#FCA5A5",
    },
};

const getPriorityIcon = (value?: string | null) => {
    switch (String(value ?? "").trim().toLowerCase()) {
        case "baja":
            return "arrow-down-circle-outline";
        case "media":
            return "flag-outline";
        case "alta":
            return "alert-circle-outline";
        case "urgente":
            return "alert-octagon-outline";
        default:
            return "flag-outline";
    }
};

export default function CompleteRequestForm() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { width, height } = useWindowDimensions();

    const isSmallScreen = width < 370 || height < 650;
    const isTablet = width >= 700;
    const useTwoColumns = width >= 760;

    const contentWidth = Math.max(
        280,
        Math.min(width - (isTablet ? 64 : 24), 920)
    );

    const modalWidth = Math.max(
        280,
        Math.min(width - (isTablet ? 120 : 20), 680)
    );

    const modalMaxHeight = Math.max(
        420,
        height - (isSmallScreen ? 28 : isTablet ? 100 : 56)
    );

    const previewSize = isTablet ? 142 : isSmallScreen ? 96 : 112;
    const logoWidth = isTablet ? 195 : isSmallScreen ? 132 : 160;

    const request = parseRequestParam(params.request);

    const [fechaInicioReal, setFechaInicioReal] = useState<Date>(
        apiToDate(
            getValue<string>(
                request,
                "fechaInicioReal",
                "fechainicioreal",
                "fecha_inicio_real"
            )
        )
    );

    const [showInicioReal, setShowInicioReal] = useState(false);

    const [comentarios, setComentarios] = useState("");
    const [loading, setLoading] = useState(false);

    const [materiales, setMateriales] = useState<MaterialCatalogo[]>([]);
    const [loadingMateriales, setLoadingMateriales] = useState(false);

    const [materialesSeleccionados, setMaterialesSeleccionados] = useState<
        MaterialSeleccionado[]
    >([]);

    const [modalMaterialesVisible, setModalMaterialesVisible] = useState(false);
    const [busquedaMaterial, setBusquedaMaterial] = useState("");

    const [imagenes, setImagenes] = useState<ImagenSeleccionada[]>([]);

    useFocusEffect(
        useCallback(() => {
            cargarMateriales();
        }, [])
    );

    const numSolicitud = Number(
        getValue(request, "numSolicitud", "numsolicitud", "num_solicitud")
    );

    const descripcion =
        getValue<string>(request, "descripcion") ?? "Sin descripción";

    const prioridad =
        getValue<string>(request, "prioridad") ?? "Sin prioridad";

    const fechaSolicitud =
        getValue<string>(request, "fecha") ?? "Sin fecha";

    const solicitante =
        getValue<string>(
            request,
            "solicitante",
            "nombreSolicitante",
            "nombre_solicitante"
        ) ?? "No disponible";

    const areaValue = getValue<string | number>(
        request,
        "area",
        "nombreArea",
        "nombre_area",
        "numArea",
        "numarea",
        "num_area"
    );

    const area = getAreaName(areaValue);

    const cargarMateriales = async () => {
        try {
            setLoadingMateriales(true);

            const response = await api.get("/materiales/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data ??
                response.data?.materiales ??
                response.data?.items ??
                [];

            console.log("MATERIALES RECIBIDOS:", data);

            const materialesNormalizados = (data ?? [])
                .map((item: any) => {
                    console.log("MATERIAL ITEM:", item);

                    const numMaterial = Number(
                        getValue(
                            item,
                            "numMaterial",
                            "nummaterial",
                            "num_material",
                            "id",
                            "idMaterial",
                            "idmaterial",
                            "id_material"
                        )
                    );

                    const nombre =
                        getValue<string>(
                            item,
                            "nombre",
                            "nombrematerial",
                            "nombreMaterial",
                            "nombre_material",
                            "material",
                            "name"
                        ) ?? "Material sin nombre";

                    const descripcion =
                        getValue<string>(
                            item,
                            "descripcion",
                            "descripcionmaterial",
                            "descripcionMaterial",
                            "descripcion_material",
                            "description"
                        ) ?? "";

                    const unidad =
                        getValue<string>(
                            item,
                            "unidad",
                            "unidadmedida",
                            "unidadMedida",
                            "unidad_medida",
                            "unit"
                        ) ?? "unidad";

                    const stock = Number(
                        getValue(
                            item,
                            "stock",
                            "existencia",
                            "cantidad",
                            "cantidadDisponible",
                            "cantidad_disponible"
                        ) ?? 0
                    );

                    const tipoMaterial = normalizeTipoMaterial(
                        getValue(
                            item,
                            "tipoMaterial",
                            "tipomaterial",
                            "tipo_material"
                        )
                    );

                    return {
                        numMaterial,
                        nombre,
                        descripcion,
                        unidad,
                        stock,
                        tipoMaterial,
                    };
                })
                .filter((material: MaterialCatalogo) => {
                    return !isNaN(material.numMaterial);
                });

            setMateriales(materialesNormalizados);
        } catch (error: any) {
            console.log("ERROR cargando materiales:", error);

            Alert.alert(
                "Error",
                error.message || "No se pudieron cargar los materiales."
            );

            setMateriales([]);
        } finally {
            setLoadingMateriales(false);
        }
    };

    const abrirModalMateriales = async () => {
        setModalMaterialesVisible(true);
        await cargarMateriales();
    };

    const materialesFiltrados = useMemo(() => {
        const search = busquedaMaterial.trim().toLowerCase();

        if (!search) return materiales;

        return materiales.filter((material) =>
            material.nombre.toLowerCase().includes(search) ||
            material.tipoMaterial.toLowerCase().includes(search)
        );
    }, [busquedaMaterial, materiales]);

    const agregarMaterial = (material: MaterialCatalogo) => {
        const stockDisponible = Number(material.stock ?? 0);

        if (stockDisponible <= 0) {
            Alert.alert(
                "Sin existencia",
                `No puedes seleccionar ${material.nombre} porque no tiene existencia registrada.`
            );
            return;
        }

        const yaExiste = materialesSeleccionados.some(
            (item) => item.numMaterial === material.numMaterial
        );

        if (yaExiste) {
            Alert.alert("Material repetido", "Este material ya fue seleccionado.");
            return;
        }

        setMaterialesSeleccionados((prev) => [
            ...prev,
            {
                numMaterial: material.numMaterial,
                nombre: material.nombre,
                unidad: material.unidad ?? "unidad",
                cantidad: "",
                stock: stockDisponible,
                tipoMaterial: material.tipoMaterial,
            },
        ]);

        setModalMaterialesVisible(false);
        setBusquedaMaterial("");
    };

    const eliminarMaterial = (numMaterial: number) => {
        setMaterialesSeleccionados((prev) =>
            prev.filter((item) => item.numMaterial !== numMaterial)
        );
    };

    const cambiarCantidadMaterial = (numMaterial: number, cantidad: string) => {
        const cantidadLimpia = cantidad.replace(/[^0-9]/g, "");

        setMaterialesSeleccionados((prev) =>
            prev.map((item) => {
                if (item.numMaterial !== numMaterial) {
                    return item;
                }

                if (!cantidadLimpia) {
                    return {
                        ...item,
                        cantidad: "",
                    };
                }

                const cantidadNumerica = Number(cantidadLimpia);
                const stockDisponible = Number(item.stock ?? 0);

                if (cantidadNumerica > stockDisponible) {
                    Alert.alert(
                        "Cantidad no disponible",
                        `Solo hay ${stockDisponible} ${item.unidad} de ${item.nombre} registrados en existencia.`
                    );

                    return {
                        ...item,
                        cantidad: String(stockDisponible),
                    };
                }

                return {
                    ...item,
                    cantidad: cantidadLimpia,
                };
            })
        );
    };

    const seleccionarImagenes = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    "Permiso requerido",
                    "Necesitas permitir el acceso a tus imágenes."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (result.canceled) return;

            const nuevasImagenes = result.assets.map((asset, index) => {
                const fileName =
                    asset.fileName ??
                    `evidencia_tecnico_${Date.now()}_${index}.jpg`;

                return {
                    uri: asset.uri,
                    name: fileName,
                    type: asset.mimeType ?? "image/jpeg",
                };
            });

            setImagenes((prev) => [...prev, ...nuevasImagenes]);
        } catch (error) {
            console.log("ERROR seleccionando imágenes:", error);
            Alert.alert("Error", "No se pudieron seleccionar las imágenes.");
        }
    };

    const eliminarImagen = (uri: string) => {
        setImagenes((prev) => prev.filter((img) => img.uri !== uri));
    };

    const validarFormulario = () => {
        if (!numSolicitud) {
            Alert.alert("Error", "No se encontró el número de solicitud.");
            return false;
        }

        if (!(fechaInicioReal instanceof Date) || isNaN(fechaInicioReal.getTime())) {
            Alert.alert("Campo obligatorio", "Ingresa la fecha real de inicio.");
            return false;
        }

        const fechaFinRealAutomatica = new Date();

        if (dateToApi(fechaFinRealAutomatica) < dateToApi(fechaInicioReal)) {
            Alert.alert(
                "Fecha incorrecta",
                "La fecha real de fin no puede ser menor que la fecha real de inicio."
            );
            return false;
        }

        const materialSinCantidad = materialesSeleccionados.find(
            (item) => !item.cantidad.trim() || Number(item.cantidad) <= 0
        );

        if (materialSinCantidad) {
            Alert.alert(
                "Cantidad requerida",
                `Ingresa la cantidad usada para ${materialSinCantidad.nombre}.`
            );
            return false;
        }

        const materialSinExistencia = materialesSeleccionados.find(
            (item) => Number(item.cantidad) > Number(item.stock ?? 0)
        );

        if (materialSinExistencia) {
            Alert.alert(
                "Cantidad no disponible",
                `No puedes usar ${materialSinExistencia.cantidad} de ${materialSinExistencia.nombre}. Existencia disponible: ${materialSinExistencia.stock}.`
            );
            return false;
        }

        if (!comentarios.trim()) {
            Alert.alert("Campo obligatorio", "Ingresa los comentarios finales.");
            return false;
        }

        if (imagenes.length === 0) {
            Alert.alert(
                "Imágenes requeridas",
                "Agrega al menos una imagen de evidencia."
            );
            return false;
        }

        return true;
    };

    const guardarSolicitudTerminada = async () => {
        if (!validarFormulario()) return;

        try {
            setLoading(true);

            const userData = await AsyncStorage.getItem("user");
            const user = userData ? JSON.parse(userData) : null;

            const fechaInicioRealApi = dateToApi(fechaInicioReal);
            const fechaFinRealApi = dateToApi(new Date());

            const materialesPayload = materialesSeleccionados.map((item) => ({
                numMaterial: item.numMaterial,
                nummaterial: item.numMaterial,
                cantidad: Number(item.cantidad),
                unidad: item.unidad,
            }));

            const payload = {
                numStatus: 4,
                numstatus: 4,

                fechaInicioReal: fechaInicioRealApi,
                fechainicioreal: fechaInicioRealApi,
                fecha_inicio_real: fechaInicioRealApi,

                fechaFinReal: fechaFinRealApi,
                fechafinreal: fechaFinRealApi,
                fecha_fin_real: fechaFinRealApi,

                comentarios,

                materiales: materialesPayload,
                imagenes,

                numUsuario: user?.numUsuario,
                numusuario: user?.numUsuario,
            };

            const repo: any = repository;

            if (typeof repo.completeRequest === "function") {
                await repo.completeRequest(numSolicitud, payload);
            } else if (typeof repo.finishRequest === "function") {
                await repo.finishRequest(numSolicitud, payload);
            } else if (typeof repo.updateRequest === "function") {
                await repo.updateRequest(numSolicitud, payload);
            } else if (typeof repo.updateSolicitud === "function") {
                await repo.updateSolicitud(numSolicitud, payload);
            } else if (typeof repo.updateRequestStatus === "function") {
                await repo.updateRequestStatus(numSolicitud, 4);
            } else {
                throw new Error(
                    "No existe un método en el repositorio para terminar la solicitud."
                );
            }

            if (typeof repo.uploadTechnicianImages === "function") {
                await repo.uploadTechnicianImages(numSolicitud, imagenes);
            } else if (typeof repo.uploadRequestImages === "function") {
                await repo.uploadRequestImages(numSolicitud, imagenes, "tecnico");
            } else if (typeof repo.saveRequestImages === "function") {
                await repo.saveRequestImages(numSolicitud, imagenes, "tecnico");
            }

            Alert.alert(
                "Solicitud terminada",
                "La solicitud se guardó y se marcó como completada.",
                [
                    {
                        text: "Aceptar",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.log("ERROR terminando solicitud:", error);
            Alert.alert(
                "Error",
                error?.message || "No se pudo guardar la finalización de la solicitud."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!request) {
        return (
            <SafeAreaView style={styles.emptySafeArea}>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBox}>
                        <MaterialCommunityIcons
                            name="file-alert-outline"
                            size={48}
                            color="#148248"
                        />
                    </View>

                    <Text style={styles.emptyTitle}>
                        Solicitud no encontrada
                    </Text>
                    <Text style={styles.emptyText}>
                        No fue posible recuperar la información de la solicitud.
                    </Text>

                    <TouchableOpacity
                        style={styles.returnButton}
                        onPress={() => router.back()}
                        activeOpacity={0.82}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={20}
                            color="#FFFFFF"
                        />
                        <Text style={styles.returnButtonText}>Regresar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const prioridadNormalizada = String(prioridad).trim().toLowerCase();
    const prioridadStyle =
        priorityColors[prioridadNormalizada] ?? {
            background: "#F3F4F6",
            text: "#4B5563",
            border: "#D1D5DB",
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
                                source={require('../../../../assets/images/ZUCARMEX.png')}
                                style={[
                                    styles.imageZucarmex,
                                    { width: logoWidth },
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
                            <View style={styles.introCenteredContainer}>
                                <View style={styles.introIconBox}>
                                    <MaterialCommunityIcons
                                        name="clipboard-check-outline"
                                        size={30}
                                        color="#148248"
                                    />
                                </View>

                                <Text style={styles.introTitle}>
                                    Completar solicitud
                                </Text>
                                <Text style={styles.introSubtitle}>
                                    Registra la información final del trabajo realizado
                                </Text>
                            </View>

                            <View style={styles.card}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionIconBox}>
                                        <MaterialCommunityIcons
                                            name="file-document-outline"
                                            size={23}
                                            color="#148248"
                                        />
                                    </View>

                                    <View style={styles.sectionTitleContainer}>
                                        <Text style={styles.sectionTitle}>
                                            Datos de la solicitud
                                        </Text>
                                        <Text style={styles.sectionSubtitle}>
                                            Información registrada por el solicitante.
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.infoGrid,
                                        useTwoColumns && styles.infoGridColumns,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.infoBox,
                                            useTwoColumns && styles.infoBoxHalf,
                                            useTwoColumns && styles.infoBoxSpacingRight,
                                        ]}
                                    >
                                        <View style={styles.infoIconBox}>
                                            <MaterialCommunityIcons
                                                name="account-outline"
                                                size={19}
                                                color="#148248"
                                            />
                                        </View>
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Solicitante</Text>
                                            <Text style={styles.infoValue} numberOfLines={2}>
                                                {solicitante}
                                            </Text>
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            styles.infoBox,
                                            useTwoColumns && styles.infoBoxHalf,
                                        ]}
                                    >
                                        <View style={styles.infoIconBox}>
                                            <MaterialCommunityIcons
                                                name="calendar-outline"
                                                size={19}
                                                color="#148248"
                                            />
                                        </View>
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Fecha</Text>
                                            <Text style={styles.infoValue}>
                                                {formatDate(fechaSolicitud)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.infoBox}>
                                    <View style={styles.infoIconBox}>
                                        <MaterialCommunityIcons
                                            name="map-marker-outline"
                                            size={19}
                                            color="#148248"
                                        />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Área</Text>
                                        <Text style={styles.infoValue}>{area}</Text>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.priorityRow,
                                        {
                                            backgroundColor: prioridadStyle.background,
                                            borderColor: prioridadStyle.border,
                                        },
                                    ]}
                                >
                                    <View style={styles.priorityIconBox}>
                                        <MaterialCommunityIcons
                                            name={getPriorityIcon(prioridad) as any}
                                            size={21}
                                            color={prioridadStyle.text}
                                        />
                                    </View>

                                    <View style={styles.infoTextContainer}>
                                        <Text
                                            style={[
                                                styles.infoLabel,
                                                { color: prioridadStyle.text },
                                            ]}
                                        >
                                            Prioridad
                                        </Text>
                                        <Text
                                            style={[
                                                styles.infoValue,
                                                styles.priorityValue,
                                                { color: prioridadStyle.text },
                                            ]}
                                        >
                                            {prioridad}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.descriptionBox}>
                                    <View style={styles.descriptionHeader}>
                                        <MaterialCommunityIcons
                                            name="text-box-outline"
                                            size={19}
                                            color="#65716B"
                                        />
                                        <Text style={styles.descriptionLabel}>
                                            Descripción
                                        </Text>
                                    </View>

                                    <Text style={styles.descriptionText}>
                                        {descripcion}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.card}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionIconBox}>
                                        <MaterialCommunityIcons
                                            name="clipboard-check-multiple-outline"
                                            size={23}
                                            color="#148248"
                                        />
                                    </View>

                                    <View style={styles.sectionTitleContainer}>
                                        <Text style={styles.sectionTitle}>
                                            Datos de finalización
                                        </Text>
                                        <Text style={styles.sectionSubtitle}>
                                            Registra fechas, recursos, comenatrios y evidencia                                         </Text>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.dateGrid,
                                        useTwoColumns && styles.dateGridColumns,
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
                                                name="calendar-start-outline"
                                                size={17}
                                                color="#148248"
                                            />
                                            <Text style={styles.label}>
                                                Fecha real de inicio
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => setShowInicioReal(true)}
                                            style={styles.dateButton}
                                            activeOpacity={0.82}
                                            disabled={loading}
                                        >
                                            <View style={styles.dateButtonIcon}>
                                                <MaterialCommunityIcons
                                                    name="calendar-outline"
                                                    size={19}
                                                    color="#148248"
                                                />
                                            </View>
                                            <Text style={styles.dateButtonText}>
                                                {fechaInicioReal.toLocaleDateString()}
                                            </Text>
                                            <MaterialCommunityIcons
                                                name="chevron-down"
                                                size={22}
                                                color="#7B8680"
                                            />
                                        </TouchableOpacity>

                                        {showInicioReal && (
                                            <DateTimePicker
                                                value={fechaInicioReal}
                                                mode="date"
                                                onChange={(_, date) => {
                                                    setShowInicioReal(false);

                                                    if (date) {
                                                        setFechaInicioReal(date);
                                                    }
                                                }}
                                            />
                                        )}
                                    </View>

                                    <View
                                        style={[
                                            styles.fieldGroup,
                                            useTwoColumns && styles.fieldHalf,
                                        ]}
                                    >
                                        <View style={styles.labelRow}>
                                            <MaterialCommunityIcons
                                                name="calendar-end-outline"
                                                size={17}
                                                color="#148248"
                                            />
                                            <Text style={styles.label}>
                                                Fecha real de fin
                                            </Text>
                                        </View>

                                        <View style={styles.readOnlyField}>
                                            <View style={styles.readOnlyIconBox}>
                                                <MaterialCommunityIcons
                                                    name="calendar-check-outline"
                                                    size={19}
                                                    color="#68736D"
                                                />
                                            </View>
                                            <Text style={styles.readOnlyValue}>
                                                {formatDate(dateToApi(new Date()))}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.autoDateNotice}>
                                    <MaterialCommunityIcons
                                        name="information-outline"
                                        size={18}
                                        color="#3B6E50"
                                    />
                                    <Text style={styles.autoDateNoticeText}>
                                        La fecha de fin se asigna automáticamente al guardar.
                                    </Text>
                                </View>

                                <View style={styles.subsectionHeader}>
                                    <View style={styles.subsectionTitleRow}>
                                        <MaterialCommunityIcons
                                            name="package-variant-closed"
                                            size={20}
                                            color="#148248"
                                        />
                                          <View style={styles.sectionTitleContainer}>
                                        <Text style={styles.subsectionTitle}>
                                            Materiales y herramientas utilizados
                                        </Text>
                                         <Text style={styles.sectionSubtitle}>
                                            Registra los elementos usados en el trabajo </Text>
                                    </View>
                                    </View>

                                    {materialesSeleccionados.length > 0 && (
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countBadgeText}>
                                                {materialesSeleccionados.length}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.selectButton,
                                        loading && styles.buttonDisabled,
                                    ]}
                                    onPress={abrirModalMateriales}
                                    activeOpacity={0.83}
                                    disabled={loading}
                                >
                                    <View style={styles.selectButtonIconBox}>
                                        <MaterialCommunityIcons
                                            name="plus-circle-outline"
                                            size={25}
                                            color="#148248"
                                        />
                                    </View>
                                    <View style={styles.selectButtonTextContainer}>
                                        <Text style={styles.selectButtonTitle}>
                                            Seleccionar materiales
                                        </Text>
                                        <Text style={styles.selectButtonSubtitle}>
                                            Agrega materiales o herramientas del catálogo
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        color="#148248"
                                    />
                                </TouchableOpacity>

                                {materialesSeleccionados.length === 0 ? (
                                    <View style={styles.emptyInlineBox}>
                                        <MaterialCommunityIcons
                                            name="package-variant"
                                            size={30}
                                            color="#98A29D"
                                        />
                                        <Text style={styles.emptyInlineTitle}>
                                            Sin materiales seleccionados
                                        </Text>
                                        <Text style={styles.emptyInlineText}>
                                            Los materiales agregados aparecerán aquí.
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.materialsContainer}>
                                        {materialesSeleccionados.map((material) => (
                                            <View
                                                key={material.numMaterial}
                                                style={styles.materialSelectedCard}
                                            >
                                                <View style={styles.materialHeader}>
                                                    <View style={styles.materialMainInfo}>
                                                        <View style={styles.materialIconBox}>
                                                            <MaterialCommunityIcons
                                                                name={
                                                                    material.tipoMaterial === "herramienta"
                                                                        ? "hammer-wrench"
                                                                        : "package-variant-closed"
                                                                }
                                                                size={21}
                                                                color="#148248"
                                                            />
                                                        </View>

                                                        <View style={styles.materialTextContainer}>
                                                            <Text style={styles.materialName}>
                                                                {material.nombre}
                                                            </Text>
                                                            <Text style={styles.materialCode}>
                                                                #{material.numMaterial}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <TouchableOpacity
                                                        style={styles.deleteMaterialButton}
                                                        onPress={() =>
                                                            eliminarMaterial(material.numMaterial)
                                                        }
                                                        activeOpacity={0.8}
                                                        disabled={loading}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name="trash-can-outline"
                                                            size={21}
                                                            color="#991B1B"
                                                        />
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.materialDetailsRow}>
                                                    <View style={styles.materialDetailPill}>
                                                        <Text style={styles.materialDetailLabel}>
                                                            Tipo
                                                        </Text>
                                                        <Text style={styles.materialDetailValue}>
                                                            {material.tipoMaterial === "herramienta"
                                                                ? "Herramienta"
                                                                : "Material"}
                                                        </Text>
                                                    </View>

                                                    <View style={styles.materialDetailPill}>
                                                        <Text style={styles.materialDetailLabel}>
                                                            Unidad
                                                        </Text>
                                                        <Text style={styles.materialDetailValue}>
                                                            {material.unidad}
                                                        </Text>
                                                    </View>

                                                    <View style={styles.materialDetailPill}>
                                                        <Text style={styles.materialDetailLabel}>
                                                            Existencia
                                                        </Text>
                                                        <Text style={styles.materialDetailValue}>
                                                            {material.stock}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View style={styles.quantityGroup}>
                                                    <Text style={styles.quantityLabel}>
                                                        Cantidad usada
                                                    </Text>
                                                    <TextInput
                                                        style={styles.quantityInput}
                                                        value={material.cantidad}
                                                        onChangeText={(text) =>
                                                            cambiarCantidadMaterial(
                                                                material.numMaterial,
                                                                text
                                                            )
                                                        }
                                                        placeholder={`Cantidad en ${material.unidad}`}
                                                        placeholderTextColor="#929B96"
                                                        keyboardType="numeric"
                                                        editable={!loading}
                                                    />
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.fieldGroup}>
                                    <View style={styles.labelRow}>
                                        <MaterialCommunityIcons
                                            name="comment-text-outline"
                                            size={17}
                                            color="#148248"
                                        />
                                        <Text style={styles.label}>
                                            Comentarios 
                                        </Text>
                                    </View>

                                    <TextInput
                                        style={[
                                            styles.textArea,
                                            isSmallScreen && styles.textAreaSmall,
                                        ]}
                                        value={comentarios}
                                        onChangeText={setComentarios}
                                        placeholder="Escribe los comentarios finales de la solicitud"
                                        placeholderTextColor="#929B96"
                                        multiline
                                        textAlignVertical="top"
                                        editable={!loading}
                                    />
                                </View>

                                <View style={styles.subsectionHeader}>
                                    <View style={styles.subsectionTitleRow}>
                                        <MaterialCommunityIcons
                                            name="camera-outline"
                                            size={20}
                                            color="#148248"
                                        />
                                        <Text style={styles.subsectionTitle}>
                                            Evidencias del técnico
                                        </Text>
                                    </View>

                                    {imagenes.length > 0 && (
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countBadgeText}>
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
                                            Subir imágenes
                                        </Text>
                                        <Text style={styles.imagePickerSubtitle}>
                                            Selecciona una o varias evidencias
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={25}
                                        color="#148248"
                                    />
                                </TouchableOpacity>

                                {imagenes.length > 0 ? (
                                    <View style={styles.imagesGrid}>
                                        {imagenes.map((img, index) => (
                                            <View
                                                key={img.uri}
                                                style={[
                                                    styles.imageContainer,
                                                    {
                                                        width: previewSize,
                                                        height: previewSize,
                                                    },
                                                ]}
                                            >
                                                <Image
                                                    source={{ uri: img.uri }}
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
                                                    onPress={() => eliminarImagen(img.uri)}
                                                    activeOpacity={0.8}
                                                    disabled={loading}
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
                                ) : (
                                    <View style={styles.emptyInlineBox}>
                                        <MaterialCommunityIcons
                                            name="image-outline"
                                            size={31}
                                            color="#98A29D"
                                        />
                                        <Text style={styles.emptyInlineTitle}>
                                            Sin evidencias seleccionadas
                                        </Text>
                                        <Text style={styles.emptyInlineText}>
                                            Debes agregar al menos una imagen para finalizar.
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
                                        styles.saveButton,
                                        useTwoColumns && styles.actionButtonHalf,
                                        loading && styles.buttonDisabled,
                                    ]}
                                    onPress={guardarSolicitudTerminada}
                                    disabled={loading}
                                    activeOpacity={0.84}
                                >
                                    {loading ? (
                                        <>
                                            <ActivityIndicator
                                                color="#FFFFFF"
                                                size="small"
                                            />
                                            <Text style={styles.actionButtonText}>
                                                Guardando...
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.actionButtonText}>
                                                Guardar 
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
                                >
                                    <Text style={styles.actionButtonText}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <Modal
                        visible={modalMaterialesVisible}
                        animationType="fade"
                        transparent
                        statusBarTranslucent
                        onRequestClose={() => setModalMaterialesVisible(false)}
                    >
                        <KeyboardAvoidingView
                            style={styles.modalOverlay}
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                        >
                            <View
                                style={[
                                    styles.modalContent,
                                    {
                                        width: modalWidth,
                                        maxHeight: modalMaxHeight,
                                    },
                                ]}
                            >
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalTitleIconBox}>
                                        <MaterialCommunityIcons
                                            name="package-variant-closed"
                                            size={25}
                                            color="#148248"
                                        />
                                    </View>

                                    <View style={styles.modalTitleContainer}>
                                        <Text style={styles.modalTitle}>
                                            Catálogo de materiales
                                        </Text>
                                        <Text style={styles.modalSubtitle}>
                                            Selecciona un material o herramienta disponible.
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.modalCloseButton}
                                        onPress={() =>
                                            setModalMaterialesVisible(false)
                                        }
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={23}
                                            color="#59645E"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalDivider} />

                                <View style={styles.searchContainer}>
                                    <MaterialCommunityIcons
                                        name="magnify"
                                        size={21}
                                        color="#7B8680"
                                    />
                                    <TextInput
                                        style={styles.searchInput}
                                        value={busquedaMaterial}
                                        onChangeText={setBusquedaMaterial}
                                        placeholder="Buscar por nombre o tipo..."
                                        placeholderTextColor="#929B96"
                                    />
                                    {busquedaMaterial.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setBusquedaMaterial("")}
                                            activeOpacity={0.8}
                                        >
                                            <MaterialCommunityIcons
                                                name="close-circle"
                                                size={20}
                                                color="#9AA39F"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <ScrollView
                                    style={styles.modalList}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={styles.modalScrollContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {loadingMateriales && (
                                        <View style={styles.modalEmptyState}>
                                            <ActivityIndicator
                                                size="large"
                                                color="#148248"
                                            />
                                            <Text style={styles.modalEmptyTitle}>
                                                Cargando catálogo
                                            </Text>
                                            <Text style={styles.modalEmptyText}>
                                                Espera un momento...
                                            </Text>
                                        </View>
                                    )}

                                    {!loadingMateriales &&
                                        materialesFiltrados.length === 0 && (
                                            <View style={styles.modalEmptyState}>
                                                <MaterialCommunityIcons
                                                    name="package-variant"
                                                    size={42}
                                                    color="#9BA59F"
                                                />
                                                <Text style={styles.modalEmptyTitle}>
                                                    Sin resultados
                                                </Text>
                                                <Text style={styles.modalEmptyText}>
                                                    No hay materiales ni herramientas disponibles.
                                                </Text>
                                            </View>
                                        )}

                                    {!loadingMateriales &&
                                        materialesFiltrados.map((material) => {
                                            const sinStock = Number(material.stock ?? 0) <= 0;

                                            return (
                                                <TouchableOpacity
                                                    key={material.numMaterial}
                                                    style={[
                                                        styles.materialCatalogCard,
                                                        sinStock &&
                                                        styles.materialCatalogCardDisabled,
                                                    ]}
                                                    onPress={() => agregarMaterial(material)}
                                                    activeOpacity={0.82}
                                                >
                                                    <View style={styles.catalogIconBox}>
                                                        <MaterialCommunityIcons
                                                            name={
                                                                material.tipoMaterial === "herramienta"
                                                                    ? "hammer-wrench"
                                                                    : "package-variant-closed"
                                                            }
                                                            size={23}
                                                            color={
                                                                sinStock
                                                                    ? "#9CA3AF"
                                                                    : "#148248"
                                                            }
                                                        />
                                                    </View>

                                                    <View style={styles.catalogTextContainer}>
                                                        <Text
                                                            style={[
                                                                styles.materialCatalogName,
                                                                sinStock &&
                                                                styles.catalogTextDisabled,
                                                            ]}
                                                        >
                                                            {material.nombre}
                                                        </Text>
                                                        <Text style={styles.materialCatalogText}>
                                                            {material.tipoMaterial === "herramienta"
                                                                ? "Herramienta"
                                                                : "Material"}
                                                            {` · ${material.unidad ?? "unidad"}`}
                                                        </Text>
                                                    </View>

                                                    <View
                                                        style={[
                                                            styles.stockBadge,
                                                            sinStock &&
                                                            styles.stockBadgeDisabled,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.stockBadgeLabel,
                                                                sinStock &&
                                                                styles.stockBadgeLabelDisabled,
                                                            ]}
                                                        >
                                                            Stock
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                styles.stockBadgeValue,
                                                                sinStock &&
                                                                styles.stockBadgeLabelDisabled,
                                                            ]}
                                                        >
                                                            {material.stock ?? 0}
                                                        </Text>
                                                    </View>

                                                    <MaterialCommunityIcons
                                                        name="chevron-right"
                                                        size={23}
                                                        color={
                                                            sinStock
                                                                ? "#B6BCB9"
                                                                : "#148248"
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })}
                                </ScrollView>
                            </View>
                        </KeyboardAvoidingView>
                    </Modal>
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

    emptySafeArea: {
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

    introCenteredContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 4,
        marginBottom: 16,
    },

    introIconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        borderWidth: 1,
        borderColor: "#D6EADF",
        marginBottom: 10,
    },

    introTitle: {
        color: "#243029",
        fontSize: 19,
        lineHeight: 24,
        fontWeight: "800",
        textAlign: "center",
    },

    introSubtitle: {
        maxWidth: 430,
        color: "#748079",
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "500",
        textAlign: "center",
        marginTop: 3,
    },

    card: {
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
        width: 44,
        height: 44,
        borderRadius: 14,
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

    requestNumberBadge: {
        minHeight: 31,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        borderRadius: 16,
        paddingHorizontal: 10,
        marginLeft: 8,
    },

    requestNumberText: {
        color: "#148248",
        fontSize: 11,
        fontWeight: "800",
    },

    infoGrid: {
        width: "100%",
    },

    infoGridColumns: {
        flexDirection: "row",
        alignItems: "stretch",
    },

    infoBox: {
        minHeight: 59,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F9F8",
        borderWidth: 1,
        borderColor: "#E8EDEB",
        borderRadius: 13,
        paddingHorizontal: 10,
        paddingVertical: 9,
        marginBottom: 9,
    },

    infoBoxHalf: {
        flex: 1,
    },

    infoBoxSpacingRight: {
        marginRight: 9,
    },

    infoIconBox: {
        width: 35,
        height: 35,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        marginRight: 9,
        flexShrink: 0,
    },

    infoTextContainer: {
        flex: 1,
        minWidth: 0,
    },

    infoLabel: {
        color: "#7A837E",
        fontSize: 10,
        fontWeight: "600",
    },

    infoValue: {
        color: "#27332D",
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "800",
        marginTop: 2,
    },

    priorityRow: {
        minHeight: 63,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 13,
        paddingHorizontal: 10,
        paddingVertical: 9,
        marginBottom: 9,
    },

    priorityIconBox: {
        width: 37,
        height: 37,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.58)",
        marginRight: 9,
        flexShrink: 0,
    },

    priorityValue: {
        textTransform: "capitalize",
    },

    descriptionBox: {
        backgroundColor: "#F7F9F8",
        borderWidth: 1,
        borderColor: "#E8EDEB",
        borderRadius: 13,
        padding: 11,
    },

    descriptionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 7,
    },

    descriptionLabel: {
        color: "#65716B",
        fontSize: 11,
        fontWeight: "800",
        marginLeft: 6,
    },

    descriptionText: {
        color: "#4B5563",
        fontSize: 13,
        lineHeight: 19,
    },

    dateGrid: {
        width: "100%",
    },

    dateGridColumns: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    fieldGroup: {
        width: "100%",
        marginBottom: 16,
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

    dateButton: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DCE3DF",
        borderRadius: 13,
        paddingHorizontal: 10,
    },

    dateButtonIcon: {
        width: 35,
        height: 35,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        marginRight: 9,
        flexShrink: 0,
    },

    dateButtonText: {
        flex: 1,
        color: "#27332D",
        fontSize: 13,
        fontWeight: "700",
    },

    readOnlyField: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EDF2EF",
        borderWidth: 1,
        borderColor: "#D8E0DC",
        borderRadius: 13,
        paddingHorizontal: 10,
    },

    readOnlyIconBox: {
        width: 35,
        height: 35,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E1E8E4",
        marginRight: 9,
        flexShrink: 0,
    },

    readOnlyValue: {
        flex: 1,
        color: "#66716B",
        fontSize: 13,
        fontWeight: "700",
    },

    autoDateNotice: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EDF7F1",
        borderWidth: 1,
        borderColor: "#D1E8DA",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 9,
        marginTop: -5,
        marginBottom: 18,
    },

    autoDateNoticeText: {
        flex: 1,
        color: "#53655B",
        fontSize: 11,
        lineHeight: 16,
        marginLeft: 7,
    },

    subsectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 3,
        marginBottom: 10,
    },

    subsectionTitleRow: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
    },

    subsectionTitle: {
        flex: 1,
        color: "#334039",
        fontSize: 14,
        lineHeight: 19,
        fontWeight: "800",
        marginLeft: 7,
    },

    countBadge: {
        minWidth: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#148248",
        borderRadius: 14,
        paddingHorizontal: 7,
        marginLeft: 8,
    },

    countBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
    },

    selectButton: {
        minHeight: 72,
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

    selectButtonIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D6EADF",
        marginRight: 10,
        flexShrink: 0,
    },

    selectButtonTextContainer: {
        flex: 1,
        minWidth: 0,
    },

    selectButtonTitle: {
        color: "#148248",
        fontSize: 14,
        fontWeight: "800",
    },

    selectButtonSubtitle: {
        color: "#718078",
        fontSize: 11,
        lineHeight: 16,
        marginTop: 2,
    },

    emptyInlineBox: {
        minHeight: 126,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F7F9F8",
        borderWidth: 1,
        borderColor: "#E5EAE7",
        borderRadius: 14,
        paddingHorizontal: 18,
        marginTop: 13,
        marginBottom: 18,
    },

    emptyInlineTitle: {
        color: "#626E68",
        fontSize: 13,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 8,
    },

    emptyInlineText: {
        color: "#8A948F",
        fontSize: 11,
        lineHeight: 16,
        textAlign: "center",
        marginTop: 3,
    },

    materialsContainer: {
        marginTop: 13,
        marginBottom: 8,
    },

    materialSelectedCard: {
        backgroundColor: "#F7F9F8",
        borderWidth: 1,
        borderColor: "#E2E8E4",
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
    },

    materialHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    materialMainInfo: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
    },

    materialIconBox: {
        width: 42,
        height: 42,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        marginRight: 10,
        flexShrink: 0,
    },

    materialTextContainer: {
        flex: 1,
        minWidth: 0,
    },

    materialName: {
        color: "#27332D",
        fontSize: 14,
        lineHeight: 19,
        fontWeight: "800",
    },

    materialCode: {
        color: "#7E8983",
        fontSize: 10,
        fontWeight: "700",
        marginTop: 2,
    },

    deleteMaterialButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        marginLeft: 8,
    },

    materialDetailsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 11,
        marginRight: -7,
        marginBottom: 3,
    },

    materialDetailPill: {
        minWidth: 88,
        flexGrow: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E4EAE7",
        borderRadius: 11,
        paddingHorizontal: 9,
        paddingVertical: 7,
        marginRight: 7,
        marginBottom: 7,
    },

    materialDetailLabel: {
        color: "#87918C",
        fontSize: 9,
        fontWeight: "600",
    },

    materialDetailValue: {
        color: "#38433D",
        fontSize: 11,
        fontWeight: "800",
        marginTop: 2,
    },

    quantityGroup: {
        marginTop: 5,
    },

    quantityLabel: {
        color: "#4A554F",
        fontSize: 11,
        fontWeight: "800",
        marginBottom: 6,
    },

    quantityInput: {
        minHeight: 48,
        color: "#27332D",
        fontSize: 13,
        fontWeight: "700",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DCE3DF",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
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
        minHeight: 108,
    },

    imagePickerButton: {
        minHeight: 72,
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
        marginBottom: 8,
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

    saveButton: {
        minHeight: 52,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#232323",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 13,
        marginBottom: 10,
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

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(10,20,15,0.55)",
        paddingHorizontal: 10,
        paddingVertical: 18,
    },

    modalContent: {
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E0E7E3",
        borderRadius: 22,
        ...Platform.select({
            android: {
                elevation: 12,
            },
            ios: {
                shadowColor: "#000000",
                shadowOpacity: 0.2,
                shadowRadius: 18,
                shadowOffset: {
                    width: 0,
                    height: 8,
                },
            },
        }),
    },

    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 13,
    },

    modalTitleIconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        marginRight: 10,
        flexShrink: 0,
    },

    modalTitleContainer: {
        flex: 1,
        minWidth: 0,
        marginRight: 8,
    },

    modalTitle: {
        color: "#25312B",
        fontSize: 16,
        lineHeight: 21,
        fontWeight: "800",
    },

    modalSubtitle: {
        color: "#77827C",
        fontSize: 10,
        lineHeight: 15,
        marginTop: 2,
    },

    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F5F3",
        borderWidth: 1,
        borderColor: "#E4E9E6",
        flexShrink: 0,
    },

    modalDivider: {
        width: "100%",
        height: 1,
        backgroundColor: "#E9EEEB",
    },

    searchContainer: {
        minHeight: 50,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F9F8",
        borderWidth: 1,
        borderColor: "#DDE4E0",
        borderRadius: 13,
        paddingHorizontal: 11,
        marginHorizontal: 15,
        marginTop: 14,
        marginBottom: 11,
    },

    searchInput: {
        flex: 1,
        minWidth: 0,
        color: "#27332D",
        fontSize: 13,
        paddingHorizontal: 8,
        paddingVertical: 9,
    },

    modalList: {
        flexShrink: 1,
    },

    modalScrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 16,
    },

    materialCatalogCard: {
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F9F8",
        borderWidth: 1,
        borderColor: "#E2E8E4",
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 9,
        marginBottom: 9,
    },

    materialCatalogCardDisabled: {
        backgroundColor: "#F3F4F4",
        opacity: 0.72,
    },

    catalogIconBox: {
        width: 43,
        height: 43,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        marginRight: 10,
        flexShrink: 0,
    },

    catalogTextContainer: {
        flex: 1,
        minWidth: 0,
        marginRight: 7,
    },

    materialCatalogName: {
        color: "#27332D",
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "800",
    },

    materialCatalogText: {
        color: "#7B8580",
        fontSize: 10,
        lineHeight: 15,
        marginTop: 2,
    },

    catalogTextDisabled: {
        color: "#8C9390",
    },

    stockBadge: {
        minWidth: 54,
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        borderRadius: 11,
        paddingHorizontal: 7,
        paddingVertical: 6,
        marginRight: 5,
    },

    stockBadgeDisabled: {
        backgroundColor: "#F3F4F6",
        borderColor: "#D1D5DB",
    },

    stockBadgeLabel: {
        color: "#377259",
        fontSize: 8,
        fontWeight: "600",
    },

    stockBadgeValue: {
        color: "#065F46",
        fontSize: 12,
        fontWeight: "800",
        marginTop: 1,
    },

    stockBadgeLabelDisabled: {
        color: "#7B8280",
    },

    modalEmptyState: {
        minHeight: 190,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },

    modalEmptyTitle: {
        color: "#5E6963",
        fontSize: 14,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 10,
    },

    modalEmptyText: {
        color: "#89928D",
        fontSize: 11,
        lineHeight: 16,
        textAlign: "center",
        marginTop: 3,
    },

    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 25,
    },

    emptyIconBox: {
        width: 104,
        height: 104,
        borderRadius: 52,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        borderWidth: 1,
        borderColor: "#D6EADF",
        marginBottom: 17,
    },

    emptyTitle: {
        color: "#374151",
        fontSize: 18,
        fontWeight: "800",
        textAlign: "center",
    },

    emptyText: {
        maxWidth: 360,
        color: "#737B87",
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
        marginTop: 6,
    },

    returnButton: {
        minHeight: 46,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#232323",
        borderRadius: 13,
        paddingHorizontal: 17,
        marginTop: 18,
    },

    returnButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
        marginLeft: 7,
    },
});