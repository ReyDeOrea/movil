import {
  FontAwesome6,
  MaterialIcons,
} from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    newPass: string,
    confirmPass: string
  ) => void;
}

export default function NewPasswordModal({
  visible,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleSubmit = () => {
    onSubmit(newPassword, confirmPassword);

    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.iconBox}>
                <FontAwesome6
                  name="shield-halved"
                  size={70}
                  color="#148248"
                />
              </View>

              <Text style={styles.title}>
                Nueva contraseña
              </Text>

              <Text style={styles.subtitle}>
                Ingresa y confirma tu nueva
                contraseña
              </Text>

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="password"
                  size={22}
                  color="#148248"
                />

                <TextInput
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  editable={!loading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="password"
                  size={22}
                  color="#148248"
                />

                <TextInput
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator
                      color="#FFFFFF"
                    />

                    <Text style={styles.loadingText}>
                      Actualizando...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.txtBtn}>
                    Actualizar contraseña
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.txtSI}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  scrollContainer: {
    width: "100%",
    maxWidth: 430,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  modalContent: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    padding: 25,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },

  iconBox: {
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 25,
  },

  inputContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E7E4",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
  },

  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 12,
    marginLeft: 8,
  },

  button: {
    minHeight: 52,
    backgroundColor: "#232323",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,

    shadowColor: "#232323",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  txtBtn: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },

  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },

  cancelBtn: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderRadius: 12,
  },

  txtSI: {
    color: "#870C0C",
    fontWeight: "bold",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});