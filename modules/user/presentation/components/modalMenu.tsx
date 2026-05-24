import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ModalMenuProps {
    visible: boolean;
    onClose: () => void;
    user: any;
    setUser: (u: any) => void;
    onUpdate?: () => void;
}

export function ModalMenu({ visible, onClose, user, setUser, onUpdate }: ModalMenuProps) {

    const insets = useSafeAreaInsets();
    const role = user?.rol;

    const logout = async () => {
        await AsyncStorage.removeItem("user");
        setUser(null);
        onUpdate?.();
        onClose();
        router.replace("/login");
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalBackground}>

                <View style={[
                    styles.modalContainer,
                    { paddingBottom: insets.bottom + 15 }
                ]}>

                    <Text style={styles.modalTitle}>Menú</Text>

                    <View style={styles.optionsContainer}>

                        {role && (
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onClose();
                                    router.push("/");
                                }}
                            >
                                <Feather name="user" size={24} color="#999" />
                                <Text style={styles.navText}>Perfil</Text>
                            </TouchableOpacity>
                        )}


                        {role === "administrador" && (
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onClose();
                                    router.push("/");
                                }}
                            >
                                <Feather name="clipboard" size={24} color="#D09100" />
                                <Text style={[styles.navText, styles.navTextActive]}>
                                    Catálogos
                                </Text>
                            </TouchableOpacity>
                        )}


                        {role && (
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={logout}
                            >
                                <Ionicons name="log-out" size={26} color="red" />
                                <Text style={[styles.navText, { color: "red" }]}>
                                    Cerrar sesión
                                </Text>
                            </TouchableOpacity>
                        )}


                        {!role && ( //no login
                            <>
                                <TouchableOpacity
                                    style={styles.navItem}
                                    onPress={() => {
                                        onClose();
                                        router.push("/login");
                                    }}
                                >
                                    <Ionicons name="log-in" size={26} color="#999" />
                                    <Text style={styles.navText}>Login</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.navItem}
                                    onPress={() => {
                                        onClose();
                                        router.push("/login");
                                    }}
                                >
                                    <Ionicons name="person-add" size={26} color="#999" />
                                    <Text style={styles.navText}>Registro</Text>
                                </TouchableOpacity>
                            </>
                        )}

                    </View>

                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancelText}>Cerrar</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({

    modalBackground: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    bottomNav: {
        position: "absolute",
        bottom: 25,
        left: 10,
        right: 10,
        height: 65,
        backgroundColor: "#FDF8F0",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingBottom: 10,
        elevation: 5,
    },

    navItem: {
        alignItems: "center",
        justifyContent: "center",
    },

    navText: {
        fontSize: 11,
        marginTop: 2,
        color: "#999",
        textTransform: "lowercase",
    },

    navTextActive: {
        color: "#D09100",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 20,
    },
    option: {
        alignItems: "center",
    },
    optionText: {
        marginTop: 5,
        fontSize: 12,
        color: "#444",
    },
    cancelText: {
        textAlign: "center",
        color: "gray",
        marginTop: 10,
    }

});