import {
    Feather,
    Ionicons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ModalMenuProps {
    visible: boolean;
    onClose: () => void;
    user: any;
    setUser: (u: any) => void;
    onUpdate?: () => void;
}

export function ModalMenu({
    visible,
    onClose,
    user,
    setUser,
    onUpdate,
}: ModalMenuProps) {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const role = Number(user?.numRol);

    const isSmallScreen =
        width < 360 || height < 650;

    const isTablet = width >= 700;

    const modalWidth = Math.min(
        width,
        isTablet ? 560 : width
    );

    const horizontalPadding = isSmallScreen
        ? 14
        : isTablet
            ? 28
            : 20;

    const iconSize = isSmallScreen ? 22 : 25;

    const logout = async () => {
        await AsyncStorage.removeItem("user");

        setUser(null);

        onUpdate?.();

        onClose();

        router.replace("/login");
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View
                    style={[
                        styles.modalContainer,
                        {
                            width: modalWidth,
                            paddingHorizontal: horizontalPadding,
                            paddingTop: isSmallScreen ? 16 : 22,
                            paddingBottom:
                                insets.bottom +
                                (isSmallScreen ? 12 : 18),
                        },
                    ]}
                >
                    <View style={styles.dragIndicator} />

                    <View style={styles.titleContainer}>
                        <View style={styles.titleTextContainer}>
                            <Text
                                style={[
                                    styles.modalTitle,
                                    {
                                        fontSize: isSmallScreen
                                            ? 17
                                            : isTablet
                                                ? 21
                                                : 19,
                                    },
                                ]}
                            >
                                Menú
                            </Text>

                            <Text style={styles.modalSubtitle}>
                                Selecciona una opción
                            </Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.optionsContainer,
                            {
                                marginBottom: isSmallScreen
                                    ? 13
                                    : 18,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.navItem,
                                isSmallScreen && styles.navItemSmall,
                            ]}
                            onPress={() => {
                                onClose();
                                router.push("/account");
                            }}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    isSmallScreen &&
                                    styles.iconContainerSmall,
                                ]}
                            >
                                <Feather
                                    name="user"
                                    size={iconSize}
                                    color="#148248"
                                />
                            </View>

                            <Text
                                style={[
                                    styles.navText,
                                    {
                                        fontSize: isSmallScreen
                                            ? 11
                                            : 13,
                                    },
                                ]}
                            >
                                Perfil
                            </Text>
                        </TouchableOpacity>

                        {role === 1 && (
                            <TouchableOpacity
                                style={[
                                    styles.navItem,
                                    isSmallScreen &&
                                    styles.navItemSmall,
                                ]}
                                onPress={() => {
                                    onClose();
                                    router.push("/catalog");
                                }}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.iconContainer,
                                        isSmallScreen &&
                                        styles.iconContainerSmall,
                                    ]}
                                >
                                    <Feather
                                        name="clipboard"
                                        size={iconSize}
                                        color="#148248"
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.navText,
                                        styles.navTextActive,
                                        {
                                            fontSize: isSmallScreen
                                                ? 11
                                                : 13,
                                        },
                                    ]}
                                >
                                    Catálogos
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.navItem,
                                isSmallScreen && styles.navItemSmall,
                            ]}
                            onPress={logout}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    styles.logoutIconContainer,
                                    isSmallScreen &&
                                    styles.iconContainerSmall,
                                ]}
                            >
                                <Ionicons
                                    name="log-out-outline"
                                    size={isSmallScreen ? 24 : 27}
                                    color="#870C0C"
                                />
                            </View>

                            <Text
                                style={[
                                    styles.navText,
                                    styles.logoutText,
                                    {
                                        fontSize: isSmallScreen
                                            ? 11
                                            : 13,
                                    },
                                ]}
                            >
                                Cerrar sesión
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.closeButton,
                            isSmallScreen &&
                            styles.closeButtonSmall,
                        ]}
                        onPress={onClose}
                        activeOpacity={0.75}
                    >

                        <Text style={styles.cancelText}>
                            Cerrar
                        </Text>
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
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
    },

    modalContainer: {
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 12,
    },

    dragIndicator: {
        width: 46,
        height: 5,
        alignSelf: "center",
        backgroundColor: "#D1D5DB",
        borderRadius: 3,
        marginBottom: 17,
    },

    titleContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    titleTextContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },

    modalTitle: {
        color: "#1F2937",
        fontWeight: "800",
        lineHeight: 25,
    },

    modalSubtitle: {
        color: "#6B7280",
        fontSize: 12,
        lineHeight: 17,
        marginTop: 1,
    },

    optionsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "stretch",
    },

    navItem: {
        flex: 1,
        minWidth: 0,
        minHeight: 102,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAF9",
        borderWidth: 1,
        borderColor: "#E2E8E5",
        borderRadius: 16,
        paddingHorizontal: 7,
        paddingVertical: 12,
        marginHorizontal: 4,
    },

    navItemSmall: {
        minHeight: 90,
        paddingHorizontal: 4,
        paddingVertical: 9,
        marginHorizontal: 3,
    },

    iconContainer: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F3ED",
        borderRadius: 15,
        marginBottom: 8,
    },

    iconContainerSmall: {
        width: 42,
        height: 42,
        borderRadius: 13,
        marginBottom: 6,
    },

    logoutIconContainer: {
        backgroundColor: "#FCE8E8",
    },

    navText: {
        color: "#374151",
        fontWeight: "700",
        textAlign: "center",
        textTransform: "none",
    },

    navTextActive: {
        color: "#374151",
    },

    logoutText: {
        color: "#870C0C",
    },

    closeButton: {
        width: "100%",
        minHeight: 47,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E1E4E8",
        borderRadius: 13,
    },

    closeButtonSmall: {
        minHeight: 43,
    },

    cancelText: {
        color: "#090909",
        fontSize: 14,
        fontWeight: "800",
        marginLeft: 6,
    },
});