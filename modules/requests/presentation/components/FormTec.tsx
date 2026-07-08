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
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { api } from "@/lib/api";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();

type MaterialCatalogo = {
    numMaterial: number;
    nombre: string;
    descripcion?: string;
    unidad?: string;
    stock?: number;
};

type MaterialSeleccionado = {
    numMaterial: number;
    nombre: string;
    unidad: string;
    cantidad: string;
    stock: number;
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

export default function CompleteRequestForm() {
    const router = useRouter();
    const params = useLocalSearchParams();

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

    const [fechaFinReal, setFechaFinReal] = useState<Date>(new Date());

    const [showInicioReal, setShowInicioReal] = useState(false);
    const [showFinReal, setShowFinReal] = useState(false);

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

                    return {
                        numMaterial,
                        nombre,
                        descripcion,
                        unidad,
                        stock,
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
            material.nombre.toLowerCase().includes(search)
        );
    }, [busquedaMaterial, materiales]);

    const agregarMaterial = (material: MaterialCatalogo) => {
        const stockDisponible = Number(material.stock ?? 0);

        if (stockDisponible <= 0) {
            Alert.alert(
                "Sin existencia",
                `No puedes seleccionar ${material.nombre} porque no tiene existencia disponible.`
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
                        `Solo hay ${stockDisponible} ${item.unidad} de ${item.nombre} en existencia.`
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

        if (!(fechaFinReal instanceof Date) || isNaN(fechaFinReal.getTime())) {
            Alert.alert("Campo obligatorio", "Ingresa la fecha real de fin.");
            return false;
        }

        if (dateToApi(fechaFinReal) < dateToApi(fechaInicioReal)) {
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
            const fechaFinRealApi = dateToApi(fechaFinReal);

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
            <View style={styles.center}>
                <Text>No se encontró la solicitud</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() =>
                            router.back()
                        }
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={28}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>

                    <View style={styles.rowHeader}>
                        <Image
                            source={require('../../../../assets/images/ZUCARMEX.png')}
                            style={styles.imageZucarmex}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>
                            Datos de la solicitud
                        </Text>

                        <Text style={styles.label}>Solicitante:</Text>
                        <Text style={styles.value}>{solicitante}</Text>

                        <Text style={styles.label}>Fecha:</Text>
                        <Text style={styles.value}>{formatDate(fechaSolicitud)}</Text>

                        <Text style={styles.label}>Área:</Text>
                        <Text style={styles.value}>{area}</Text>

                        <Text style={styles.label}>Prioridad:</Text>
                        <Text style={styles.value}>{prioridad}</Text>

                        <Text style={styles.label}>Descripción:</Text>
                        <Text style={styles.value}>{descripcion}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>
                            Datos de finalización
                        </Text>

                        <Text style={styles.label}>Fecha real de inicio:</Text>

                        <TouchableOpacity
                            onPress={() => setShowInicioReal(true)}
                            style={styles.input}
                        >
                            <Text>{fechaInicioReal.toLocaleDateString()}</Text>
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

                        <Text style={styles.label}>Fecha real de fin:</Text>

                        <TouchableOpacity
                            onPress={() => setShowFinReal(true)}
                            style={styles.input}
                        >
                            <Text>{fechaFinReal.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        {showFinReal && (
                            <DateTimePicker
                                value={fechaFinReal}
                                mode="date"
                                onChange={(_, date) => {
                                    setShowFinReal(false);

                                    if (date) {
                                        setFechaFinReal(date);
                                    }
                                }}
                            />
                        )}

                        <Text style={styles.label}>Materiales utilizados:</Text>

                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={abrirModalMateriales}
                        >
                            <MaterialCommunityIcons
                                name="plus-circle-outline"
                                size={22}
                                color="#148248"
                            />

                            <Text style={styles.selectButtonText}>
                                Seleccionar materiales
                            </Text>
                        </TouchableOpacity>

                        {materialesSeleccionados.length === 0 && (
                            <Text style={styles.helperText}>
                                No has seleccionado materiales.
                            </Text>
                        )}

                        {materialesSeleccionados.map((material) => (
                            <View
                                key={material.numMaterial}
                                style={styles.materialSelectedCard}
                            >
                                <View style={styles.materialHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.materialName}>
                                            {material.nombre}
                                        </Text>

                                        <Text style={styles.materialUnit}>
                                            Unidad: {material.unidad}
                                        </Text>

                                        <Text style={styles.materialUnit}>
                                            Existencia disponible: {material.stock}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => eliminarMaterial(material.numMaterial)}
                                    >
                                        <MaterialCommunityIcons
                                            name="trash-can-outline"
                                            size={24}
                                            color="#EF4444"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>Cantidad usada:</Text>

                                <TextInput
                                    style={styles.input}
                                    value={material.cantidad}
                                    onChangeText={(text) =>
                                        cambiarCantidadMaterial(material.numMaterial, text)
                                    }
                                    placeholder={`Cantidad en ${material.unidad}`}
                                    keyboardType="numeric"
                                />
                            </View>
                        ))}

                        <Text style={styles.label}>Comentarios:</Text>

                        <TextInput
                            style={styles.textArea}
                            value={comentarios}
                            onChangeText={setComentarios}
                            placeholder="Escribe los comentarios finales de la solicitud"
                            multiline
                            textAlignVertical="top"
                        />

                        <Text style={styles.label}>Evidencias del técnico:</Text>

                        <TouchableOpacity
                            style={styles.imageButton}
                            onPress={seleccionarImagenes}
                        >
                            <MaterialCommunityIcons
                                name="image-plus"
                                size={22}
                                color="#fff"
                            />

                            <Text style={styles.imageButtonText}>
                                Subir imágenes
                            </Text>
                        </TouchableOpacity>

                        {imagenes.length > 0 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.imagesScroll}
                            >
                                {imagenes.map((img) => (
                                    <View key={img.uri} style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: img.uri }}
                                            style={styles.previewImage}
                                        />

                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => eliminarImagen(img.uri)}
                                        >
                                            <MaterialCommunityIcons
                                                name="close"
                                                size={18}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            loading && styles.saveButtonDisabled,
                        ]}
                        onPress={guardarSolicitudTerminada}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? "Guardando..." : "Guardar"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={modalMaterialesVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalMaterialesVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Catálogo de materiales
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
                            style={styles.searchInput}
                            value={busquedaMaterial}
                            onChangeText={setBusquedaMaterial}
                            placeholder="Buscar material..."
                        />

                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.modalScrollContent}
                        >
                            {loadingMateriales && (
                                <Text style={styles.emptyMaterials}>
                                    Cargando materiales...
                                </Text>
                            )}

                            {!loadingMateriales &&
                                materialesFiltrados.length === 0 && (
                                    <Text style={styles.emptyMaterials}>
                                        No hay materiales disponibles
                                    </Text>
                                )}

                            {!loadingMateriales &&
                                materialesFiltrados.map((material) => (
                                    <TouchableOpacity
                                        key={material.numMaterial}
                                        style={styles.materialCatalogCard}
                                        onPress={() => agregarMaterial(material)}
                                    >
                                        <Text style={styles.materialCatalogName}>
                                            {material.nombre}
                                        </Text>

                                        <Text style={styles.materialCatalogText}>
                                            Unidad: {material.unidad ?? "unidad"}
                                        </Text>

                                        <Text style={styles.materialCatalogText}>
                                            Stock: {material.stock ?? 0}
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

    header: {
        width: "100%",
        height: 100,
        paddingTop: 35,
        backgroundColor: "#148248",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 16,
    },

    content: {
        padding: 16,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        elevation: 3,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 12,
    },

    scrollContent: {
        paddingBottom: 80,
    },

    label: {
        fontWeight: "bold",
        color: "#374151",
        marginTop: 8,
        marginBottom: 5,
    },

    value: {
        color: "#4B5563",
        marginBottom: 5,
    },

    backBtn: {
        position: "absolute",
        left: 15,
        top: 45,
    },

    input: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#111827",
    },

    textArea: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 140,
        color: "#111827",
    },

    selectButton: {
        borderWidth: 1,
        borderColor: "#148248",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },

    selectButtonText: {
        color: "#148248",
        fontWeight: "bold",
        marginLeft: 8,
    },

    helperText: {
        marginTop: 8,
        color: "#6B7280",
        fontSize: 13,
    },

    materialSelectedCard: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
    },

    materialHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    materialName: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#111827",
    },

    materialUnit: {
        color: "#6B7280",
        marginTop: 2,
    },

    imageButton: {
        backgroundColor: "#3a6e19",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    imageButtonText: {
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
    },

    imagesScroll: {
        marginTop: 12,
    },

    imageContainer: {
        position: "relative",
        marginRight: 10,
    },

    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },

    removeImageButton: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "#EF4444",
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
    },

    saveButton: {
        backgroundColor: "#232323",
        paddingVertical: 14,
        marginHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 4,
        marginBottom: 30,
    },

    saveButtonDisabled: {
        opacity: 0.7,
    },

    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
        paddingBottom: 34,
    },

    modalContent: {
        backgroundColor: "#fff",
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

    searchInput: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 14,
        marginBottom: 12,
    },

    modalScrollContent: {
        paddingBottom: 25,
    },

    materialCatalogCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    materialCatalogName: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#111827",
    },

    materialCatalogText: {
        color: "#6B7280",
        marginTop: 2,
    },

    emptyMaterials: {
        textAlign: "center",
        color: "#6B7280",
        marginTop: 20,
        marginBottom: 20,
    },

    cancelButton: {
        backgroundColor: "#870c0c",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 20,
    },

    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
    },

    rowHeader: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },

    imageZucarmex: {
        width: "45%",
        height: 60,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});