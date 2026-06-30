import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
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
    transparent
  >
    <View style={styles.modalContainer}>

      <View style={styles.modalContent}>

        <View style={styles.iconBox}>

          <FontAwesome6
            name="shield-halved"
            size={70}
            color="#67B346"
          />

        </View>

        <Text style={styles.title}>
          Nueva contraseña
        </Text>

        <Text style={styles.subtitle}>
          Ingresa y confirma tu nueva contraseña
        </Text>

        <View style={styles.inputContainer}>

          <MaterialIcons
            name="password"
            size={22}
            color="#67B346"
          />

          <TextInput
            placeholder="Nueva contraseña"
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />

        </View>

        <View style={styles.inputContainer}>

          <MaterialIcons
            name="password"
            size={22}
            color="#67B346"
          />

          <TextInput
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >

          {
            loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.txtBtn}>
                Actualizar contraseña
              </Text>
            )
          }

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
        >

          <Text style={styles.txtSI}>
            Cancelar
          </Text>

        </TouchableOpacity>

      </View>

    </View>
  </Modal>
);
}

const styles = StyleSheet.create({

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 20,
  },

  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 25,
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
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 25,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 12,
    marginLeft: 8,
  },

  button: {
    backgroundColor: "#67B346",
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 10,
  },

  txtBtn: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelBtn: {
    marginTop: 15,
  },

  txtSI: {
    color: "#8aca6f",
    fontWeight: "bold",
    textAlign: "center",
  },

});