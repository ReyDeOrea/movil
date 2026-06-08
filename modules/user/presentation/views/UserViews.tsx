import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

import { GetUsersUseCase } from "../../application/getUsersCase";
import { User } from "../../domain/user";
import { SupabaseUserRepository } from "../../infraestructure/userDataSource";
import UserList from "../components/UserList";

import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function UsersView() {

    const router = useRouter();

    const repository = new SupabaseUserRepository();

    const getUsers = new GetUsersUseCase(repository);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadUsers();
        }, [])
    );

    const loadUsers = async () => {
        try {

            const data =
                await getUsers.execute();

            setUsers(data);

        } catch (error: any) {

            Alert.alert(
                "Error",
                error.message
            );

        } finally {

            setLoading(false);

        }
    };

    const handleEdit = (
        id: number
    ) => {

        router.push({
            pathname: "/editUser",
            params: {
                id: id.toString(),
            },
        });

    };


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Cuentas
            </Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    router.push("/signUp")
                }
            >
                <Text style={styles.buttonText}>
                    Agregar Cuenta
                </Text>
            </TouchableOpacity>

            <UserList
                users={users}
                onEdit={handleEdit}
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#F3F4F6",
    },

    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },

    button: {
        backgroundColor: "#4F46E5",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

});