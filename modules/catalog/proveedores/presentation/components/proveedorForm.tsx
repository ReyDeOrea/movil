import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  initialNumTecnicoExterno?: string;
  initialNombre?: string;
  initialEmpresa?: string;
  initialTelefono?: string;
  initialEspecialidad?: string;
  showNumero?: boolean;

  onSubmit: (
    numTecnicoExterno: number,
    nombre: string,
    empresa: string,
    telefono: string,
    especialidad: string
  ) => void;
}

export default function TecnicoExternoForm({
  initialNumTecnicoExterno = "",
  initialNombre = "",
  initialEmpresa = "",
  initialTelefono = "",
  initialEspecialidad = "",
  showNumero = false,
  onSubmit,
}: Props) {
  const [numTecnicoExterno] = useState(initialNumTecnicoExterno);
  const [nombre, setNombre] = useState(initialNombre);
  const [empresa, setEmpresa] = useState(initialEmpresa);
  const [telefono, setTelefono] = useState(initialTelefono);
  const [especialidad, setEspecialidad] = useState(initialEspecialidad);

  return (
   <View style={styles.card}>
      {showNumero && (
        <>
          <Text style={styles.label}>Número de técnico</Text>
          <TextInput
            placeholder="Número de Técnico"
            keyboardType="numeric"
            value={numTecnicoExterno}
            editable={false}
            style={styles.inputDisabled}
          />
        </>
      )}

      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <TextInput
        placeholder="Empresa"
        value={empresa}
        onChangeText={setEmpresa}
        style={styles.input}
      />

      <TextInput
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <TextInput
        placeholder="Especialidad"
        value={especialidad}
        onChangeText={setEspecialidad}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          onSubmit(
            Number(numTecnicoExterno || 0),
            nombre,
            empresa,
            telefono,
            especialidad
          )
        }
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: "bold",
    marginBottom: 5,
     marginHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 20,
  },
 card: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 3,
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 20,
  },

  button: {
    backgroundColor: "#232323",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom:20,
  },
 cancelButton: {
    backgroundColor: "#870c0c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
