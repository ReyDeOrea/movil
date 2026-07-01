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
    const role = Number(user?.numRol);

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

                        <TouchableOpacity
                            style={styles.navItem}
                            onPress={() => {
                                onClose();
                                router.push("/account");
                            }}
                        >
                            <Feather name="user" size={24} color="#b4f379" />
                            <Text style={styles.navText}>Perfil</Text>
                        </TouchableOpacity>


                        {role === 1 && (
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onClose();
                                    router.push("/catalog");
                                }}
                            >
                                <Feather name="clipboard" size={24} color="#b4f379" />
                                <Text style={[styles.navText, styles.navTextActive]}>
                                    Catálogos
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.navItem}
                            onPress={logout}
                        >
                            <Ionicons name="log-out" size={26} color="red" />
                            <Text style={[styles.navText, { color: "red" }]}>
                                Cerrar sesión
                            </Text>
                        </TouchableOpacity>

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
        color: "#050505",
        textTransform: "lowercase",
    },

    navTextActive: {
        color: "#0c0c0c",
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