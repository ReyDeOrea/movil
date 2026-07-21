import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

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
  const { width, height } = useWindowDimensions();

  const [numTecnicoExterno] = useState(
    initialNumTecnicoExterno
  );

  const [nombre, setNombre] = useState(
    initialNombre
  );

  const [empresa, setEmpresa] = useState(
    initialEmpresa
  );

  const [telefono, setTelefono] = useState(
    initialTelefono
  );

  const [especialidad, setEspecialidad] =
    useState(initialEspecialidad);

  const isSmallScreen =
    width < 360 || height < 650;

  const isTablet = width >= 700;
  const isLandscape = width > height;

  const useTwoColumns =
    isTablet ||
    (isLandscape && width >= 650);

  const horizontalPadding = isTablet
    ? 30
    : 14;

  const cardWidth = Math.min(
    width - horizontalPadding * 2,
    isTablet ? 620 : 500
  );

  const cardPadding = isSmallScreen
    ? 14
    : isTablet
      ? 24
      : 18;

  const fieldWidth:
    | "48.5%"
    | "100%" = useTwoColumns
    ? "48.5%"
    : "100%";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: isSmallScreen
            ? 18
            : 30,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.card,
          {
            width: cardWidth,
            padding: cardPadding,
            marginTop: isSmallScreen
              ? 4
              : 8,
          },
        ]}
      >

        <View style={styles.fieldsContainer}>
          {showNumero && (
            <View
              style={[
                styles.fieldGroup,
                styles.fullWidthField,
              ]}
            >
              <Text style={styles.label}>
                Número de técnico
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  styles.inputContainerDisabled,
                  isSmallScreen &&
                    styles.inputContainerSmall,
                ]}
              >
                <TextInput
                  placeholder="Número de técnico"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={numTecnicoExterno}
                  editable={false}
                  style={[
                    styles.input,
                    styles.inputDisabled,
                  ]}
                />
              </View>
            </View>
          )}

          <View
            style={[
              styles.fieldGroup,
              {
                width: fieldWidth,
              },
            ]}
          >

            <View
              style={[
                styles.inputContainer,
                isSmallScreen &&
                  styles.inputContainerSmall,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  isSmallScreen &&
                    styles.inputIconSmall,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color="#148248"
                />
              </View>

              <TextInput
                placeholder="Nombre completo"
                placeholderTextColor="#9CA3AF"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View
            style={[
              styles.fieldGroup,
              {
                width: fieldWidth,
              },
            ]}
          >
            <View
              style={[
                styles.inputContainer,
                isSmallScreen &&
                  styles.inputContainerSmall,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  isSmallScreen &&
                    styles.inputIconSmall,
                ]}
              >
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={20}
                  color="#148248"
                />
              </View>

              <TextInput
                placeholder="Empresa"
                placeholderTextColor="#9CA3AF"
                value={empresa}
                onChangeText={setEmpresa}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View
            style={[
              styles.fieldGroup,
              {
                width: fieldWidth,
              },
            ]}
          >

            <View
              style={[
                styles.inputContainer,
                isSmallScreen &&
                  styles.inputContainerSmall,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  isSmallScreen &&
                    styles.inputIconSmall,
                ]}
              >
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color="#148248"
                />
              </View>

              <TextInput
                placeholder="Teléfono"
                placeholderTextColor="#9CA3AF"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                style={styles.input}
                returnKeyType="next"
              />
            </View>
          </View>

          <View
            style={[
              styles.fieldGroup,
              {
                width: fieldWidth,
              },
            ]}
          >
            <View
              style={[
                styles.inputContainer,
                isSmallScreen &&
                  styles.inputContainerSmall,
              ]}
            >
              <View
                style={[
                  styles.inputIcon,
                  isSmallScreen &&
                    styles.inputIconSmall,
                ]}
              >
                <MaterialCommunityIcons
                  name="tools"
                  size={20}
                  color="#148248"
                />
              </View>

              <TextInput
                placeholder="Especialidad"
                placeholderTextColor="#9CA3AF"
                value={especialidad}
                onChangeText={setEspecialidad}
                style={styles.input}
                autoCapitalize="sentences"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isSmallScreen &&
              styles.buttonSmall,
          ]}
          onPress={() =>
            onSubmit(
              Number(
                numTecnicoExterno || 0
              ),
              nombre,
              empresa,
              telefono,
              especialidad
            )
          }
          activeOpacity={0.84}
        >

          <Text style={styles.buttonText}>
            Guardar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cancelButton,
            isSmallScreen &&
              styles.cancelButtonSmall,
          ]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text
            style={styles.cancelButtonText}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },

  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8E5",
    borderRadius: 20,
  },

  titleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  titleIconContainer: {
    width: 66,
    height: 66,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginBottom: 10,

    shadowColor: "#148248",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

  titleIconContainerSmall: {
    width: 58,
    height: 58,
    borderRadius: 17,
    marginBottom: 8,
  },

  title: {
    color: "#1F2937",
    fontWeight: "800",
    lineHeight: 29,
    textAlign: "center",
  },
 label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 3,
    marginBottom: 5,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 2,
  },

  fieldsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  fieldGroup: {
    minWidth: 0,
  },

  fullWidthField: {
    width: "100%",
  },



  inputContainer: {
    width: "100%",
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#DDE5E1",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  inputContainerSmall: {
    minHeight: 47,
    marginBottom: 10,
  },

  inputContainerDisabled: {
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 8,
    flexShrink: 0,
  },

  inputIconSmall: {
    width: 31,
    height: 31,
    borderRadius: 8,
  },

  inputIconDisabled: {
    backgroundColor: "#D8DADC",
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 47,
    color: "#111827",
    fontSize: 14,
    paddingVertical: 6,
  },

  inputDisabled: {
    color: "#6B7280",
  },

  button: {
    width: "100%",
    minHeight: 49,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    marginTop: 3,

    shadowColor: "#232323",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonSmall: {
    minHeight: 46,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 7,
  },

  cancelButton: {
    width: "100%",
    minHeight: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870C0C",
    borderRadius: 12,
    marginTop: 9,

    shadowColor: "#870C0C",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2,
  },

  cancelButtonSmall: {
    minHeight: 42,
  },

  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
});