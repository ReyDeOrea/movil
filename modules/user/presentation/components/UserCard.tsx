import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "../../domain/user";

interface Props {
  user: User;
  onEdit: (id: number) => void;
}

export default function UserCard({
  user,
  onEdit,
}: Props) {
  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        {user.nombre}
      </Text>

      <Text>
        Usuario: {user.numUsuario}
      </Text>

      <Text>
        Correo: {user.email}
      </Text>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(user.numUsuario)}
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
    backgroundColor: "#FFF",
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});