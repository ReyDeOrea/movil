import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { User } from "../../domain/user";

interface Props {
  user: User;
  onPress: (id: number) => void;
}

export default function UserCard({
  user,
  onPress,
}: Props) {
  return (
 <TouchableOpacity
style={styles.card}
onPress={() => onPress(user.numUsuario)}
>

<Text style={styles.title}>
{user.nombre}
</Text>

<Text>
Correo: {user.email}
</Text>

<Text>
Teléfono: {user.telefono}
</Text>

</TouchableOpacity>

);

}


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});