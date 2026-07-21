import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
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

import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";

const repository = new SupabaseRequestsRepository();

type Props = {
    visible: boolean;
    solicitud: any;
    onClose: () => void;
    onUpdated: (solicitudActualizada: any) => void;
};

export default function EditRequestModal({
    visible,
    solicitud,
    onClose,
    onUpdated,
}: Props) {
    const { width, height } = useWindowDimensions();

    const [editNumTipoMantenimiento, setEditNumTipoMantenimiento] =
        useState("");
    const [editNumTipo, setEditNumTipo] = useState("");
    const [editNumArea, setEditNumArea] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);

    const isSmallScreen = width < 370 || height < 650;
    const isTablet = width >= 700;
    const useTwoColumns = width >= 680;

    const modalWidth = Math.max(
        280,
        Math.min(width - (isTablet ? 120 : 24), 620)
    );

    const modalMaxHeight = Math.max(
        420,
        height - (isSmallScreen ? 28 : isTablet ? 100 : 56)
    );

    useEffect(() => {
        if (solicitud && visible) {
            setEditNumTipoMantenimiento(
                String(solicitud.numTipoMantenimiento ?? "")
            );
            setEditNumTipo(String(solicitud.numTipo ?? ""));
            setEditNumArea(String(solicitud.numArea ?? ""));
            setEditDescripcion(solicitud.descripcion ?? "");
        }
    }, [solicitud, visible]);

    const cambiarTipoSolicitud = (value: string) => {
        setEditNumTipo(value);

        if (value !== "2") {
            setEditNumTipoMantenimiento("");
        }
    };

    const guardarCambios = async () => {
        try {
            if (!solicitud?.numSolicitud) {
                Alert.alert("Error", "No se encontró el número de solicitud");
                return;
            }

            if (!editNumTipo) {
                Alert.alert("Error", "Selecciona el tipo de solicitud");
                return;
            }

            if (editNumTipo === "2" && !editNumTipoMantenimiento) {
                Alert.alert("Error", "Selecciona el tipo de mantenimiento");
                return;
            }

            if (!editNumArea) {
                Alert.alert("Error", "Selecciona el área");
                return;
            }

            if (!editDescripcion.trim()) {
                Alert.alert("Error", "La descripción no puede estar vacía");
                return;
            }

            setGuardando(true);

            const datosActualizados = {
                numTipo: Number(editNumTipo),
                numTipoMantenimiento: editNumTipoMantenimiento
                    ? Number(editNumTipoMantenimiento)
                    : undefined,
                numArea: Number(editNumArea),
                descripcion: editDescripcion.trim(),
            };

            await repository.updateRequest(
                solicitud.numSolicitud,
                datosActualizados
            );

            onUpdated({
                ...solicitud,
                ...datosActualizados,
            });

            Alert.alert("OK", "Información actualizada correctamente");
            onClose();
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "No se pudo actualizar la solicitud"
            );
        } finally {
            setGuardando(false);
        }
    };

    const cerrarModal = () => {
        if (guardando) return;
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={cerrarModal}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View
                    style={[
                        styles.modalCard,
                        {
                            width: modalWidth,
                            maxHeight: modalMaxHeight,
                        },
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <View style={styles.headerIconBox}>
                            <MaterialCommunityIcons
                                name="file-edit-outline"
                                size={27}
                                color="#148248"
                            />
                        </View>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>
                                Editar información de solicitud
                            </Text>
                            <Text style={styles.subtitle}>
                                Actualiza los datos generales de la solicitud.
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={cerrarModal}
                            disabled={guardando}
                            activeOpacity={0.8}
                            accessibilityLabel="Cerrar modal"
                        >
                            <MaterialCommunityIcons
                                name="close"
                                size={23}
                                color="#59645E"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.informationHeader}>
                        <Text style={styles.informationTitle}>
                            Información de la solicitud
                        </Text>

                        <Text style={styles.informationDescription}>
                            Modifica los campos necesarios antes de guardar los cambios.
                        </Text>
                    </View>
                    <ScrollView
                        style={styles.modalBody}
                        contentContainerStyle={[
                            styles.modalBodyContent,
                            isSmallScreen && styles.modalBodyContentSmall,
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View
                            style={[
                                styles.fieldsGrid,
                                useTwoColumns && styles.fieldsGridColumns,
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
                                        name="clipboard-text-outline"
                                        size={17}
                                        color="#148248"
                                    />
                                    <Text style={styles.label}>Tipo de solicitud</Text>
                                </View>

                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={editNumTipo}
                                        onValueChange={(value) =>
                                            cambiarTipoSolicitud(String(value))
                                        }
                                        style={styles.picker}
                                        dropdownIconColor="#148248"
                                        enabled={!guardando}
                                    >
                                        <Picker.Item label="Servicio" value="1" />
                                        <Picker.Item label="Mantenimiento" value="2" />
                                    </Picker>
                                </View>
                            </View>

                            {editNumTipo === "2" && (
                                <View style={styles.fieldGroup}>
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
                                            selectedValue={editNumTipoMantenimiento}
                                            onValueChange={(value) =>
                                                setEditNumTipoMantenimiento(String(value))
                                            }
                                            style={styles.picker}
                                            dropdownIconColor="#148248"
                                            enabled={!guardando}
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

                            <View
                                style={[
                                    styles.fieldGroup,
                                    useTwoColumns && styles.fieldHalf,
                                ]}
                            >
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
                                        selectedValue={editNumArea}
                                        onValueChange={(value) =>
                                            setEditNumArea(String(value))
                                        }
                                        style={styles.picker}
                                        dropdownIconColor="#148248"
                                        enabled={!guardando}
                                    >
                                        <Picker.Item label="Administración" value="1" />
                                        <Picker.Item label="Fábrica" value="2" />
                                        <Picker.Item label="Campo" value="3" />
                                        <Picker.Item
                                            label="Zona habitacional"
                                            value="4"
                                        />
                                    </Picker>
                                </View>
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
                                value={editDescripcion}
                                onChangeText={setEditDescripcion}
                                placeholder="Escribe la descripción de la solicitud"
                                placeholderTextColor="#929B96"
                                multiline
                                textAlignVertical="top"
                                editable={!guardando}
                            />

                        </View>
                    </ScrollView>

                    <View style={styles.footerDivider} />

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
                                guardando && styles.buttonDisabled,
                            ]}
                            onPress={guardarCambios}
                            disabled={guardando}
                            activeOpacity={0.84}
                            accessibilityLabel="Guardar cambios"
                        >
                            {guardando ? (
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
                                        Guardar cambios
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.cancelButton,
                                useTwoColumns && styles.actionButtonHalf,
                                useTwoColumns && styles.cancelButtonRow,
                                guardando && styles.buttonDisabled,
                            ]}
                            onPress={cerrarModal}
                            disabled={guardando}
                            activeOpacity={0.84}
                            accessibilityLabel="Cancelar edición"
                        >
                            <Text style={styles.actionButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(10,20,15,0.55)",
        paddingHorizontal: 12,
        paddingVertical: 18,
    },

    modalCard: {
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
    },

    headerIconBox: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        borderWidth: 1,
        borderColor: "#D6EADF",
        marginRight: 11,
        flexShrink: 0,
    },

    headerTextContainer: {
        flex: 1,
        minWidth: 0,
        marginRight: 8,
    },

    title: {
        color: "#25312B",
        fontSize: 17,
        lineHeight: 22,
        fontWeight: "800",
    },

    subtitle: {
        color: "#77827C",
        fontSize: 11,
        lineHeight: 16,
        marginTop: 3,
    },

    closeButton: {
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

    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#E9EEEB",
    },

    modalBody: {
        flexShrink: 1,
    },

    modalBodyContent: {
        paddingHorizontal: 16,
        paddingTop: 17,
        paddingBottom: 18,
    },

    modalBodyContentSmall: {
        paddingTop: 13,
        paddingBottom: 14,
    },

    fieldsGrid: {
        width: "100%",
    },

    fieldsGridColumns: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    fieldGroup: {
        width: "100%",
        marginBottom: 16,
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
        minHeight: 105,
    },

    helperText: {
        color: "#87918C",
        fontSize: 11,
        lineHeight: 16,
        marginTop: 6,
    },

    footerDivider: {
        width: "100%",
        height: 1,
        backgroundColor: "#E9EEEB",
    },

    actionsContainer: {
        width: "100%",
        paddingHorizontal: 16,
        paddingTop: 13,
        paddingBottom: Platform.OS === "ios" ? 18 : 14,
    },

    actionsContainerRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    actionButtonHalf: {
        flex: 1,
    },

    saveButton: {
        minHeight: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#232323",
        borderRadius: 13,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 9,
    },

    cancelButton: {
        minHeight: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#870C0C",
        borderRadius: 13,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },

    cancelButtonRow: {
        marginLeft: 11,
        marginBottom: 9,
    },

    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
        marginLeft: 7,
    },

    buttonDisabled: {
        opacity: 0.62,
    },
    informationHeader: {
  width: "100%",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 4,
},

informationTitle: {
  width: "100%",
  color: "#25312B",
  fontSize: 16,
  lineHeight: 21,
  fontWeight: "800",
  textAlign: "center",
},

informationDescription: {
  width: "100%",
  maxWidth: 430,
  color: "#77827C",
  fontSize: 12,
  lineHeight: 17,
  fontWeight: "400",
  textAlign: "center",
  marginTop: 4,
},
});