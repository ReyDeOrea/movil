import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
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

  const handlePasswordChange = async (
    newPass: string,
    confirmPass: string
  ) => {

    if (!profile) return;

    try {

      await resetPasswordUseCase.execute({
        user: profile,
        newPassword: newPass,
        confirmPassword: confirmPass,
      });

      Alert.alert(
        "Listo",
        "Contraseña actualizada correctamente"
      );

      setModalOpen(false);

      router.back();

    } catch (err: any) {

      Alert.alert("Error", err.message);

    }

  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        contentContainerStyle={
          styles.container
        }
      >

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
              color="#fff"
            />

          </TouchableOpacity>

          <View style={styles.rowHeader}>

            <Text style={styles.title}>
             ServiceApp
            </Text>

            <MaterialCommunityIcons
              name="tools"
              size={30}
              color="#fff"
            />

          </View>

        </View>

        <View style={styles.avatarBox}>

          <FontAwesome6
            name="shield-halved"
            size={150}
            color="#D1D5DB"
          />

        </View>

        <Text style={styles.subtitle}>
          Recupera tu contraseña
        </Text>

        <Text style={styles.txt}>
          Ingresa tu usuario y correo electrónico
        </Text>

        <View style={styles.BE}>

          <View style={styles.BI}>

            <MaterialCommunityIcons
              name="account"
              size={22}
              color="#4F46E5"
            />

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

            <MaterialIcons
              name="email"
              size={22}
              color="#4F46E5"
            />

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

          {
            loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text style={styles.txtBtn}>
                Verificar
              </Text>
            )
          }

        </TouchableOpacity>

        <View style={styles.rp}>

          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#4F46E5"
          />

          <TouchableOpacity
            onPress={() =>
              router.back()
            }
          >

            <Text style={styles.txtSI}>
              Volver
            </Text>

          </TouchableOpacity>

        </View>

        <NewPasswordModal
          visible={modalOpen}
          loading={loading}
          onClose={() =>
            setModalOpen(false)
          }
          onSubmit={
            handlePasswordChange
          }
        />

      </ScrollView>
    </>
  );

}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: "#F9FAFB",
    paddingBottom: 40,
  },

  header: {
    width: "100%",
    height: 100,
    paddingTop: 35,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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

  avatarBox: {
    alignItems: "center",
    marginVertical: 10,
  },

  subtitle: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 22,
    fontWeight: "bold",
    color: "#374151",
  },

  txt: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#6B7280",
  },

  BE: {
    marginHorizontal: 20,
    marginTop: 10,
  },

  BI: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    backgroundColor: "#fff",
  },

  txtI: {
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
    color: "#000",
  },

  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignSelf: "center",
    marginVertical: 20,
  },

  txtBtn: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },

  txtSI: {
    color: "#2563EB",
    fontWeight: "bold",
    marginLeft: 6,
  },

  rp: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

});