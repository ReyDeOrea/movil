import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

import { GetUsersUseCase } from "../../application/getUsersCase";
import { User } from "../../domain/user";
import { SupabaseUserRepository } from "../../infraestructure/userDataSource";
import UserList from "../components/UserList";

import { MaterialCommunityIcons } from "@expo/vector-icons";
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

    const handleUserPress = (
        id: number
    ) => {

        router.push({
            pathname: "/userDetail",
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

                <UserList
                    users={users}
                    onPress={handleUserPress}
                />
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push("/signUp")}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>

            </View>
        </>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    rowHeader: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    backBtn: {
        position: "absolute",
        left: 15,
        top: 45,
    },
    imageZucarmex: {
        width: '45%',
        height: 60,
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
    createButton: {
        position: "absolute",
        bottom: 60,
        right: 20,
        backgroundColor: "#67B346",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    fabText: {
        color: "white",
        fontSize: 30
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

});