import { FlatList } from "react-native";
import { User } from "../../domain/user";
import UserCard from "./UserCard";

interface Props {
  users: User[];
  onPress: (id: number) => void;
}

export default function UserList({
  users,
  onPress,
}: Props) {
  return (
    <FlatList
      data={users}
      keyExtractor={(item) =>
        item.numUsuario.toString()
      }
      renderItem={({ item }) => (
        <UserCard
          user={item}
          onPress={onPress}
        />
      )}
    />
  );
}