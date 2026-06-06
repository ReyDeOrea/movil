import { FlatList } from "react-native";
import { User } from "../../domain/user";
import UserCard from "./UserCard";

interface Props {
  users: User[];
  onEdit: (id: number) => void;
}

export default function UserList({
  users,
  onEdit,
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
          onEdit={onEdit}
        />
      )}
    />
  );
}