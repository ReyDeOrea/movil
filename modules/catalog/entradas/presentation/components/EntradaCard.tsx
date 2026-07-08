import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Entrada } from "../../domain/entrada";

interface Props {
  entrada: Entrada;
  onEdit: (entrada: Entrada) => void;
  onDelete: (idEntrada: string) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha";

  const cleanDate = String(value).split("T")[0];
  const parts = cleanDate.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return String(value);
};

export default function EntradaCard({
  entrada,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {entrada.nombreMaterial || "Material sin nombre"}
          </Text>

          <Text style={styles.subText}>
            Código: {entrada.numMaterial}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            +{entrada.cantidad}
          </Text>
        </View>
      </View>

      <Text style={styles.text}>
        <Text style={styles.label}>Unidad:</Text> {entrada.unidad || "unidad"}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Stock actual:</Text> {entrada.stockActual ?? 0}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Fecha:</Text> {formatDate(entrada.fecha)}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Registró:</Text>{" "}
        {entrada.nombreUsuario || "Sin usuario"}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Técnico externo:</Text>{" "}
        {entrada.nombreTecnicoExterno || "Sin técnico externo"}
      </Text>

      {!!entrada.observaciones && (
        <Text style={styles.observaciones}>
          {entrada.observaciones}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(entrada)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(entrada.idEntrada)}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: 20,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },

  subText: {
    color: "#6B7280",
    marginTop: 2,
  },

  text: {
    color: "#374151",
    marginTop: 3,
  },

  label: {
    fontWeight: "bold",
  },

  observaciones: {
    marginTop: 8,
    color: "#4B5563",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },

  badge: {
    backgroundColor: "#EAF7EF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },

  badgeText: {
    color: "#148248",
    fontWeight: "bold",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  editButton: {
    backgroundColor: "#3a6e19",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  deleteButton: {
    backgroundColor: "#870c0c",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});