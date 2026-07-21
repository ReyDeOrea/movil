import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

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
  const { width, height } =
    useWindowDimensions();

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;

  const cardPadding = isSmallScreen
    ? 13
    : isTablet
      ? 20
      : 16;

  const titleSize = isSmallScreen
    ? 15
    : isTablet
      ? 19
      : 17;

  const textSize = isSmallScreen
    ? 12
    : isTablet
      ? 15
      : 14;

  return (
    <View
      style={[
        styles.card,
        {
          padding: cardPadding,
          marginHorizontal: isSmallScreen
            ? 12
            : isTablet
              ? 24
              : 16,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.companyIconContainer,
            isSmallScreen &&
              styles.companyIconContainerSmall,
          ]}
        >
          <MaterialCommunityIcons
            name="office-building-outline"
            size={isSmallScreen ? 22 : 25}
            color="#148248"
          />
        </View>

        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                fontSize: titleSize,
              },
            ]}
            numberOfLines={2}
          >
            {tecnico.empresa ||
              "Empresa no registrada"}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                fontSize: isSmallScreen
                  ? 10
                  : 12,
              },
            ]}
          >
            Técnico externo
          </Text>
        </View>
      </View>

      <View style={styles.informationContainer}>
        <View
          style={[
            styles.dataRow,
            isSmallScreen &&
              styles.dataRowSmall,
          ]}
        >
          <View style={styles.dataIcon}>
            <MaterialCommunityIcons
              name="account-outline"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>
              Técnico
            </Text>

            <Text
              style={[
                styles.dataValue,
                {
                  fontSize: textSize,
                },
              ]}
            >
              {tecnico.nombre ||
                "Sin nombre registrado"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.dataRow,
            isSmallScreen &&
              styles.dataRowSmall,
          ]}
        >
          <View style={styles.dataIcon}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>
              Teléfono
            </Text>

            <Text
              style={[
                styles.dataValue,
                {
                  fontSize: textSize,
                },
              ]}
            >
              {tecnico.telefono ||
                "Sin teléfono registrado"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.dataRow,
            isSmallScreen &&
              styles.dataRowSmall,
          ]}
        >
          <View style={styles.dataIcon}>
            <MaterialCommunityIcons
              name="tools"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>
              Especialidad
            </Text>

            <Text
              style={[
                styles.dataValue,
                {
                  fontSize: textSize,
                },
              ]}
            >
              {tecnico.especialidad ||
                "Sin especialidad registrada"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.editButton,
            isSmallScreen &&
              styles.editButtonSmall,
          ]}
          onPress={() =>
            onEdit(
              tecnico.numTecnicoExterno
            )
          }
          activeOpacity={0.82}
        >
          <Text style={styles.buttonText}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "auto",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    marginVertical: 7,

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  companyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    flexShrink: 0,
  },

  companyIconContainerSmall: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },

  titleContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  title: {
    color: "#111827",
    fontWeight: "800",
    lineHeight: 23,
  },

  subtitle: {
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },

  informationContainer: {
    width: "100%",
  },

  dataRow: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E8F3ED",
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },

  dataRowSmall: {
    minHeight: 47,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  dataIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    flexShrink: 0,
  },

  dataContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  dataLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },

  dataValue: {
    color: "#374151",
    fontWeight: "600",
    lineHeight: 19,
  },

 buttonContainer: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 5,
},

  editButton: {
    minWidth: 105,
    minHeight: 43,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 11,
    paddingHorizontal: 100,
    shadowColor: "#232323",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  editButtonSmall: {
    minWidth: 95,
    minHeight: 39,
    paddingHorizontal: 14,
  },

  deleteButton: {
    minWidth: 105,
    minHeight: 43,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870C0C",
    borderRadius: 11,
    paddingHorizontal: 17,
    marginLeft: 9,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
});