import { MaterialCommunityIcons } from "@expo/vector-icons";
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
}: Props) {
  const esHerramienta = material.tipoMaterial === "herramienta";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{material.nombreMaterial}</Text>
          <Text style={styles.code}>Código: {material.numMaterial}</Text>
        </View>

        <View
          style={[
            styles.typeBadge,
            esHerramienta && styles.toolBadge,
          ]}
        >
          <MaterialCommunityIcons
            name={esHerramienta ? "tools" : "package-variant"}
            size={15}
            color={esHerramienta ? "#7C3AED" : "#148248"}
          />
          <Text
            style={[
              styles.typeText,
              esHerramienta && styles.toolText,
            ]}
          >
            {esHerramienta ? "Herramienta" : "Material"}
          </Text>
        </View>
      </View>

      <Text style={styles.dataText}>
        Cantidad: {material.cantidad ?? 0}
      </Text>

      <Text style={styles.dataText}>
        Unidad: {material.unidad || "Sin unidad"}
      </Text>

      {/* {esHerramienta && (
        <Text style={styles.helperText}>
          Su stock no disminuye al utilizarla en una solicitud.
        </Text>
      )} */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(material.numMaterial)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: 20,
    minHeight: 160,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  code: {
    color: "#6B7280",
    marginTop: 3,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF7EF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  toolBadge: {
    backgroundColor: "#F3E8FF",
  },
  typeText: {
    color: "#148248",
    fontSize: 12,
    fontWeight: "bold",
  },
  toolText: {
    color: "#7C3AED",
  },
  dataText: {
    color: "#374151",
    marginTop: 3,
  },
  helperText: {
    color: "#7C3AED",
    fontSize: 12,
    marginTop: 7,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 14,
  },
  editButton: {
    backgroundColor: "#3A6E19",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
