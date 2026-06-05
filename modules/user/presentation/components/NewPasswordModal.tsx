import { useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (newPass: string, confirmPass: string) => void;
}

export default function NewPasswordModal({ visible, loading, onClose, onSubmit }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(newPassword, confirmPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>

          <Text style={styles.subtitle}>Ingresa tu nueva contraseña</Text>

          <TextInput
            placeholder="Nueva contraseña"
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />

          <TextInput
            placeholder="Confirmar nueva contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.txtBtn}>Actualizar contraseña</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}>
            <Text style={styles.txtSI}>Cancelar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E8B4B4",
    borderRadius: 14,
    padding: 12,
    marginBottom: 15,
    color: "#000"
  },
  button: {
    backgroundColor: "#E5DCCC",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 50,
    marginVertical: 10,
  },
  txtBtn: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  txtSI: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

});