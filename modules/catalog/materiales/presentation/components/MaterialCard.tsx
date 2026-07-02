import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Material } from "../../domain/material";

interface Props {
  material: Material;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function MaterialCard({
  material,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        {material.nombreMaterial}
      </Text>

      <Text>
        Cantidad: {material.cantidad}
      </Text>

      <Text>
        Unidad: {material.unidad}
      </Text>

      <View style={styles.buttonContainer}>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(material.numMaterial)}
        >
          <Text style={styles.buttonText}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(material.numMaterial)}
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
    marginHorizontal: 20,
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
    backgroundColor: "#3a6e19",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  deleteButton: {
    backgroundColor: "#870c0c",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});