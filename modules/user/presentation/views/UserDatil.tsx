import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { GetUserByIdUseCase } from "../../application/getUserByid";
import { User } from "../../domain/user";
import { SupabaseUserRepository } from "../../infraestructure/userDataSource";
import AvatarView from "../components/AvatarView";


export default function UserDetail() {


    const router = useRouter();

    const { id } = useLocalSearchParams();


    const repository =
        new SupabaseUserRepository();


    const getUser =
        new GetUserByIdUseCase(repository);



    const [user, setUser] =
        useState<User | null>(null);


    const [loading, setLoading] =
        useState(true);



    useEffect(() => {

        loadUser();

    }, []);



    const loadUser = async () => {

        try {

            const data =
                await getUser.execute(
                    Number(id)
                );
            setUser(data);
        } catch (error) {

            console.log(error);
        } finally {

            setLoading(false);
        }
    };
    if (loading) {
        return (

            <View style={styles.center}>
                <ActivityIndicator />
            </View>

        );
    }

    return (
        <>

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <View style={styles.container}>
                <View style={styles.header}>

                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >

                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={28}
                            color="#FFFFFF"
                        />

                    </TouchableOpacity>

                    <View style={styles.rowHeader}>
                        <Image source={require('../../../../assets/images/ZUCARMEX.png')}
                            style={styles.imageZucarmex}
                            resizeMode="contain"

                        />
                    </View>
                </View>


                <View style={styles.content}>
                    <View style={styles.account}>
                        <Text style={styles.title}>
                            Información de cuenta
                        </Text>



                        <View style={styles.avatarContainer}>
                            <AvatarView
                                size={100}
                                url={user?.imagen ?? null}
                                editable={false}
                            />

                            <Text style={styles.avatarHint}>
                                Foto de perfil
                            </Text>
                        </View>

                        <View style={styles.disabledInput}>
                            <Text style={styles.label}>
                                Número de trabajdor
                            </Text>

                            <Text style={styles.disabledText}>
                                {user?.numUsuario}
                            </Text>
                        </View>

                        <View style={styles.dataBox}>

                            <Text style={styles.label}>
                                Nombre
                            </Text>

                            <Text style={styles.value}>
                                {user?.nombre}
                            </Text>

                        </View>

                        <View style={styles.dataBox}>

                            <Text style={styles.label}>
                                Correo
                            </Text>

                            <Text style={styles.value}>
                                {user?.email}
                            </Text>

                        </View>

                        <View style={styles.dataBox}>
                            <Text style={styles.label}>
                                Teléfono
                            </Text>

                            <Text style={styles.value}>
                                {user?.telefono}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={() =>
                            router.push({
                                pathname: "/editUser",
                                params: {
                                    id: user?.numUsuario.toString()
                                }
                            })
                        }

                        >
                            <Text style={styles.textButton}>
                                Editar cuenta
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.requests}>

                        <Text style={styles.title}>
                            Solicitudes enviadas
                        </Text>

                        <Text style={styles.text}>
                            Solicitudes realizadas por el usuario
                        </Text>

                    </View>
                </View>
            </View >

        </>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5"
    },
    header: {
        width: "100%",
        height: 100,
        paddingTop: 35,
        backgroundColor: "#148248",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    },
    rowHeader: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    imageZucarmex: {
        width: "45%",
        height: 60
    },
    backBtn: {
        position: "absolute",
        left: 15,
        top: 45,
        zIndex: 10
    },
    content: {
        flex: 1,
        flexDirection: "row",
        padding: 15,
        gap: 15
    },
    account: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15
    },
    requests: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15
    },
    userImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: "center",
        marginBottom: 20

    },
    placeholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 20
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20
    },
    text: {
        fontSize: 15,
        marginBottom: 12
    },
    button: {
        backgroundColor: "#232323",
        padding: 12,
        borderRadius: 10,
        marginTop: 20
    },
    textButton: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold"
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    dataBox: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    disabledInput: {
        backgroundColor: "#E5E7EB",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        opacity: 0.7,
    },
    label: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "bold",
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: "#111827",
    },
    disabledText: {
        fontSize: 16,
        color: "#6B7280",
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    avatarHint: {
        marginTop: 8,
        fontSize: 12,
        color: "#6B7280",
    },
});