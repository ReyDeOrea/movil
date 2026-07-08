import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { FlatList } from "react-native";
import { User } from "../../domain/user";
import UserCard from "./UserCard";

interface Props {
  users: User[];
  onPress: (id: number) => void;
  resetKey?: string;
}

export default function UserList({
  users,
  onPress,
  resetKey = "",
}: Props) {
  const {
    visibleData,
    loadMore,
  } = usePaginatedCards(users, 15, resetKey);

  return (
    <FlatList
      data={visibleData}
      keyExtractor={(item) =>
        item.numUsuario.toString()
      }
      renderItem={({ item }) => (
        <UserCard
          user={item}
          onPress={onPress}
        />
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={7}
      removeClippedSubviews
    />
  );
}