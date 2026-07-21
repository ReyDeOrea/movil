import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

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
  const { width } = useWindowDimensions();

  /*
   * Valores únicamente para la interfaz responsiva.
   */
  const isSmallScreen = width < 360;
  const isTablet = width >= 700;

  const esHerramienta =
    material.tipoMaterial === "herramienta";

  return (
    <View
      style={[
        styles.card,
        isSmallScreen && styles.cardSmall,
        isTablet && styles.cardTablet,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.mainIconContainer,
            esHerramienta &&
              styles.mainToolIconContainer,
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
            {material.nombreMaterial}
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.code}>
              Número: {material.numMaterial}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.typeBadge,
            esHerramienta &&
              styles.toolBadge,
          ]}
        >
          <MaterialCommunityIcons
            name={
              esHerramienta
                ? "tools"
                : "package-variant"
            }
            size={14}
            color={
              esHerramienta
                ? "#7C3AED"
                : "#148248"
            }
          />

          {!isSmallScreen && (
            <Text
              style={[
                styles.typeText,
                esHerramienta &&
                  styles.toolText,
              ]}
            >
              {esHerramienta
                ? "Herramienta"
                : "Material"}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View
        style={[
          styles.informationContainer,
          isSmallScreen &&
            styles.informationContainerSmall,
        ]}
      >
        <View
          style={[
            styles.informationBox,
            isSmallScreen &&
              styles.informationBoxSmall,
          ]}
        >
          <View style={styles.informationIcon}>
            <MaterialCommunityIcons
              name="counter"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.informationTextContainer}>
            <Text style={styles.informationLabel}>
              Cantidad
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {material.cantidad ?? 0}
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

          <View style={styles.informationTextContainer}>
            <Text style={styles.informationLabel}>
              Unidad
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {material.unidad || "Sin unidad"}
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
            onEdit(material.numMaterial)
          }
          activeOpacity={0.8}
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
    width: "100%",
    minHeight: 190,
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
    minHeight: 205,
    padding: 21,
    borderRadius: 20,
  },

  topRow: {
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

  mainToolIconContainer: {
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

  code: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },

  typeBadge: {
    minHeight: 31,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D3EADF",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },

  toolBadge: {
    backgroundColor: "#F3E8FF",
    borderColor: "#E9D5FF",
  },

  typeText: {
    color: "#148248",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 5,
  },

  toolText: {
    color: "#7C3AED",
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EDF1EF",
    marginTop: 15,
    marginBottom: 14,
  },

  informationContainer: {
    flexDirection: "row",
  },

  informationContainerSmall: {
    flexDirection: "column",
  },

  informationBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 61,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F9F7",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginRight: 8,
  },

  informationBoxSmall: {
    width: "100%",
    marginRight: 0,
    marginBottom: 8,
  },

  informationIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  informationTextContainer: {
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

  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },

  editButton: {
    minWidth: 112,
    minHeight: 43,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 12,
    paddingHorizontal: 100,
    paddingVertical: 10,

    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#232323",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  editButtonSmall: {
    width: "100%",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },
});
