import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

import { EditUserUseCase } from "../../application/editUser";
import { GetUserByIdUseCase } from "../../application/getUserByid";
import { User } from "../../domain/user";
import { SupabaseUserRepository } from "../../infraestructure/userDataSource";

export default function EditUserView() {

  const router = useRouter();
  const { id } = useLocalSearchParams();

  const repository = new  SupabaseUserRepository();

  const getUserUseCase =
    new GetUserByIdUseCase(repository);

  const editUserUseCase = new EditUserUseCase(repository);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {

      const user =
        await getUserUseCase.execute(Number(id));

      if (!user) {
        Alert.alert("Error", "Usuario no encontrado");
        router.back();
        return;
      }

      setNombre(user.nombre);
      setEmail(user.email);
      setTelefono(user.telefono);

    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleUpdate = async () => {
    try {

      const user: User = {
        numUsuario: Number(id),
        nombre,
        email,
        telefono,
        password: "", // no se modifica aquí
        imagen: "",
        numRol: 0,
        numTipo: 0,
      };

      await editUserUseCase.execute(user);

      Alert.alert(
        "Éxito",
        "Usuario actualizado correctamente"
      );

      router.back();

    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Editar Usuario
      </Text>

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
        <Text style={styles.buttonText}>
          Guardar cambios
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
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