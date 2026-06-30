import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { checkUserExistsUpdate } from "../../application/checkUserExistsUpdate";
import { getUserProfile } from "../../application/getUserProfile";
import { updateUserProfile } from "../../application/updateUserProfile";
import { validateUserProfile } from "../../application/validateUpdate";
import { User } from "../../domain/user";
import AvatarView from "../components/AvatarView";

const { width } = Dimensions.get("window");
const AVATAR_SIZE = width * 0.32;
const LOGO_WIDTH = Math.min(width * 0.28, 115);

export default function Account() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const u = await getUserProfile();
      if (!u) return;

      setAvatarUrl(u.imagen ?? "");
      setUser(u);
      setEmail(u.email ?? "");
      setTelefono(u.telefono ?? "");
    } catch {
      Alert.alert("Error", "No se pudo cargar el perfil");
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      if (!user) return;

      const cleanEmail = email.trim().toLowerCase();
      const cleanTelefono = telefono.trim();
      const currentEmail = (user.email ?? "").trim().toLowerCase();
      const currentTelefono = (user.telefono ?? "").trim();

      validateUserProfile(cleanEmail, cleanTelefono);

      if (cleanEmail !== currentEmail || cleanTelefono !== currentTelefono) {
        await checkUserExistsUpdate(
          cleanEmail,
          cleanTelefono,
          user.numUsuario
        );
      }

      const updated = await updateUserProfile(user, {
        email: cleanEmail,
        telefono: cleanTelefono,
        imagen: avatarUrl || user.imagen,
      });

      setUser(updated);

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No hay usuario logueado</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Mi perfil</Text>

          <Image
          source={require('../../../../assets/images/ZUCARMEX.png')}
          style={styles.imageZucarmex}
          resizeMode="contain"
          />

        </View>

        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <AvatarView
              size={AVATAR_SIZE}
              url={avatarUrl}
              editable
              onUpload={(url) => setAvatarUrl(url)}
            />
            <Text style={styles.avatarHint}>Foto de perfil</Text>
          </View>

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.inputDisabled} value={user.nombre} editable={false} />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Guardando..." : "Actualizar perfil"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  header: {
    backgroundColor: "#67B346",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },

  card: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 3,
  },

  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  inputDisabled: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: "#6B7280",
  },

  button: {
    marginTop: 15,
    backgroundColor: "#67B346",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  imageZucarmex: {
  width: LOGO_WIDTH,
  height: 50,
  marginLeft: "auto",
},
});
