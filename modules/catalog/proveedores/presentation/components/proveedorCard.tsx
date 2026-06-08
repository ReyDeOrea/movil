import { StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { TecnicoExterno } from "../../domain/proveedor";

interface Props {
  tecnico: TecnicoExterno;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TecnicoExternoCard({
  tecnico,
  onEdit,
  onDelete,
}: Props) {

  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        {tecnico.nombre}
      </Text>

      <Text>
        Empresa: {tecnico.empresa}
      </Text>

      <Text>
        Teléfono: {tecnico.telefono}
      </Text>

      <Text>
        Especialidad: {tecnico.especialidad}
      </Text>

      <View style={styles.buttonContainer}>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            onEdit(
              tecnico.numTecnicoExterno
            )
          }
        >
          <Text style={styles.buttonText}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            onDelete(
              tecnico.numTecnicoExterno
            )
          }
        >
          <Text style={styles.buttonText}>
            Eliminar
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  editButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  deleteButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});