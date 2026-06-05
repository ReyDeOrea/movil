import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ResetPasswordUseCase } from '../../application/resetPassword';
import { VerifyUserUseCase } from '../../application/verifyUserCase';
import { User } from '../../domain/user';
import { SupabaseUserRepository } from '../../infraestructure/userDataSource';
import NewPasswordModal from './NewPasswordModal';

export default function Password() {

  const router = useRouter();

  const userRepo = new SupabaseUserRepository();
  const verifyUserUseCase = new VerifyUserUseCase(userRepo);
  const resetPasswordUseCase = new ResetPasswordUseCase(userRepo);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);

  const handleVerify = async () => {

    try {

      setLoading(true);

      const user = await verifyUserUseCase.execute(username, email);
console.log("USER VERIFY:", user);
      setProfile(user);
      setModalOpen(true);

    } catch (err: any) {

      Alert.alert("Error", err.message);

    } finally {

      setLoading(false);

    }

  };

  const handlePasswordChange = async (newPass: string, confirmPass: string) => {

    if (!profile) return;

    try {

      await resetPasswordUseCase.execute({
        user: profile,
        newPassword: newPass,
        confirmPassword: confirmPass,
      });

      Alert.alert("Listo", "Contraseña actualizada correctamente");

      setModalOpen(false);

      router.back();

    } catch (err: any) {

      Alert.alert("Error", err.message);

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

          <View style={styles.rowHeader}>
            <Text style={styles.title}>Animaland</Text>
            <MaterialCommunityIcons name="dog" size={30} color="#fff" />
          </View>

        </View>
    

        <Text style={styles.subtitle}>
          Ingresa tu usuario y correo
        </Text>

        <View style={styles.BE}>

          <View style={styles.BI}>
            <MaterialCommunityIcons name="account" size={22} color="#DAC193" />
            <TextInput
              style={styles.txtI}
              placeholder="Usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.BI}>
            <MaterialIcons name="email" size={22} color="#DAC193" />
            <TextInput
              style={styles.txtI}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          disabled={loading}
        >

          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.txtBtn}>Verificar</Text>
          }

        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.txtSI}>Volver</Text>
        </TouchableOpacity>

        <NewPasswordModal
          visible={modalOpen}
          loading={loading}
          onClose={() => setModalOpen(false)}
          onSubmit={handlePasswordChange}
        />

      </ScrollView>
    </>
  );

}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: "#FDF8F0",
    paddingBottom: 40,
  },

  header: {
    width: "100%",
    height: 90,
    paddingTop: 35,
    backgroundColor: "#B7C979",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontWeight: "bold",
    fontSize: 30,
    color: "#fff",
    marginRight: 6,
  },

  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
  },

  img: {
    width: 180,
    height: 180,
    borderRadius: 100,
    alignSelf: "center",
    marginVertical: 10,
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },

  BE: {
    marginHorizontal: 20,
  },

  BI: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DAC193",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    backgroundColor: "#fff",
  },

  txtI: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#dee8b4",
    borderRadius: 20,
    paddingVertical: 14,
    marginHorizontal: 80,
    marginTop: 10,
  },

  txtBtn: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
  },

  txtSI: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 12,
  },

});