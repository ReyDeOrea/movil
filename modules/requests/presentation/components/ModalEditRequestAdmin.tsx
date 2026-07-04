import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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
    const [editNumTipoMantenimiento, setEditNumTipoMantenimiento] = useState("");
    const [editNumTipo, setEditNumTipo] = useState("");
    const [editNumArea, setEditNumArea] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (solicitud && visible) {
            setEditNumTipoMantenimiento(String(solicitud.numTipoMantenimiento ?? ""));
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

    return (
        <Modal visible={visible} animationType="slide">
            <ScrollView contentContainerStyle={styles.modal}>
                <Text style={styles.title}>Editar información de solicitud</Text>

                <Text style={styles.label}>Tipo de solicitud</Text>

                <Picker
                    selectedValue={editNumTipo}
                    onValueChange={cambiarTipoSolicitud}
                    style={styles.picker}
                >
                    <Picker.Item label="Servicio" value="1" />
                    <Picker.Item label="Mantenimiento" value="2" />
                </Picker>

                {editNumTipo === "2" && (
                    <>
                        <Text style={styles.label}>Tipo de mantenimiento</Text>

                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={editNumTipoMantenimiento}
                                onValueChange={(value) => setEditNumTipoMantenimiento(value)}
                            >
                                <Picker.Item
                                    label="Seleccione..."
                                    value=""
                                    enabled={false}
                                    color="#999"
                                />
                                <Picker.Item label="Preventivo" value="1" />
                                <Picker.Item label="Correctivo" value="2" />
                                <Picker.Item label="Reactivo" value="3" />
                            </Picker>
                        </View>
                    </>
                )}


                <Text style={styles.label}>Área</Text>

                <Picker
                    selectedValue={editNumArea}
                    onValueChange={(value) => setEditNumArea(value)}
                    style={styles.picker}
                >
                    <Picker.Item label="Administración" value="1" />
                    <Picker.Item label="Fábrica" value="2" />
                    <Picker.Item label="Campo" value="3" />
                    <Picker.Item label="Zona habitacional" value="4" />
                </Picker>

                <Text style={styles.label}>Descripción</Text>

                <TextInput
                    style={styles.textArea}
                    value={editDescripcion}
                    onChangeText={setEditDescripcion}
                    placeholder="Escribe la descripción de la solicitud"
                    multiline
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={guardarCambios}
                    disabled={guardando}
                >
                    <Text style={styles.saveText}>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onClose}
                    disabled={guardando}
                >
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </ScrollView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        flexGrow: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#F5F5F5",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    label: {
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 5,
    },
    picker: {
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    textArea: {
        height: 130,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
    },
    saveBtn: {
        backgroundColor: "#232323",
        padding: 15,
        marginBottom: 20,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 20
    },
    saveText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },
    cancelBtn: {
        backgroundColor: "#870c0c",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 20,
    },
    cancelText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 10,
        backgroundColor: "#FFF",
        marginBottom: 15,
    },
});