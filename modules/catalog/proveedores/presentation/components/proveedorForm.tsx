import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

interface Props {
  initialNumTecnicoExterno?: string;
  initialNombre?: string;
  initialEmpresa?: string;
  initialTelefono?: string;
  initialEspecialidad?: string;

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
  onSubmit,
}: Props) {

  const [numTecnicoExterno, setNumTecnicoExterno] = useState(initialNumTecnicoExterno);
  const [nombre, setNombre] = useState(initialNombre);
  const [empresa, setEmpresa] = useState(initialEmpresa);
  const [telefono, setTelefono] = useState(initialTelefono);
  const [especialidad, setEspecialidad] = useState(initialEspecialidad);

  return (
    <View>

      <TextInput
        placeholder="Número de Técnico"
        keyboardType="numeric"
        value={numTecnicoExterno}
        onChangeText={setNumTecnicoExterno}
      />
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
             Number(numTecnicoExterno),
            nombre,
            empresa,
            telefono,
            especialidad
          )
        }
      >
        <Text style={styles.buttonText}>
          Guardar
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});