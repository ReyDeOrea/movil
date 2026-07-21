import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

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
  const { width } = useWindowDimensions();

  /*
   * Valores utilizados únicamente para adaptar
   * la interfaz al tamaño de la pantalla.
   */
  const isSmallScreen = width < 370;
  const isTablet = width >= 700;

  const esHerramienta =
    entrada.tipoMaterial === "herramienta";

  return (
    <View
      style={[
        styles.card,
        isSmallScreen && styles.cardSmall,
        isTablet && styles.cardTablet,
      ]}
    >
      {/* Encabezado */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.mainIconContainer,
            esHerramienta &&
              styles.toolIconContainer,
            isTablet &&
              styles.mainIconContainerTablet,
          ]}
        >
          <MaterialCommunityIcons
            name={
              esHerramienta
                ? "tools"
                : "package-variant-closed"
            }
            size={isTablet ? 31 : 27}
            color={
              esHerramienta
                ? "#7C3AED"
                : "#148248"
            }
          />
        </View>

        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              isTablet && styles.titleTablet,
            ]}
            numberOfLines={2}
          >
            {entrada.nombreMaterial ||
              "Material sin nombre"}
          </Text>

          <View style={styles.codeContainer}>
            <Text
              style={styles.subText}
              numberOfLines={1}
            >
              Número: {entrada.numMaterial}
            </Text>
          </View>
        </View>

        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="plus"
            size={15}
            color="#148248"
          />

          <Text style={styles.badgeText}>
            {entrada.cantidad}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Tipo y unidad */}
      <View
        style={[
          styles.informationRow,
          isSmallScreen &&
            styles.informationRowSmall,
        ]}
      >
        <View
          style={[
            styles.informationBox,
            !isSmallScreen &&
              styles.informationBoxLeft,
            isSmallScreen &&
              styles.informationBoxSmall,
          ]}
        >
          <View
            style={[
              styles.informationIcon,
              esHerramienta &&
                styles.informationToolIcon,
            ]}
          >
            <MaterialCommunityIcons
              name={
                esHerramienta
                  ? "tools"
                  : "package-variant"
              }
              size={19}
              color={
                esHerramienta
                  ? "#7C3AED"
                  : "#148248"
              }
            />
          </View>

          <View style={styles.informationText}>
            <Text style={styles.informationLabel}>
              Tipo
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {esHerramienta
                ? "Herramienta"
                : "Material"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.informationBox,
            isSmallScreen &&
              styles.informationBoxSmall,
          ]}
        >
          <View style={styles.informationIcon}>
            <MaterialCommunityIcons
              name="ruler"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.informationText}>
            <Text style={styles.informationLabel}>
              Unidad
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {entrada.unidad || "Unidad"}
            </Text>
          </View>
        </View>
      </View>

      {/* Stock y fecha */}
      <View
        style={[
          styles.informationRow,
          isSmallScreen &&
            styles.informationRowSmall,
        ]}
      >
        <View
          style={[
            styles.informationBox,
            !isSmallScreen &&
              styles.informationBoxLeft,
            isSmallScreen &&
              styles.informationBoxSmall,
          ]}
        >
          <View style={styles.informationIcon}>
            <MaterialCommunityIcons
              name="warehouse"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.informationText}>
            <Text style={styles.informationLabel}>
              Stock actual
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {entrada.stockActual ?? 0}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.informationBox,
            isSmallScreen &&
              styles.informationBoxSmall,
          ]}
        >
          <View style={styles.informationIcon}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.informationText}>
            <Text style={styles.informationLabel}>
              Fecha
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {formatDate(entrada.fecha)}
            </Text>
          </View>
        </View>
      </View>

      {/* Usuarios */}
      <View style={styles.personSection}>
        <View style={styles.personRow}>
          <View style={styles.personIcon}>
            <MaterialCommunityIcons
              name="account-check-outline"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.personTextContainer}>
            <Text style={styles.personLabel}>
              Registró
            </Text>

            <Text
              style={styles.personValue}
              numberOfLines={2}
            >
              {entrada.nombreUsuario ||
                "Sin usuario"}
            </Text>
          </View>
        </View>

        <View style={styles.personDivider} />

        <View style={styles.personRow}>
          <View style={styles.personIcon}>
            <MaterialCommunityIcons
              name="account-hard-hat-outline"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.personTextContainer}>
            <Text style={styles.personLabel}>
              Técnico externo
            </Text>

            <Text
              style={styles.personValue}
              numberOfLines={2}
            >
              {entrada.nombreTecnicoExterno ||
                "Sin técnico externo"}
            </Text>
          </View>
        </View>
      </View>

      {/* Observaciones */}
      {!!entrada.observaciones && (
        <View style={styles.observationsContainer}>
          <View style={styles.observationsHeader}>
            <MaterialCommunityIcons
              name="text-box-outline"
              size={18}
              color="#68736E"
            />

            <Text style={styles.observationsTitle}>
              Descripción
            </Text>
          </View>

          <Text style={styles.observaciones}>
            {entrada.observaciones}
          </Text>
        </View>
      )}

      {/* Acciones */}
      <View
        style={[
          styles.buttonContainer,
          isSmallScreen &&
            styles.buttonContainerSmall,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.editButton,
            !isSmallScreen &&
              styles.editButtonSpacing,
          ]}
          onPress={() => onEdit(entrada)}
          activeOpacity={0.82}
          accessibilityLabel="Editar entrada"
        >

          <Text style={styles.buttonText}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.deleteButton,
            isSmallScreen &&
              styles.deleteButtonSmall,
          ]}
          onPress={() =>
            onDelete(entrada.idEntrada)
          }
          activeOpacity={0.82}
          accessibilityLabel="Eliminar entrada"
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
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 17,
    marginVertical: 8,

    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.09,
        shadowRadius: 7,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  cardSmall: {
    padding: 14,
    borderRadius: 16,
  },

  cardTablet: {
    padding: 22,
    borderRadius: 21,
  },

  cardHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  mainIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 12,
    flexShrink: 0,
  },

  toolIconContainer: {
    backgroundColor: "#F3E8FF",
  },

  mainIconContainerTablet: {
    width: 58,
    height: 58,
    borderRadius: 18,
  },

  titleContainer: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
    paddingRight: 8,
  },

  title: {
    color: "#1F2937",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },

  titleTablet: {
    fontSize: 18,
    lineHeight: 24,
  },

  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  subText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },

  badge: {
    minHeight: 34,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D3EADF",
    borderRadius: 17,
    paddingHorizontal: 11,
    paddingVertical: 6,
    flexShrink: 0,
  },

  badgeText: {
    color: "#148248",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 2,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EDF1EF",
    marginTop: 15,
    marginBottom: 14,
  },

  informationRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 9,
  },

  informationRowSmall: {
    flexDirection: "column",
    marginBottom: 0,
  },

  informationBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  informationBoxLeft: {
    marginRight: 9,
  },

  informationBoxSmall: {
    width: "100%",
    marginBottom: 9,
  },

  informationIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  informationToolIcon: {
    backgroundColor: "#F3E8FF",
  },

  informationText: {
    flex: 1,
    minWidth: 0,
  },

  informationLabel: {
    color: "#7A837E",
    fontSize: 11,
    fontWeight: "600",
  },

  informationValue: {
    color: "#27332D",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },

  personSection: {
    width: "100%",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 1,
  },

  personRow: {
    width: "100%",
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  personIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
    flexShrink: 0,
  },

  personTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  personLabel: {
    color: "#7A837E",
    fontSize: 11,
    fontWeight: "600",
  },

  personValue: {
    color: "#37413C",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 2,
  },

  personDivider: {
    height: 1,
    backgroundColor: "#E4EAE7",
    marginLeft: 45,
  },

  observationsContainer: {
    width: "100%",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },

  observationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  observationsTitle: {
    color: "#68736E",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },

  observaciones: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 19,
  },

  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    marginTop: 15,
  },

  buttonContainerSmall: {
    flexDirection: "column",
  },

  actionButton: {
    flex: 1,
    minHeight: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,

    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.14,
        shadowRadius: 4,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  editButton: {
    backgroundColor: "#232323",
  },

  editButtonSpacing: {
    marginRight: 10,
  },

  deleteButton: {
    backgroundColor: "#870C0C",
  },

  deleteButtonSmall: {
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },
});