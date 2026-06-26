import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { checkUserExistsUpdate } from "../../application/checkUserExistsUpdate";
import checkUserNameExistsUpdate from "../../application/CheckUserNameExist";
import { EditUserUseCase } from "../../application/editUser";
import { GetUserByIdUseCase } from "../../application/getUserByid";
import { validateUser } from "../../application/validateUpdateUser";
import { User } from "../../domain/user";
import { SupabaseUserRepository } from "../../infraestructure/userDataSource";
import AvatarView from "../components/AvatarView";

export default function EditUserView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const repository = new SupabaseUserRepository();
  const getUserUseCase = new GetUserByIdUseCase(repository);
  const editUserUseCase = new EditUserUseCase(repository);

  const [userData, setUserData] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getUserUseCase.execute(Number(id));

      if (!user) {
        Alert.alert("Error", "Usuario no encontrado");
        router.back();
        return;
      }

      setUserData(user);
      setNombre(user.nombre);
      setEmail(user.email);
      setTelefono(user.telefono);
      setAvatarUrl(user.imagen ?? "");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!userData) return;

      const cleanNombre = nombre.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanTelefono = telefono.trim();

      const currentNombre = (userData.nombre ?? "").trim().toLowerCase();
      const currentEmail = (userData.email ?? "").trim().toLowerCase();
      const currentTelefono = (userData.telefono ?? "").trim();

      const updatedUser: User = {
        ...userData,
        nombre: cleanNombre,
        email: cleanEmail,
        telefono: cleanTelefono,
        imagen: avatarUrl || userData.imagen,
      };

      await validateUser(
        updatedUser.nombre,
        updatedUser.email,
        updatedUser.telefono
      );

      if (cleanNombre.toLowerCase() !== currentNombre) {
        await checkUserNameExistsUpdate(
          updatedUser.nombre,
          updatedUser.numUsuario
        );
      }

      if (cleanEmail !== currentEmail || cleanTelefono !== currentTelefono) {
        await checkUserExistsUpdate(
          updatedUser.email,
          updatedUser.telefono,
          updatedUser.numUsuario
        );
      }

      await editUserUseCase.execute(updatedUser);

      Alert.alert("Éxito", "Usuario actualizado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Usuario</Text>

      <AvatarView
        size={110}
        url={avatarUrl}
        editable
        onUpload={(url) => setAvatarUrl(url)}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
