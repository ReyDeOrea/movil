import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { checkUserExists } from "../../application/checkUserExists";
import { registerUser } from "../../application/registerUser";
import { validateSignUpData } from "../../application/validateSignUpData";
import { saveAvatar } from "../../infraestructure/uploadimgs";

export default function RegisterUser() {
    const router = useRouter();
    const [numUsuario, setNumUsuario] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState('');
    const [numRol, setNumRol] = useState("2");
    const [numTipo, setNumTipo] = useState("1");
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (result.canceled) return;
        const asset = result.assets?.[0];
        if (!asset?.uri) return;
setAvatar(asset.uri);
       const uploadedUrl = await saveAvatar({ uri: asset.uri });

    if (!uploadedUrl) {
        Alert.alert("Error", "No se pudo subir la imagen");
        return;
    }
    setAvatarUrl(uploadedUrl);
};

    const handleRegister = async () => {
        try {
            setLoading(true);

            validateSignUpData({
                numUsuario: Number(numUsuario),
                nombre,
                telefono,
                email,
                password,
                confirmPassword
            });

            await checkUserExists(
                numUsuario.trim(),
                email.trim().toLowerCase(),
                nombre.trim(),
                telefono.trim()
            );

            await registerUser({
                numUsuario: Number(numUsuario),
                nombre,
                telefono,
                email,
                password,
                numRol: Number(numRol),
                numTipo: Number(numTipo),
                imagen: avatarUrl ?? undefined,
            });

            Alert.alert("Éxito", "Trabajador registrado correctamente");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Registrar Usuario</Text>
                </View>




                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.placeholder}>
                                <MaterialCommunityIcons name="camera" size={30} color="#666" />
                                <Text>Subir foto</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContainer}>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="badge" size={22} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Número de Trabajador"
                                keyboardType="numeric"
                                value={numUsuario}
                                onChangeText={setNumUsuario}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="person" size={22} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                value={nombre}
                                onChangeText={setNombre}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Feather name="phone" size={22} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono"
                                keyboardType="phone-pad"
                                value={telefono}
                                onChangeText={setTelefono}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={22} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Correo"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={22} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={22} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmar contraseña"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        <Text style={styles.label}>Rol</Text>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.option, numRol === "1" && styles.optionSelected]}
                                onPress={() => setNumRol("1")}
                            >
                                <Text>Administrador</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.option, numRol === "2" && styles.optionSelected]}
                                onPress={() => setNumRol("2")}
                            >
                                <Text>Solicitante</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.option, numRol === "3" && styles.optionSelected]}
                                onPress={() => setNumRol("3")}
                            >
                                <Text>Técnico</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Tipo de trabajador</Text>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.option, numTipo === "1" && styles.optionSelected]}
                                onPress={() => setNumTipo("1")}
                            >
                                <Text>No sindicalizado</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.option, numTipo === "2" && styles.optionSelected]}
                                onPress={() => setNumTipo("2")}
                            >
                                <Text>Obrero</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.option, numTipo === "6" && styles.optionSelected]}
                                onPress={() => setNumTipo("6")}
                            >
                                <Text>Campo</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Registrar Trabajador</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        backgroundColor: "#1976D2",
        paddingTop: 50,
        paddingBottom: 20,
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    },
    backBtn: {
        position: "absolute",
        left: 15,
        top: 50,
    },
    form: {
        padding: 20,
    },
    uploadButton: {
        backgroundColor: "#D4B37A",
        padding: 14,
        borderRadius: 15,
        marginBottom: 12,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        elevation: 3,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    cancelButton: {
        backgroundColor: "#E8B4B4",
        padding: 14,
        borderRadius: 15,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
    },
    input: {
        flex: 1,
        padding: 12,
    },
    label: {
        fontWeight: "bold",
        marginVertical: 10,
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 15,
    },
    option: {
        padding: 10,
        backgroundColor: "#E0E0E0",
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    mainContainer: {
        flexDirection: "column",
        paddingHorizontal: 20,
        gap: 20,
    },
    optionSelected: {
        backgroundColor: "#90CAF9",
    },
    rightColumn: {
        width: "100%",
        alignItems: "center",
    },
    button: {
        backgroundColor: "#1976D2",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    avatarContainer: {
        alignItems: "center",
        marginVertical: 15,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    placeholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});