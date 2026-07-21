import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { User } from "../../domain/user";

interface Props {
  user: User;
  onPress: (id: number) => void;
}

export default function UserCard({
  user,
  onPress,
}: Props) {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;
  const isTablet = width >= 700;

  const horizontalMargin = isSmallScreen
    ? 12
    : isTablet
      ? 24
      : 16;

  const cardWidth = Math.min(
    width - horizontalMargin * 2,
    isTablet ? 720 : 640
  );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          padding: isSmallScreen ? 14 : 17,
        },
      ]}
      onPress={() => onPress(user.numUsuario)}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Ver información de ${user.nombre}`}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
            ]}
          >
            {user.nombre}
          </Text>

          <Text style={styles.workerNumber}>
            Número de trabajador: {user.numUsuario}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.informationContainer}>
        <View style={styles.informationRow}>
          <View style={styles.informationIcon}>
            <MaterialCommunityIcons
              name="email-outline"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.informationTextContainer}>
            <Text style={styles.informationLabel}>
              Correo
            </Text>

            <Text
              style={[
                styles.informationText,
                isSmallScreen &&
                  styles.informationTextSmall,
              ]}
            >
              {user.email || "Sin correo registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.informationRow}>
          <View style={styles.informationIcon}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={19}
              color="#148248"
            />
          </View>

          <View style={styles.informationTextContainer}>
            <Text style={styles.informationLabel}>
              Teléfono
            </Text>

            <Text
              style={[
                styles.informationText,
                isSmallScreen &&
                  styles.informationTextSmall,
              ]}
            >
              {user.telefono || "Sin teléfono registrado"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 18,
    marginVertical: 7,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 3,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  title: {
    color: "#1F2937",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },

  titleSmall: {
    fontSize: 16,
    lineHeight: 22,
  },

  workerNumber: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEF1EF",
    marginVertical: 13,
  },

  informationContainer: {
    width: "100%",
  },

  informationRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },

  informationIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8F4",
    flexShrink: 0,
  },

  informationTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  informationLabel: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  informationText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    flexShrink: 1,
  },

  informationTextSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
});

